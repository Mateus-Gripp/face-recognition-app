import axios from 'axios';
import type { Person, IdentifyResult, ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

export interface LivenessFrame {
  angle: 'front' | 'left' | 'right'
  blob: Blob
  descriptor: number[]
}

export const peopleApi = {
  registerWithLiveness: async (
    name: string,
    externalId: string,
    frames: LivenessFrame[],
    document?: File | null,
  ): Promise<ApiResponse<Person>> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('externalId', externalId);
    formData.append('framesCount', String(frames.length));
    frames.forEach((f, i) => {
      formData.append(`frame_${i}_image`, f.blob, `${f.angle}.jpg`);
      formData.append(`frame_${i}_angle`, f.angle);
      formData.append(`frame_${i}_descriptor`, JSON.stringify(f.descriptor));
    });
    if (document) formData.append('document', document, document.name);

    const response = await api.post('/people/register-liveness', formData);
    return response.data;
  },

  identify: async (image: Blob): Promise<ApiResponse<IdentifyResult>> => {
    const formData = new FormData();
    formData.append('image', image, 'face.jpg');

    const response = await api.post('/people/identify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  list: async (): Promise<ApiResponse<Person[]>> => {
    const response = await api.get('/people');
    return response.data;
  },
};

export const healthCheck = async (): Promise<ApiResponse<any>> => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
