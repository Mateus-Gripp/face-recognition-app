import { PrismaClient, Person } from '@prisma/client';
import faceRecognitionService from './FaceRecognitionService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

export interface RegisterPersonData {
  name: string;
  externalId: string;
  imageBuffer: Buffer;
  imagePath: string;
  documentPath?: string;
}

export interface LivenessFrameInput {
  angle: 'front' | 'left' | 'right';
  imagePath: string;
  imageBuffer: Buffer;
  clientDescriptor: number[];
}

export interface RegisterPersonLivenessData {
  name: string;
  externalId: string;
  frames: LivenessFrameInput[];
  documentPath?: string;
}

export interface IdentifyResult {
  person: Person;
  confidence: number;
  similarity: number;
}

const MAX_CLIENT_SERVER_DESCRIPTOR_DIST = 0.45;
const MAX_INTRA_PERSON_DIST = 0.55;
const MIN_VARIATION_BETWEEN_ANGLES = 0.05;
const DUPLICATE_THRESHOLD = 0.5;

export class PeopleService {
  /**
   * Registra uma nova pessoa no sistema
   */
  async registerPerson(data: RegisterPersonData): Promise<Person> {
    const { name, externalId, imageBuffer, imagePath, documentPath } = data;

    try {
      // Verifica se há múltiplos rostos
      const faceCount = await faceRecognitionService.detectMultipleFaces(imageBuffer);

      if (faceCount === 0) {
        throw new Error('Nenhum rosto detectado na imagem. Por favor, tire uma foto com seu rosto visível.');
      }

      if (faceCount > 1) {
        throw new Error('Múltiplos rostos detectados. Por favor, tire uma foto com apenas um rosto.');
      }

      // Extrai o descriptor facial
      const descriptor = await faceRecognitionService.detectFaceDescriptor(imageBuffer);

      if (!descriptor) {
        throw new Error('Não foi possível extrair as características faciais. Tente novamente.');
      }

      // Verifica se já existe uma pessoa com esse externalId
      let existingPerson;
      try {
        existingPerson = await prisma.person.findUnique({
          where: { externalId },
        });
      } catch (dbError: any) {
        console.error('Erro ao acessar banco de dados:', dbError);
        throw new Error(
          'Erro ao acessar o banco de dados. Verifique se o DBeaver ou Prisma Studio estão fechados e tente novamente.'
        );
      }

      if (existingPerson) {
        throw new Error(`Já existe uma pessoa cadastrada com o identificador ${externalId}`);
      }

      // NOVO: Verifica se já existe uma pessoa com rosto similar (evita cadastro duplicado)
      let allPeople;
      try {
        allPeople = await prisma.person.findMany();
      } catch (dbError: any) {
        console.error('Erro ao acessar banco de dados:', dbError);
        throw new Error(
          'Erro ao acessar o banco de dados. Verifique se o DBeaver ou Prisma Studio estão fechados e tente novamente.'
        );
      }

      if (allPeople.length > 0) {
        const knownDescriptors = allPeople.map((person) => ({
          id: person.id,
          name: person.name,
          descriptor: faceRecognitionService.stringToDescriptor(person.faceDescriptor),
        }));

        // Threshold tolerante a variação (expressão, ângulo, luz) para impedir
        // que a mesma pessoa se cadastre 2x fazendo careta ou mudando ângulo.
        const match = faceRecognitionService.findBestMatch(
          descriptor,
          knownDescriptors,
          0.55
        );

        if (match) {
          throw new Error(
            `Já existe uma pessoa cadastrada com este rosto: "${match.name}". ` +
            `Se for você, use o cadastro existente ou procure o responsável pelo sistema.`
          );
        }
      }

      // Salva a pessoa no banco de dados
      let person;
      try {
        person = await prisma.person.create({
          data: {
            name,
            externalId,
            imagePath,
            documentPath,
            faceDescriptor: faceRecognitionService.descriptorToString(descriptor),
          },
        });
      } catch (dbError: any) {
        console.error('Erro ao salvar no banco de dados:', dbError);
        throw new Error(
          'Erro ao salvar no banco de dados. Verifique se o DBeaver ou Prisma Studio estão fechados e tente novamente.'
        );
      }

      return person;
    } catch (error: any) {
      // Re-lança erros conhecidos
      if (error.message) {
        throw error;
      }
      // Trata erros desconhecidos
      console.error('Erro desconhecido ao registrar pessoa:', error);
      throw new Error('Erro inesperado ao registrar pessoa. Tente novamente.');
    }
  }

