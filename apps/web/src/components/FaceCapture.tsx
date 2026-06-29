import { useRef, useState, useEffect } from 'react';

interface FaceCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export const FaceCapture = ({ onCapture, onClose }: FaceCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Desenha o overlay elíptico
  useEffect(() => {
    if (!overlayCanvasRef.current || !isReady) return;

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensões do canvas
    canvas.width = 640;
    canvas.height = 480;

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Escurece tudo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Define a elipse central (área do rosto)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radiusX = 180; // Largura da elipse
    const radiusY = 220; // Altura da elipse

    // Cria um "buraco" elíptico transparente
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Desenha a borda da elipse
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Adiciona texto de instrução
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText('Posicione seu rosto dentro da elipse', centerX, 50);

    // Limpa shadow para próximos desenhos
    ctx.shadowBlur = 0;
  }, [isReady]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);

        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsReady(true);
        };
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsReady(false);
  };

  const handleCapture = () => {
    // Inicia contagem regressiva
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          capturePhoto();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensões do canvas
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    // Desenha o vídeo no canvas
    ctx.drawImage(video, 0, 0, width, height);

    // Parâmetros da elipse
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusX = (width * 0.35); // 35% da largura
    const radiusY = (height * 0.55); // 55% da altura

    // Cria um canvas temporário para o crop elíptico
    const tempCanvas = document.createElement('canvas');
    const tempWidth = radiusX * 2;
    const tempHeight = radiusY * 2;
    tempCanvas.width = tempWidth;
    tempCanvas.height = tempHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Desenha a elipse como máscara
    tempCtx.beginPath();
    tempCtx.ellipse(tempWidth / 2, tempHeight / 2, radiusX, radiusY, 0, 0, Math.PI * 2);
    tempCtx.clip();

    // Desenha a imagem cortada
    tempCtx.drawImage(
      canvas,
      centerX - radiusX,
      centerY - radiusY,
      tempWidth,
      tempHeight,
      0,
      0,
      tempWidth,
      tempHeight
    );

    // Converte para blob
    tempCanvas.toBlob((blob) => {
      if (blob) {
        console.log('📸 Foto capturada com crop elíptico:', blob.size, 'bytes');
        onCapture(blob);
        stopCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{ position: 'relative' }}>
        {/* Vídeo da câmera */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '640px',
            height: '480px',
            borderRadius: '12px',
            display: isReady ? 'block' : 'none',
          }}
        />

        {/* Canvas overlay com elipse */}
        <canvas
          ref={overlayCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '640px',
            height: '480px',
            pointerEvents: 'none',
            display: isReady ? 'block' : 'none',
          }}
        />

        {/* Canvas oculto para captura */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {/* Contagem regressiva */}
        {countdown !== null && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '120px',
            fontWeight: 'bold',
            color: '#00ff00',
            textShadow: '0 0 20px rgba(0, 255, 0, 0.8)',
            animation: 'pulse 0.5s ease-in-out',
          }}>
            {countdown}
          </div>
        )}

        {/* Loading */}
        {!isReady && (
          <div style={{
            color: 'white',
            fontSize: '18px',
            textAlign: 'center',
          }}>
            Iniciando câmera...
          </div>
        )}
      </div>

      {/* Botões */}
      <div style={{
        marginTop: '2rem',
        display: 'flex',
        gap: '1rem',
      }}>
        <button
          onClick={handleCapture}
          disabled={!isReady || countdown !== null}
          className="btn btn-primary btn-lg"
          style={{ minWidth: '200px' }}
        >
          {countdown !== null ? 'Capturando...' : '📷 Capturar Foto'}
        </button>
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="btn btn-secondary btn-lg"
        >
          ✕ Cancelar
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }
      `}</style>
    </div>
  );
};
