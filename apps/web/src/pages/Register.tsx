import { useState } from 'react';
import { peopleApi } from '../services/api';
import { LivenessCapture, type CapturedFrame } from '../components/LivenessCapture';

export const Register = () => {
  const [name, setName] = useState('');
  const [externalId, setExternalId] = useState('');
  const [frames, setFrames] = useState<CapturedFrame[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentImage, setDocumentImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleOpenCamera = () => {
    setFrames([]);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
    setShowCamera(true);
  };

  const handleCaptureComplete = (captured: CapturedFrame[]) => {
    console.log('📸 [Register] Liveness OK, frames:', captured.length);
    setFrames(captured);
    const front = captured.find((f) => f.angle === 'front');
    if (front) setPreviewUrl(URL.createObjectURL(front.blob));
    setShowCamera(false);
  };

  const handleRetake = () => {
    setFrames([]);
    setPreviewUrl(null);
    setShowCamera(true);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setDocumentImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !externalId) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    if (frames.length === 0) {
      setError('Por favor, complete a captura de liveness');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await peopleApi.registerWithLiveness(name, externalId, frames, documentImage);
      if (result.success) {
        setSuccess(`${name} foi cadastrado(a) com sucesso!`);
        setName('');
        setExternalId('');
        setFrames([]);
        setPreviewUrl(null);
        setDocumentImage(null);
      } else {
        setError(result.message || 'Erro ao cadastrar pessoa');
      }
    } catch (err: any) {
      console.error('[Register] erro:', err);
      setError(err.response?.data?.message || 'Erro ao cadastrar pessoa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showCamera && (
        <LivenessCapture
          onComplete={handleCaptureComplete}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Cadastrar Pessoa</h1>
            <p className="page-subtitle">
              Registre uma nova pessoa no sistema de reconhecimento facial
            </p>
          </div>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {success && (
            <div className="alert alert-success">
              <span>✓</span>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span>✕</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome completo"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Matrícula / Identificador</label>
              <input
                type="text"
                className="form-input"
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                placeholder="Digite a matrícula ou identificador único"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Captura Facial (com prova de vida)</label>

              {frames.length === 0 && (
                <div>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={handleOpenCamera}
                  >
                    📸 Iniciar captura guiada
                  </button>
                  <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Vamos capturar 3 ângulos do seu rosto (frente, esquerda, direita) e validar que você está vivo (piscando).
                  </p>
                </div>
              )}

              {frames.length > 0 && previewUrl && (
                <div>
                  <img src={previewUrl} alt="Preview" className="image-preview" style={{ borderRadius: '50%', maxWidth: '300px' }} />
                  <p style={{ marginTop: '0.5rem', color: 'var(--success)', fontSize: '0.875rem' }}>
                    ✓ {frames.length} ângulos capturados, prova de vida validada
                  </p>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleRetake}
                      style={{ flex: 1 }}
                    >
                      🔄 Recapturar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Documento (RG, CNH, etc) - Opcional</label>
              <input
                type="file"
                className="form-input"
                accept="image/*"
                onChange={handleDocumentUpload}
                disabled={loading}
              />
              {documentImage && (
                <p style={{ marginTop: '0.5rem', color: 'var(--success)', fontSize: '0.875rem' }}>
                  ✓ {documentImage.name} selecionado
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-success btn-lg btn-block"
              disabled={loading || frames.length === 0 || !name || !externalId}
            >
              {loading ? (
                <>
                  <span className="loading"></span>
                  Cadastrando...
                </>
              ) : (
                '✓ Cadastrar Pessoa'
              )}
            </button>
          </form>
        </div>
        </div>
      </div>
    </>
  );
};
