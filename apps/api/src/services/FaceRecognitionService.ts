import * as faceapi from '@vladmandic/face-api';
import * as canvas from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar canvas para face-api
const { Canvas, Image, ImageData } = canvas;
// @ts-ignore
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

export class FaceRecognitionService {
  private modelsLoaded = false;

  /**
   * Carrega os modelos de reconhecimento facial
   */
  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;

    const modelsPath = path.join(__dirname, '../../models');

    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath),
      faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath),
      faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath),
    ]);

    this.modelsLoaded = true;
    console.log('✅ Face recognition models loaded successfully');
  }

  /**
   * Detecta um rosto em uma imagem e retorna o descriptor
   */
  async detectFaceDescriptor(imageBuffer: Buffer): Promise<Float32Array | null> {
    await this.loadModels();

    const img = await canvas.loadImage(imageBuffer);
    const detection = await faceapi
      .detectSingleFace(img as any)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return null;
    }

    return detection.descriptor;
  }

  /**
   * Detecta múltiplos rostos em uma imagem
   */
  async detectMultipleFaces(imageBuffer: Buffer): Promise<number> {
    await this.loadModels();

    const img = await canvas.loadImage(imageBuffer);
    const detections = await faceapi.detectAllFaces(img as any);

    return detections.length;
  }

  /**
   * Calcula a distância euclidiana entre dois descriptors
   */
  calculateDistance(descriptor1: Float32Array, descriptor2: Float32Array): number {
    return faceapi.euclideanDistance(descriptor1, descriptor2);
  }

  /**
   * Compara um descriptor com uma lista de descriptors conhecidos
   * e retorna o melhor match se a distância for menor que o threshold
   */
  findBestMatch(
    queryDescriptor: Float32Array,
    knownDescriptors: Array<{ id: string; descriptor: Float32Array; name: string }>,
    threshold: number = 0.5
  ): { id: string; name: string; distance: number } | null {
    let bestMatch: { id: string; name: string; distance: number } | null = null;
    let minDistance = threshold;

    for (const known of knownDescriptors) {
      const distance = this.calculateDistance(queryDescriptor, known.descriptor);

      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = {
          id: known.id,
          name: known.name,
          distance,
        };
      }
    }

    return bestMatch;
  }

  /**
   * Converte um descriptor para string JSON
   */
  descriptorToString(descriptor: Float32Array): string {
    return JSON.stringify(Array.from(descriptor));
  }

  /**
   * Converte uma string JSON para descriptor
   */
  stringToDescriptor(descriptorString: string): Float32Array {
    const array = JSON.parse(descriptorString);
    return new Float32Array(array);
  }
}

export default new FaceRecognitionService();
