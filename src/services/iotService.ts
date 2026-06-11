import api from './api';
import {
  StatusPlantaResponse,
  LeituraResponse,
  IrrigacaoEventoResponse,
  IrrigarResponse,
  GerarTokenResponse,
} from '../types/api';

export async function getStatus(plantaId: number): Promise<StatusPlantaResponse> {
  const response = await api.get<StatusPlantaResponse>(`/status/${plantaId}`);
  return response.data;
}

export async function getLeituras(
  plantaId: number,
  limit = 100,
  offset = 0,
): Promise<LeituraResponse[]> {
  const response = await api.get<LeituraResponse[]>(`/leituras/${plantaId}`, {
    params: { limit, offset },
  });
  return response.data;
}

export async function getIrrigacoes(
  plantaId: number,
  limit = 100,
  offset = 0,
): Promise<IrrigacaoEventoResponse[]> {
  const response = await api.get<IrrigacaoEventoResponse[]>(`/irrigacao/${plantaId}`, {
    params: { limit, offset },
  });
  return response.data;
}

export async function irrigarManualmente(plantaId: number): Promise<IrrigarResponse> {
  const response = await api.post<IrrigarResponse>('/irrigar', { planta_id: plantaId });
  return response.data;
}

export async function gerarToken(plantaId: number): Promise<GerarTokenResponse> {
  const response = await api.post<GerarTokenResponse>('/dispositivos/gerar-token', { planta_id: plantaId });
  return response.data;
}
