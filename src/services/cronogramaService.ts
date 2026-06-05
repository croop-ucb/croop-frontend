import api from './api';
import { CronogramaResponse } from '../types/api';

export async function getCronograma(plantaId: number): Promise<CronogramaResponse> {
  const response = await api.get<CronogramaResponse>(`/plantas/${plantaId}/cronograma`);
  return response.data;
}

export async function gerarCronograma(plantaId: number): Promise<CronogramaResponse> {
  const response = await api.post<CronogramaResponse>(`/plantas/${plantaId}/cronograma`);
  return response.data;
}
