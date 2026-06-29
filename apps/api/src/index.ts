import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Importar rotas
import peopleRoutes from './routes/people.routes.js';

// Importar serviços para inicialização
import faceRecognitionService from './services/FaceRecognitionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    const time = new Date().toLocaleTimeString('pt-BR');
    console.log(
      `[api] ${time} ${req.method} ${req.originalUrl} -> ${color}${status}\x1b[0m (${ms}ms)`,
    );
  });
  next();
});

// Servir arquivos estáticos da pasta uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FaceID Lab API is running!',
    timestamp: new Date().toISOString(),
  });
});

// Rotas
app.use('/api/people', peopleRoutes);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Inicializar servidor
async function startServer() {
  try {
    // Carregar modelos de reconhecimento facial
    console.log('📦 Carregando modelos de reconhecimento facial...');
    await faceRecognitionService.loadModels();

    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📸 FaceID Lab API ready!\n`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
