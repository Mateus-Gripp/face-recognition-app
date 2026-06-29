export const About = () => {
  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Sobre o Projeto</h1>
          <p className="page-subtitle">
            Entenda como funciona o reconhecimento facial e visão computacional
          </p>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
              🤖 O que é Visão Computacional?
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
              Visão computacional é um campo da inteligência artificial que permite aos
              computadores "enxergar" e interpretar informações visuais do mundo real, como
              imagens e vídeos. Através de algoritmos complexos, os sistemas conseguem detectar
              padrões, reconhecer objetos e até mesmo identificar pessoas.
            </p>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
              👤 Como Funciona o Reconhecimento Facial?
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              O reconhecimento facial é um processo em várias etapas que transforma um rosto em
              dados matemáticos únicos:
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div
                style={{
                  background: 'var(--bg)',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  borderLeft: '4px solid var(--primary)',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                  1. 📸 Captura da Imagem
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  O processo começa com a captura de uma foto através da câmera. A qualidade e
                  iluminação da imagem são fundamentais para um bom resultado.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg)',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  borderLeft: '4px solid var(--primary)',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                  2. 🎯 Detecção de Rosto
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Algoritmos especializados (como SSD MobileNet) localizam a região do rosto na
                  imagem, identificando sua posição e dimensões. Este passo garante que apenas
                  rostos válidos sejam processados.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg)',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  borderLeft: '4px solid var(--primary)',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                  3. 📍 Mapeamento de Pontos Faciais
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  São identificados 68 pontos de referência no rosto (landmarks), como cantos dos
                  olhos, nariz, boca e contorno facial. Esses pontos ajudam a normalizar a imagem
                  para diferentes ângulos e expressões.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg)',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  borderLeft: '4px solid var(--primary)',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                  4. 🧬 Geração do Descritor Facial
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Uma rede neural converte o rosto em um vetor matemático de 128 dimensões (o
                  "descritor"). Este vetor captura as características únicas do rosto de forma
                  compacta e comparável.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg)',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  borderLeft: '4px solid var(--primary)',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                  5. 🔍 Comparação e Identificação
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  O descritor gerado é comparado com todos os descriptors armazenados no banco de
                  dados usando distância euclidiana. A pessoa com menor distância (maior
                  similaridade) é identificada, desde que a confiança seja alta o suficiente.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
              📊 Precisão e Confiança
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
              O sistema calcula um percentual de confiança baseado na similaridade entre os
              descriptors. Valores acima de 80% indicam alta confiança na identificação. O
              threshold (limiar) padrão do sistema é configurável e determina quando uma
              identificação é aceita.
            </p>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
              ⚖️ Considerações Éticas e de Privacidade
            </h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '1rem' }}>
                O uso de reconhecimento facial deve sempre respeitar princípios éticos e legais:
              </p>
              <ul
                style={{
                  listStyle: 'disc',
                  paddingLeft: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <li>
                  <strong>Consentimento:</strong> Todas as pessoas devem consentir explicitamente
                  com o cadastramento de seus dados biométricos.
                </li>
                <li>
                  <strong>Proteção de Dados:</strong> As imagens e descriptors devem ser
                  armazenados de forma segura, protegidos contra acessos não autorizados.
                </li>
                <li>
                  <strong>Transparência:</strong> Os usuários devem ser informados sobre como seus
                  dados são coletados, armazenados e utilizados.
                </li>
                <li>
                  <strong>Direito ao Esquecimento:</strong> Pessoas devem poder solicitar a
                  remoção de seus dados a qualquer momento.
                </li>
                <li>
                  <strong>Finalidade Específica:</strong> Os dados devem ser usados apenas para os
                  fins declarados e autorizados.
                </li>
                <li>
                  <strong>Não Discriminação:</strong> O sistema deve ser testado e auditado para
                  garantir que não haja viés racial, de gênero ou outros tipos de discriminação.
                </li>
              </ul>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
              🛠️ Tecnologias Utilizadas
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '0.5rem' }}>
                <strong style={{ color: 'var(--primary)' }}>Frontend</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  React + TypeScript + Vite
                </p>
              </div>
              <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '0.5rem' }}>
                <strong style={{ color: 'var(--primary)' }}>Backend</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Node.js + Express + TypeScript
                </p>
              </div>
              <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '0.5rem' }}>
                <strong style={{ color: 'var(--primary)' }}>Banco de Dados</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  SQLite + Prisma ORM
                </p>
              </div>
              <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '0.5rem' }}>
                <strong style={{ color: 'var(--primary)' }}>IA</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  face-api.js (TensorFlow.js)
                </p>
              </div>
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
              💡 Este é um projeto educacional
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Desenvolvido para demonstrar conceitos de visão computacional, aprendizado de
              máquina e desenvolvimento full-stack. Sempre utilize tecnologias de reconhecimento
              facial de forma ética e responsável.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
