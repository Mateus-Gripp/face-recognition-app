import { useEffect, useRef, useState } from 'react'
import { loadFaceModels } from '../lib/faceapi-loader'
import { analyzeFrame, descriptorDistance, POSE, type FrameAnalysis } from '../lib/liveness'
import { checkAntispoofModel } from '../lib/antispoof'

export interface CapturedFrame {
  angle: 'front' | 'left' | 'right'
  blob: Blob
  descriptor: number[]
}

interface Props {
  onComplete: (frames: CapturedFrame[]) => void
  onClose: () => void
  mode?: 'register' | 'identify'
}

type Phase = 'loading' | 'ready' | 'capturing' | 'analyzing' | 'done' | 'failed'

const CAPTURE_MS = 12000
const MIN_FRAMES_REQUIRED = 15
const MIN_VALID_FRACTION = 0.6
const MIN_YAW_RANGE_DEG = 1.5
const MAX_YAW_RANGE_DEG = 18
const TURN_TARGET_YAW_DEG = 8

interface CollectedFrame {
  t: number
  yaw: number
  ear: number
  descriptor: Float32Array
  blob: Blob
}

const cropFaceBlob = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  box: NonNullable<FrameAnalysis['box']>,
): Promise<Blob | null> => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const sourceWidth = video.videoWidth
  const sourceHeight = video.videoHeight

  const marginX = box.width * 0.35
  const marginTop = box.height * 0.45
  const marginBottom = box.height * 0.3

  const sx = Math.max(0, Math.floor(box.x - marginX))
  const sy = Math.max(0, Math.floor(box.y - marginTop))
  const sw = Math.min(sourceWidth - sx, Math.ceil(box.width + marginX * 2))
  const sh = Math.min(sourceHeight - sy, Math.ceil(box.height + marginTop + marginBottom))

  canvas.width = sw
  canvas.height = sh
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh)

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.94))
}

