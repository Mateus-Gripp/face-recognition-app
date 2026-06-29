import { Router } from 'express';
import peopleController from '../controllers/PeopleController.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Registrar uma nova pessoa (aceita foto facial e documento opcional)
router.post('/register', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]), (req, res) =>
  peopleController.register(req, res)
);

// Registrar com prova de vida (3 frames + descriptors)
router.post('/register-liveness', upload.fields([
  { name: 'frame_0_image', maxCount: 1 },
  { name: 'frame_1_image', maxCount: 1 },
  { name: 'frame_2_image', maxCount: 1 },
  { name: 'document', maxCount: 1 },
]), (req, res) => peopleController.registerWithLiveness(req, res));

// Identificar uma pessoa
router.post('/identify', upload.single('image'), (req, res) =>
  peopleController.identify(req, res)
);

// Listar todas as pessoas
router.get('/', (req, res) => peopleController.list(req, res));

// Buscar pessoa por ID
router.get('/:id', (req, res) => peopleController.getById(req, res));

export default router;