  /**
   * Registra uma pessoa após validação de liveness no servidor.
   * - Re-extrai descriptor de cada frame usando face-api server-side
   * - Compara com o descriptor enviado pelo cliente (anti-tampering)
   * - Valida que os 3 frames são da mesma pessoa
   * - Valida que houve variação real entre os ângulos
   * - Detecção de duplicata contra todos os FaceDescriptor do banco
   * - Salva 3 descriptors. Mantém só o blob do "front", descarta os outros.
   */
  async registerPersonWithLiveness(data: RegisterPersonLivenessData): Promise<Person> {
    const { name, externalId, frames, documentPath } = data;
    const cleanup = async () => {
      for (const f of frames) {
        await fs.unlink(f.imagePath).catch(() => {});
      }
    };

    try {
      if (frames.length !== 3) {
        throw new Error('Cadastro requer exatamente 3 frames');
      }

      const serverFrames: Array<LivenessFrameInput & { serverDescriptor: Float32Array }> = [];
      for (const f of frames) {
        const desc = await faceRecognitionService.detectFaceDescriptor(f.imageBuffer);
        if (!desc) {
          throw new Error(`Nenhum rosto detectado no frame "${f.angle}". Tente novamente.`);
        }
        const clientDesc = new Float32Array(f.clientDescriptor);
        const mismatch = faceRecognitionService.calculateDistance(desc, clientDesc);
        if (mismatch > MAX_CLIENT_SERVER_DESCRIPTOR_DIST) {
          throw new Error(
            `Frame "${f.angle}" foi adulterado: descriptor do cliente difere do servidor (dist=${mismatch.toFixed(2)})`,
          );
        }
        serverFrames.push({ ...f, serverDescriptor: desc });
      }

      const [a, b, c] = serverFrames;
      const dAB = faceRecognitionService.calculateDistance(a.serverDescriptor, b.serverDescriptor);
      const dAC = faceRecognitionService.calculateDistance(a.serverDescriptor, c.serverDescriptor);
      const dBC = faceRecognitionService.calculateDistance(b.serverDescriptor, c.serverDescriptor);

      if (dAB > MAX_INTRA_PERSON_DIST || dAC > MAX_INTRA_PERSON_DIST || dBC > MAX_INTRA_PERSON_DIST) {
        throw new Error(
          `Os 3 frames não parecem da mesma pessoa (dist=${dAB.toFixed(2)}/${dAC.toFixed(2)}/${dBC.toFixed(2)})`,
        );
      }
      if (dAB < MIN_VARIATION_BETWEEN_ANGLES && dAC < MIN_VARIATION_BETWEEN_ANGLES) {
        throw new Error('Os 3 frames são quase idênticos — suspeita de imagem estática.');
      }
      const front = a;

      const existing = await prisma.person.findUnique({ where: { externalId } });
      if (existing) {
        throw new Error(`Já existe uma pessoa cadastrada com o identificador ${externalId}`);
      }

      const allPeople = await prisma.person.findMany({ include: { faceDescriptors: true } });
      for (const p of allPeople) {
        const known: Float32Array[] = p.faceDescriptors.map((fd) =>
          faceRecognitionService.stringToDescriptor(fd.descriptor),
        );
        if (known.length === 0 && p.faceDescriptor) {
          known.push(faceRecognitionService.stringToDescriptor(p.faceDescriptor));
        }
        let minDist = Infinity;
        for (const newDesc of serverFrames.map((f) => f.serverDescriptor)) {
          for (const k of known) {
            const d = faceRecognitionService.calculateDistance(newDesc, k);
            if (d < minDist) minDist = d;
          }
        }
        if (minDist < DUPLICATE_THRESHOLD) {
          throw new Error(
            `Já existe uma pessoa cadastrada com este rosto: "${p.name}". ` +
            `Se for você, use o cadastro existente ou procure o responsável pelo sistema.`,
          );
        }
      }

      const created = await prisma.person.create({
        data: {
          name,
          externalId,
          imagePath: front.imagePath,
          documentPath,
          faceDescriptor: faceRecognitionService.descriptorToString(front.serverDescriptor),
          livenessValidated: true,
          faceDescriptors: {
            create: serverFrames.map((f) => ({
              descriptor: faceRecognitionService.descriptorToString(f.serverDescriptor),
              angle: f.angle,
            })),
          },
        },
        include: { faceDescriptors: true },
      });

      // TODO: cleanup nunca dispara — LivenessCapture marca os 3 frames como 'front',
      // então a condição abaixo é sempre falsa e os 2 arquivos extras ficam órfãos
      // em uploads/. Persistir só o front (front.imagePath) e deletar os outros
      // 2 incondicionalmente, ou usar um marcador 'reference' no primeiro.
      for (const f of serverFrames) {
        if (f.angle !== 'front') {
          await fs.unlink(f.imagePath).catch(() => {});
        }
      }

      return created;
    } catch (err) {
      await cleanup();
      throw err;
    }
  }