export const LivenessCapture = ({ onComplete, onClose, mode = 'register' }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const startTsRef = useRef<number>(0)
  const collectedRef = useRef<CollectedFrame[]>([])
  const totalAnalyzedRef = useRef<number>(0)
  const faceDetectedRef = useRef<number>(0)
  const phaseRef = useRef<Phase>('loading')
  const sawLeftRef = useRef<boolean>(false)
  const sawRightRef = useRef<boolean>(false)

  const [phase, setPhase] = useState<Phase>('loading')
  const [statusText, setStatusText] = useState('Carregando modelos…')
  const [progress, setProgress] = useState({
    timeLeftMs: CAPTURE_MS,
    framesCollected: 0,
    faceFrames: 0,
    facePresent: false,
    yaw: 0,
    leftDone: false,
    rightDone: false,
    headState: 'centralizado',
  })
  const [failureReason, setFailureReason] = useState<string | null>(null)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        await loadFaceModels()
        if (cancelled) return
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setPhase('ready')
          setStatusText(
            mode === 'identify'
              ? 'Pronto. Quando clicar em "Iniciar", valide sua prova de vida olhando para a câmera.'
              : 'Pronto. Quando clicar em "Iniciar", olhe pra câmera e mantenha o rosto centralizado.'
          )
        }
      } catch (err) {
        console.error('[liveness] init error', err)
        setFailureReason('Não foi possível acessar a câmera ou carregar os modelos.')
        setPhase('failed')
      }
    }
    init()
    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const grabFrameBlob = async (analysis: FrameAnalysis): Promise<Blob | null> => {
    if (!videoRef.current || !canvasRef.current) return null
    const video = videoRef.current
    const canvas = canvasRef.current
    if (analysis.box) {
      return cropFaceBlob(video, canvas, analysis.box)
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92))
  }

  const startCapture = () => {
    collectedRef.current = []
    totalAnalyzedRef.current = 0
    faceDetectedRef.current = 0
    sawLeftRef.current = false
    sawRightRef.current = false
    setFailureReason(null)
    setProgress({
      timeLeftMs: CAPTURE_MS,
      framesCollected: 0,
      faceFrames: 0,
      facePresent: false,
      yaw: 0,
      leftDone: false,
      rightDone: false,
      headState: 'centralizado',
    })
    setStatusText('Olhe pra câmera, vire a cabeça para a esquerda e para a direita, e volte ao centro')
    startTsRef.current = performance.now()
    setPhase('capturing')
    captureLoop()
  }

  const captureLoop = () => {
    const tick = async () => {
      if (phaseRef.current !== 'capturing') return
      if (!videoRef.current || videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const elapsed = performance.now() - startTsRef.current
      const a: FrameAnalysis = await analyzeFrame(videoRef.current)
      totalAnalyzedRef.current++
      if (a.hasFace) {
        faceDetectedRef.current++
      }

      let headState = 'sem rosto'

      if (a.hasFace) {
        if (a.yaw <= -TURN_TARGET_YAW_DEG) {
          sawLeftRef.current = true
          headState = 'virado para a esquerda'
        } else if (a.yaw >= TURN_TARGET_YAW_DEG) {
          sawRightRef.current = true
          headState = 'virado para a direita'
        } else {
          headState = 'centralizado'
        }

        if (sawLeftRef.current && sawRightRef.current) {
          setStatusText('Movimentos validados. Volte ao centro e mantenha o rosto estável até finalizar.')
        } else if (sawLeftRef.current) {
          setStatusText('Esquerda validada. Agora vire a cabeça para a direita.')
        } else if (sawRightRef.current) {
          setStatusText('Direita validada. Agora vire a cabeça para a esquerda.')
        }
      }

      if (a.hasFace) {
        if (
          Math.abs(a.yaw) <= POSE.FRONT_MAX_YAW &&
          a.descriptor &&
          a.faceSize > 80
        ) {
          const blob = await grabFrameBlob(a)
          if (blob) {
            collectedRef.current.push({ t: elapsed, yaw: a.yaw, ear: a.ear, descriptor: a.descriptor, blob })
          }
        }
      }

      setProgress({
        timeLeftMs: Math.max(0, CAPTURE_MS - elapsed),
        framesCollected: collectedRef.current.length,
        faceFrames: faceDetectedRef.current,
        facePresent: a.hasFace,
        yaw: a.yaw,
        leftDone: sawLeftRef.current,
        rightDone: sawRightRef.current,
        headState,
      })

      if (elapsed >= CAPTURE_MS) {
        setPhase('analyzing')
        setStatusText('Analisando captura…')
        finalizeCapture()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const finalizeCapture = async () => {
    const collected = collectedRef.current
    const total = totalAnalyzedRef.current
    const faceFrames = faceDetectedRef.current

    if (collected.length < MIN_FRAMES_REQUIRED) {
      fail(`Poucos frames válidos (${collected.length}). Mantenha o rosto centralizado na câmera.`)
      return
    }
    if (faceFrames / Math.max(1, total) < MIN_VALID_FRACTION) {
      fail(`Rosto saiu do quadro com frequência (${faceFrames}/${total} frames com rosto detectado).`)
      return
    }
    if (!sawLeftRef.current || !sawRightRef.current) {
      fail('Nao detectamos os movimentos completos de esquerda e direita. Vire a cabeça para os dois lados e volte ao centro.')
      return
    }
    const yaws = collected.map((c) => c.yaw)
    const yawRange = Math.max(...yaws) - Math.min(...yaws)
    if (yawRange < MIN_YAW_RANGE_DEG) {
      fail(`Sem variação natural de pose (range=${yawRange.toFixed(1)}°). Suspeita de foto estática.`)
      return
    }
    if ((!sawLeftRef.current || !sawRightRef.current) && yawRange > MAX_YAW_RANGE_DEG) {
      fail(`Você se moveu muito (range=${yawRange.toFixed(1)}°). Mantenha o rosto centralizado.`)
      return
    }

    const descs = collected.map((c) => c.descriptor)
    const ref = descs[0]
    const maxDist = Math.max(...descs.slice(1).map((d) => descriptorDistance(ref, d)))
    if (maxDist > POSE.SAME_PERSON_MAX_DIST) {
      fail(`Descriptors inconsistentes entre frames (max dist=${maxDist.toFixed(2)}).`)
      return
    }
    const meanDist =
      descs.slice(1).reduce((acc, d) => acc + descriptorDistance(ref, d), 0) / (descs.length - 1)
    if (meanDist < 0.005) {
      fail('Frames idênticos pixel-a-pixel (suspeita de imagem estática).')
      return
    }

    const picks = pickThreeFrames(collected)

    const antispoof = await checkAntispoofModel(picks[0].blob)
    if (!antispoof.passed) {
      fail(`Modelo de anti-spoof rejeitou: ${antispoof.reason}`)
      return
    }

    const frames: CapturedFrame[] = picks.map((p) => ({
      angle: 'front',
      blob: p.blob,
      descriptor: Array.from(p.descriptor),
    }))
    setPhase('done')
    onComplete(frames)
  }

  const pickThreeFrames = (frames: CollectedFrame[]): CollectedFrame[] => {
    if (frames.length <= 3) return frames
    const sorted = [...frames].sort((a, b) => a.t - b.t)
    const first = sorted[0]
    const middle = sorted[Math.floor(sorted.length / 2)]
    const last = sorted[sorted.length - 1]
    return [first, middle, last]
  }

  const fail = (reason: string) => {
    console.warn('[liveness] failed:', reason)
    setFailureReason(reason)
    setPhase('failed')
  }

  const close = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    onClose()
  }

  const tryAgain = () => {
    setFailureReason(null)
    setPhase('ready')
    setStatusText(
      mode === 'identify'
        ? 'Pronto. Quando clicar em "Iniciar", valide sua prova de vida olhando para a câmera.'
        : 'Pronto. Quando clicar em "Iniciar", olhe pra câmera e mantenha o rosto centralizado.'
    )
    setProgress((prev) => ({
      ...prev,
      framesCollected: 0,
      faceFrames: 0,
      yaw: 0,
      leftDone: false,
      rightDone: false,
      headState: 'centralizado',
    }))
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{ position: 'relative', maxWidth: 640, width: '100%' }}>
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            width: '100%',
            borderRadius: 12,
            transform: 'scaleX(-1)',
            background: '#000',
          }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.38)',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '52%',
              aspectRatio: '0.82 / 1',
              borderRadius: '999px',
              border: `3px solid ${progress.facePresent ? '#22c55e' : 'rgba(255,255,255,0.7)'}`,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.34)',
              background: 'transparent',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '8px 14px',
              borderRadius: 999,
              background: 'rgba(15, 23, 42, 0.82)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              textAlign: 'center',
              maxWidth: '80%',
            }}
          >
            Posicione o rosto dentro do oval e mantenha-o centralizado
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Chip ok={progress.facePresent} label={progress.facePresent ? 'rosto ✓' : 'sem rosto'} />
          <Chip
            ok={progress.framesCollected >= MIN_FRAMES_REQUIRED}
            label={`${progress.framesCollected} frames centrais`}
          />
          <Chip ok={progress.faceFrames >= MIN_FRAMES_REQUIRED} label={`${progress.faceFrames} frames com rosto`} />
          <Chip ok={progress.leftDone} label={progress.leftDone ? 'esquerda ✓' : 'esquerda'} />
          <Chip ok={progress.rightDone} label={progress.rightDone ? 'direita ✓' : 'direita'} />
          <Chip ok={Math.abs(progress.yaw) >= TURN_TARGET_YAW_DEG} label={`yaw ${progress.yaw.toFixed(1)}°`} />
          <Chip ok={progress.headState !== 'sem rosto'} label={progress.headState} />
          {phase === 'capturing' && (
            <Chip ok={false} label={`${(progress.timeLeftMs / 1000).toFixed(1)}s`} />
          )}
        </div>
      </div>

      <div style={{ color: '#fff', marginTop: 24, textAlign: 'center', maxWidth: 640 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>{statusText}</h2>
        {phase === 'failed' && failureReason && (
          <p style={{ marginTop: 8, color: '#fca5a5' }}>{failureReason}</p>
        )}
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {phase === 'ready' && (
          <button className="btn btn-primary" onClick={startCapture}>
            ▶ Iniciar captura
          </button>
        )}
        {phase === 'failed' && (
          <button className="btn btn-primary" onClick={tryAgain}>
            Tentar novamente
          </button>
        )}
        <button className="btn btn-secondary" onClick={close}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

const Chip = ({ ok, label }: { ok: boolean; label: string }) => (
  <span
    style={{
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      background: ok ? '#16a34a' : 'rgba(255,255,255,0.2)',
      color: '#fff',
    }}
  >
    {label}
  </span>
)
