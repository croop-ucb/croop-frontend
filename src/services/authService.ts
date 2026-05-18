import { api } from './api';
import { CadastroResponse, LoginResponse } from '../types/api';

export interface CadastroPayload {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  confirmacao_senha: string;
}

export async function cadastrar(payload: CadastroPayload): Promise<CadastroResponse> {
  const response = await api.post<CadastroResponse>('/usuarios/cadastro', payload);
  return response.data;
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/usuarios/login', { email, senha });
  return response.data;
}
