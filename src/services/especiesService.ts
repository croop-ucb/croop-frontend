import { api } from './api';
import { EspecieResponse } from '../types/api';

export async function buscarEspecies(busca?: string): Promise<EspecieResponse[]> {
  const response = await api.get<EspecieResponse[]>('/especies/', {
    params: busca ? { busca } : undefined,
  });
  return response.data;
}
