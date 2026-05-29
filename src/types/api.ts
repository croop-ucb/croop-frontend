export interface CadastroResponse {
  id_usuario: number;
  nome: string;
  email: string;
  data_cadastro: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface EspecieResponse {
  id_especie: number;
  nome_comum: string;
  nome_cientifico: string | null;
  descricao: string | null;
  faixa_umidade_min: number | null;
  faixa_umidade_max: number | null;
  frequencia_media_irrigacao: number | null;
  necessidade_luz: string | null;
  observacoes_cuidado: string | null;
}

export interface CriarPlantaPayload {
  id_especie: number;
  ambiente: string;
  nome_personalizado?: string;
  porte?: string;
  localizacao_descricao?: string;
  observacoes?: string;
  ativa?: boolean;
}

export interface PlantaResponse {
  id_planta: number;
  id_usuario: number;
  id_especie: number;
  ambiente: string;
  nome_personalizado: string | null;
  porte: string | null;
  localizacao_descricao: string | null;
  observacoes: string | null;
  ativa: boolean;
  data_cadastro: string;
}

export interface NotificacaoResponse {
  id_notificacao: number;
  id_usuario: number;
  mensagem: string;
  lida: boolean;
  data_criacao: string; // ou Date, dependendo de como o back-end retorna
}

// Se o seu back-end exigir um payload para criar/atualizar notificação:
export interface CriarNotificacaoPayload {
  mensagem: string;
  id_usuario: number;
}