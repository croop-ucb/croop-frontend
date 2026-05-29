import api from './api'; 
import { NotificacaoResponse } from '../types/api'; 

export const notificationService = {
  getNotificacoes: async (): Promise<NotificacaoResponse[]> => {
    
    const response = await api.get<NotificacaoResponse[]>('/notificacoes');
    return response.data;
  },

  marcarComoLida: async (idNotificacao: number): Promise<void> => {
    await api.patch(`/notificacoes/${idNotificacao}/ler`);
  }
};