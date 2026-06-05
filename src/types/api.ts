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
  id_planta: number | null;
  tipo_notificacao: string | null;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data_envio: string;
}

// Se o seu back-end exigir um payload para criar/atualizar notificação:
export interface CriarNotificacaoPayload {
  mensagem: string;
  id_usuario: number;
}

export interface ItemCronogramaResponse {
  id_item_cronograma: number;
  tipo_cuidado: string;
  descricao: string | null;
  data_prevista: string;
  status_execucao: string | null;
}

export interface CronogramaResponse {
  id_cronograma: number;
  id_planta: number;
  frequencia_semanal: number;
  dias_sugeridos: string[];
  horario_sugerido: string;
  nivel_prioridade: string;
  observacoes: string;
  justificativa: string;
  periodo_inicio: string;
  periodo_fim: string | null;
  itens: ItemCronogramaResponse[];
}
