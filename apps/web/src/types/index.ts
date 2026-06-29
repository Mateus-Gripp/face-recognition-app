export interface Person {
  id: string;
  name: string;
  externalId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IdentifyResult {
  id: string;
  name: string;
  externalId: string;
  confidence: number;
  similarity: number;
  imagePath: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
