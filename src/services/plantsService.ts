import api from './api';
import { CriarPlantaPayload, AtualizarPlantaPayload, PlantaResponse } from '../types/api';

export async function listarPlantas(): Promise<PlantaResponse[]> {
  const response = await api.get<PlantaResponse[]>('/plantas/');
  return response.data;
}

export async function getPlanta(id: number): Promise<PlantaResponse> {
  const response = await api.get<PlantaResponse>(`/plantas/${id}`);
  return response.data;
}

export async function criarPlanta(payload: CriarPlantaPayload): Promise<PlantaResponse> {
  const response = await api.post<PlantaResponse>('/plantas/', payload);
  return response.data;
}

export async function atualizarPlanta(id: number, payload: AtualizarPlantaPayload): Promise<PlantaResponse> {
  const response = await api.put<PlantaResponse>(`/plantas/${id}`, payload);
  return response.data;
}

export async function deletarPlanta(id: number): Promise<void> {
  await api.delete(`/plantas/${id}`);
}
