import { useState } from 'react';
import { peopleApi } from '../services/api';
import { FaceCapture } from '../components/FaceCapture';
import type { IdentifyResult } from '../types';

export const Identify = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleOpenCamera = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setError(null);
    setResult(null);
    setShowCamera(true);
  };

  const handleCapture = (blob: Blob) => {
    const imageUrl = URL.createObjectURL(blob);
    setCapturedImage(imageUrl);
    setCapturedBlob(blob);
    setShowCamera(false);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setResult(null);
    setShowCamera(true);
  };

  const handleIdentify = async () => {
    if (!capturedBlob) {
      setError('Por favor, capture uma foto primeiro');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiResult = await peopleApi.identify(capturedBlob);

      if (apiResult.success && apiResult.data) {
        setResult(apiResult.data);
      } else {
        setError('Nenhuma pessoa reconhecida. Tente novamente ou verifique o cadastro.');
      }
    } catch (err: any) {
      console.error('Erro ao identificar:', err);

      if (err.response?.status === 404) {
        setError('Pessoa não encontrada no sistema. Por favor, cadastre-se primeiro.');
      } else {
        setError(
          err.response?.data?.message || 'Erro ao identificar pessoa. Tente novamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'var(--success)';
    if (confidence >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <>
      {/* Modal de Captura de Foto */}
      {showCamera && (
        <FaceCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Identificar Pessoa</h1>
            <p className="page-subtitle">
              Use o reconhecimento facial para identificar uma pessoa cadastrada
            </p>
          </div>

          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {error && (
              <div className="alert alert-error">
                <span>✕</span>
                <span>{error}</span>
              </div>
            )}

            {!result && (
              <>
                {!capturedImage && (
                  <div>
                    <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                      Clique no botão abaixo para capturar sua foto
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary btn-lg btn-block"
                      onClick={handleOpenCamera}
                    >
                      📸 Capturar Foto Facial
                    </button>
                  </div>
                )}

                {capturedImage && !result && (
                <div>
                  <img src={capturedImage} alt="Preview" className="image-preview" />
                  <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleRetake}
                      style={{ flex: 1 }}
                      disabled={loading}
                    >
                      🔄 Tirar Novamente
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleIdentify}
                      style={{ flex: 2 }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="loading"></span>
                          Identificando...
                        </>
                      ) : (
                        '🔍 Identificar'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {result && (
            <div className="result-card">
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                ✓ Pessoa Identificada!
              </h2>

              {result.imagePath && (
                <img
                  src={`http://localhost:5000/${result.imagePath}`}
                  alt={result.name}
                  className="result-avatar"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}

              <div className="result-name">{result.name}</div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                ID: {result.externalId}
              </div>

              <div
                className="result-confidence"
                style={{ color: getConfidenceColor(result.confidence) }}
              >
                {result.confidence}% de confiança
              </div>

              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => {
                    setResult(null);
                    setCapturedImage(null);
                    setCapturedBlob(null);
                    setError(null);
                  }}
                >
                  🔍 Identificar Outra Pessoa
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
};
