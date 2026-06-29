import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">FaceID Lab</h1>
          <p className="page-subtitle">
            Sistema inteligente de reconhecimento facial para identificação e cadastro
          </p>
        </div>

        <div className="grid grid-2">
          <Link to="/register" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card">
              <div className="card-header">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
                <h2 className="card-title">Cadastrar Pessoa</h2>
                <p className="card-description">
                  Registre uma nova pessoa no sistema usando reconhecimento facial
                </p>
              </div>
              <div>
                <ul style={{ listStyle: 'none', color: 'var(--text-secondary)' }}>
                  <li>✓ Captura via webcam</li>
                  <li>✓ Detecção automática de rosto</li>
                  <li>✓ Armazenamento seguro</li>
                </ul>
              </div>
            </div>
          </Link>

          <Link to="/identify" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card">
              <div className="card-header">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <h2 className="card-title">Identificar Pessoa</h2>
                <p className="card-description">
                  Identifique uma pessoa cadastrada através do reconhecimento facial
                </p>
              </div>
              <div>
                <ul style={{ listStyle: 'none', color: 'var(--text-secondary)' }}>
                  <li>✓ Identificação rápida</li>
                  <li>✓ Alta precisão</li>
                  <li>✓ Percentual de confiança</li>
                </ul>
              </div>
            </div>
          </Link>
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
              ℹ️ Como funciona?
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Nosso sistema utiliza algoritmos avançados de visão computacional para detectar,
              analisar e comparar características faciais únicas. Cada rosto é convertido em um
              "descritor" matemático que permite identificações precisas e rápidas.
            </p>
            <Link to="/about" style={{ marginTop: '1rem', display: 'inline-block' }}>
              <button className="btn btn-secondary">Saiba mais</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
