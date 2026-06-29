import { faceapi } from './faceapi-loader'

export interface FrameAnalysis {
  hasFace: boolean
  yaw: number
  ear: number
  descriptor: Float32Array | null
  faceSize: number
}

const dist = (a: faceapi.Point, b: faceapi.Point) => Math.hypot(a.x - b.x, a.y - b.y)

function singleEyeEAR(eye: faceapi.Point[]): number {
  const a = dist(eye[1], eye[5])
  const b = dist(eye[2], eye[4])
  const c = dist(eye[0], eye[3])
  return c === 0 ? 0 : (a + b) / (2 * c)
}

function computeEAR(landmarks: faceapi.FaceLandmarks68): number {
  return (singleEyeEAR(landmarks.getLeftEye()) + singleEyeEAR(landmarks.getRightEye())) / 2
}

function estimateYaw(landmarks: faceapi.FaceLandmarks68): number {
  const nose = landmarks.getNose()[3]
  const jaw = landmarks.getJawOutline()
  const leftCheek = jaw[0]
  const rightCheek = jaw[16]
  const total = rightCheek.x - leftCheek.x
  if (total <= 0) return 0
  const ratio = (nose.x - leftCheek.x) / total
  return (ratio - 0.5) * 180
}

function faceSize(landmarks: faceapi.FaceLandmarks68): number {
  const jaw = landmarks.getJawOutline()
  return dist(jaw[0], jaw[16])
}

export async function analyzeFrame(
  source: HTMLVideoElement | HTMLCanvasElement,
): Promise<FrameAnalysis> {
  const detection = await faceapi
    .detectSingleFace(source, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor()

  if (!detection) {
    return { hasFace: false, yaw: 0, ear: 0, descriptor: null, faceSize: 0 }
  }

  return {
    hasFace: true,
    yaw: estimateYaw(detection.landmarks),
    ear: computeEAR(detection.landmarks),
    descriptor: detection.descriptor,
    faceSize: faceSize(detection.landmarks),
  }
}

export function descriptorDistance(a: Float32Array, b: Float32Array): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i]
    sum += d * d
  }
  return Math.sqrt(sum)
}

export const POSE = {
  FRONT_MAX_YAW: 12,
  TURN_MIN_YAW: 22,
  BLINK_EAR_THRESHOLD: 0.23,
  EAR_OPEN_THRESHOLD: 0.26,
  SAME_PERSON_MAX_DIST: 0.5,
}
