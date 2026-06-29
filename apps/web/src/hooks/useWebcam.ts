import { useRef, useState, useCallback } from 'react';

export const useWebcam = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      console.log('🎥 [1/6] Solicitando acesso à câmera...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      console.log('✅ [2/6] Câmera acessada com sucesso!', stream);
      console.log('📹 [3/6] Stream ativo:', stream.active);
      console.log('🎬 [4/6] Tracks de vídeo:', stream.getVideoTracks());

      if (videoRef.current) {
        console.log('📺 [5/6] Elemento video encontrado:', videoRef.current);
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        console.log('🔄 [5.1/6] Stream atribuído ao elemento video');

        setIsStreaming(true);
        console.log('🚀 [5.2/6] Estado isStreaming definido como true');

        // Aguardar o vídeo carregar antes de marcar como streaming
        videoRef.current.onloadedmetadata = () => {
          console.log('📊 [5.3/6] Evento onloadedmetadata disparado');
          console.log('📐 Dimensões do vídeo:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
        };

        // Tentar reproduzir o vídeo
        console.log('▶️ [6/6] Tentando reproduzir o vídeo...');
        await videoRef.current.play();
        console.log('✅ Vídeo reproduzindo!');
      } else {
        console.error('❌ videoRef.current é null!');
      }
    } catch (err: any) {
      console.error('❌ Erro ao acessar câmera:', err);

      let errorMessage = 'Não foi possível acessar a câmera.';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Câmera está sendo usada por outro aplicativo.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Configurações de câmera não suportadas.';
      } else if (err.name === 'TypeError') {
        errorMessage = 'Navegador não suporta acesso à câmera. Use HTTPS ou localhost.';
      }

      setError(errorMessage);
    }
  }, []);

  const stopCamera = useCallback(() => {
    console.log('🛑 Parando câmera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log('⏹️ Parando track:', track.kind, track.label);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    console.log('✅ Câmera parada');
  }, []);

  const captureImage = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      console.log('📸 Iniciando captura de imagem...');

      if (!videoRef.current) {
        console.error('❌ videoRef.current é null na captura!');
        resolve(null);
        return;
      }

      const video = videoRef.current;
      console.log('📹 Dimensões do vídeo para captura:', video.videoWidth, 'x', video.videoHeight);

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      console.log('🖼️ Canvas criado:', canvas.width, 'x', canvas.height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ Não foi possível obter contexto 2D do canvas');
        resolve(null);
        return;
      }

      ctx.drawImage(video, 0, 0);
      console.log('✅ Imagem desenhada no canvas');

      canvas.toBlob((blob) => {
        if (blob) {
          console.log('✅ Blob criado:', blob.size, 'bytes, tipo:', blob.type);
        } else {
          console.error('❌ Falha ao criar blob');
        }
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  }, []);

  return {
    videoRef,
    isStreaming,
    error,
    startCamera,
    stopCamera,
    captureImage,
  };
};
