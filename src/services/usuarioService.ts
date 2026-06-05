import api from './api';
import { UsuarioResponse } from '../types/api';

export async function getMe(): Promise<UsuarioResponse> {
  const response = await api.get<UsuarioResponse>('/usuarios/me');
  return response.data;
}