  /**
   * Identifica uma pessoa pela imagem
   */
  async identifyPerson(imageBuffer: Buffer, threshold: number = 0.5): Promise<IdentifyResult | null> {
    try {
      // Detecta o rosto na imagem
      const queryDescriptor = await faceRecognitionService.detectFaceDescriptor(imageBuffer);

      if (!queryDescriptor) {
        throw new Error('Nenhum rosto detectado na imagem. Por favor, tire uma foto com seu rosto visível.');
      }

      // Busca todas as pessoas cadastradas com seus descriptors (multi-foto)
      let allPeople;
      try {
        allPeople = await prisma.person.findMany({ include: { faceDescriptors: true } });
      } catch (dbError: any) {
        console.error('Erro ao acessar banco de dados:', dbError);
        throw new Error(
          'Erro ao acessar o banco de dados. Verifique se o DBeaver ou Prisma Studio estão fechados e tente novamente.'
        );
      }

      if (allPeople.length === 0) {
        return null;
      }

      // Pra cada pessoa, expande todos os descriptors (multi + legado)
      const expanded: Array<{ id: string; name: string; descriptor: Float32Array }> = [];
      for (const p of allPeople) {
        if (p.faceDescriptors.length > 0) {
          for (const fd of p.faceDescriptors) {
            expanded.push({
              id: p.id,
              name: p.name,
              descriptor: faceRecognitionService.stringToDescriptor(fd.descriptor),
            });
          }
        } else if (p.faceDescriptor) {
          expanded.push({
            id: p.id,
            name: p.name,
            descriptor: faceRecognitionService.stringToDescriptor(p.faceDescriptor),
          });
        }
      }

      const match = faceRecognitionService.findBestMatch(queryDescriptor, expanded, threshold);
      if (!match) return null;

      const person = allPeople.find((p) => p.id === match.id);
      if (!person) return null;

      const similarity = Math.max(0, 1 - match.distance);
      const confidence = Math.round(similarity * 100);

      return { person, confidence, similarity };
    } catch (error: any) {
      // Re-lança erros conhecidos
      if (error.message) {
        throw error;
      }
      // Trata erros desconhecidos
      console.error('Erro desconhecido ao identificar pessoa:', error);
      throw new Error('Erro inesperado ao identificar pessoa. Tente novamente.');
    }
  }

  /**
   * Lista todas as pessoas cadastradas
   */
  async listPeople(): Promise<Person[]> {
    try {
      return await prisma.person.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (dbError: any) {
      console.error('Erro ao acessar banco de dados:', dbError);
      throw new Error(
        'Erro ao acessar o banco de dados. Verifique se o DBeaver ou Prisma Studio estão fechados e tente novamente.'
      );
    }
  }

  /**
   * Busca uma pessoa por ID
   */
  async getPersonById(id: string): Promise<Person | null> {
    try {
      return await prisma.person.findUnique({
        where: { id },
      });
    } catch (dbError: any) {
      console.error('Erro ao acessar banco de dados:', dbError);
      throw new Error(
        'Erro ao acessar o banco de dados. Verifique se o DBeaver ou Prisma Studio estão fechados e tente novamente.'
      );
    }
  }

  /**
   * Remove uma pessoa do sistema
   */
  async deletePerson(id: string): Promise<void> {
    try {
      const person = await prisma.person.findUnique({
        where: { id },
      });

      if (!person) {
        throw new Error('Pessoa não encontrada');
      }

      // Remove a imagem do filesystem
      const uploadsDir = path.join(__dirname, '../../uploads');
      const imagePath = path.join(uploadsDir, path.basename(person.imagePath));

      try {
        await fs.unlink(imagePath);
      } catch (error) {
        console.warn('Erro ao deletar imagem:', error);
      }

      // Remove do banco de dados
      await prisma.person.delete({
        where: { id },
      });
    } catch (dbError: any) {
      console.error('Erro ao acessar banco de dados:', dbError);
      if (dbError.message === 'Pessoa não encontrada') {
        throw dbError;
      }
      throw new Error(
        'Erro ao acessar o banco de dados. Verifique se o DBeaver ou Prisma Studio estão fechados e tente novamente.'
      );
    }
  }
}

export default new PeopleService();
