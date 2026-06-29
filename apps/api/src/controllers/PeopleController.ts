import { Request, Response } from 'express';
import peopleService from '../services/PeopleService.js';
import fs from 'fs/promises';

export class PeopleController {
  /**
   * POST /api/people/register
   * Registra uma nova pessoa
   */
  async register(req: Request, res: Response): Promise<void> {
    // Suporta tanto req.file quanto req.files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const imageFile = files?.image?.[0] || req.file;
    const documentFile = files?.document?.[0];

    try {
      const { name, externalId } = req.body;

      if (!name || !externalId) {
        res.status(400).json({
          success: false,
          message: 'Nome e identificador são obrigatórios',
        });
        return;
      }

      if (!imageFile) {
        res.status(400).json({
          success: false,
          message: 'Imagem facial é obrigatória',
        });
        return;
      }

      const imageBuffer = await fs.readFile(imageFile.path);

      const person = await peopleService.registerPerson({
        name,
        externalId,
        imageBuffer,
        imagePath: imageFile.path,
        documentPath: documentFile?.path,
      });

      res.status(201).json({
        success: true,
        message: 'Pessoa cadastrada com sucesso!',
        data: {
          id: person.id,
          name: person.name,
          externalId: person.externalId,
          createdAt: person.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Erro ao registrar pessoa:', error);

      // Remove as imagens se houve erro
      if (imageFile) {
        try {
          await fs.unlink(imageFile.path);
        } catch (unlinkError) {
          console.error('Erro ao deletar imagem facial:', unlinkError);
        }
      }
      if (documentFile) {
        try {
          await fs.unlink(documentFile.path);
        } catch (unlinkError) {
          console.error('Erro ao deletar documento:', unlinkError);
        }
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao cadastrar pessoa',
      });
    }
  }

  /**
   * POST /api/people/register-liveness
   * Registra uma pessoa após captura guiada com prova de vida (3 frames)
   */
  async registerWithLiveness(req: Request, res: Response): Promise<void> {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const documentFile = files?.document?.[0];
    const collectedFiles: Express.Multer.File[] = [];
    if (documentFile) collectedFiles.push(documentFile);

    try {
      const { name, externalId, framesCount } = req.body;
      if (!name || !externalId) {
        res.status(400).json({ success: false, message: 'Nome e identificador são obrigatórios' });
        return;
      }
      const count = parseInt(framesCount, 10);
      if (count !== 3) {
        res.status(400).json({ success: false, message: 'Esperado exatamente 3 frames' });
        return;
      }

      const frames = [];
      for (let i = 0; i < count; i++) {
        const file = files?.[`frame_${i}_image`]?.[0];
        const angle = req.body[`frame_${i}_angle`];
        const descriptorJson = req.body[`frame_${i}_descriptor`];
        if (!file || !angle || !descriptorJson) {
          res.status(400).json({ success: false, message: `Frame ${i} incompleto` });
          return;
        }
        collectedFiles.push(file);
        const clientDescriptor = JSON.parse(descriptorJson);
        if (!Array.isArray(clientDescriptor) || clientDescriptor.length !== 128) {
          res.status(400).json({ success: false, message: `Descriptor inválido no frame ${i}` });
          return;
        }
        const imageBuffer = await fs.readFile(file.path);
        frames.push({
          angle: (angle || 'front') as 'front' | 'left' | 'right',
          imagePath: file.path,
          imageBuffer,
          clientDescriptor,
        });
      }

      const person = await peopleService.registerPersonWithLiveness({
        name,
        externalId,
        frames,
        documentPath: documentFile?.path,
      });

      res.status(201).json({
        success: true,
        message: 'Pessoa cadastrada com sucesso (com prova de vida)!',
        data: {
          id: person.id,
          name: person.name,
          externalId: person.externalId,
          createdAt: person.createdAt,
          livenessValidated: person.livenessValidated,
        },
      });
    } catch (error: any) {
      console.error('Erro ao registrar pessoa (liveness):', error);
      // Em erro, garante cleanup dos arquivos que ainda existirem (service já tenta limpar os dele)
      for (const f of collectedFiles) {
        await fs.unlink(f.path).catch(() => {});
      }
      res.status(400).json({ success: false, message: error.message || 'Erro ao cadastrar pessoa' });
    }
  }

  /**
   * POST /api/people/identify
   * Identifica uma pessoa pela imagem
   */
  async identify(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Imagem é obrigatória',
        });
        return;
      }

      const imageBuffer = await fs.readFile(req.file.path);
      const threshold = parseFloat(process.env.FACE_RECOGNITION_THRESHOLD || '0.5');

      const result = await peopleService.identifyPerson(imageBuffer, threshold);

      // Remove a imagem temporária
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Erro ao deletar imagem temporária:', unlinkError);
      }

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Nenhuma pessoa reconhecida',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: result.person.id,
          name: result.person.name,
          externalId: result.person.externalId,
          confidence: result.confidence,
          similarity: result.similarity,
          imagePath: result.person.imagePath,
        },
      });
    } catch (error: any) {
      console.error('Erro ao identificar pessoa:', error);

      // Remove a imagem temporária em caso de erro
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Erro ao deletar imagem temporária:', unlinkError);
        }
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao identificar pessoa',
      });
    }
  }

  /**
   * GET /api/people
   * Lista todas as pessoas cadastradas
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const people = await peopleService.listPeople();

      res.json({
        success: true,
        data: people.map((person) => ({
          id: person.id,
          name: person.name,
          externalId: person.externalId,
          createdAt: person.createdAt,
        })),
      });
    } catch (error: any) {
      console.error('Erro ao listar pessoas:', error);

      res.status(500).json({
        success: false,
        message: 'Erro ao listar pessoas',
      });
    }
  }

  /**
   * GET /api/people/:id
   * Busca uma pessoa por ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const person = await peopleService.getPersonById(id);

      if (!person) {
        res.status(404).json({
          success: false,
          message: 'Pessoa não encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: person.id,
          name: person.name,
          externalId: person.externalId,
          createdAt: person.createdAt,
          updatedAt: person.updatedAt,
        },
      });
    } catch (error: any) {
      console.error('Erro ao buscar pessoa:', error);

      res.status(500).json({
        success: false,
        message: 'Erro ao buscar pessoa',
      });
    }
  }
}

export default new PeopleController();
