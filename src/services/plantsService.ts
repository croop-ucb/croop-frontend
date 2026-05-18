import { api } from './api';
import { Plant } from '../types/plant';

export async function getUserPlants(): Promise<Plant[]> {
  const response = await api.get<Plant[]>('/plants');
  return response.data;
}

export async function deletePlant(id: string): Promise<void> {
  await api.delete(`/plants/${id}`);
}
