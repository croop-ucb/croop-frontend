import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { notificationService } from '../../services/notificationService';
import { NotificacaoResponse } from '../../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Notification'>;

type TipoInfo = { titulo: string; icone: React.ComponentProps<typeof Ionicons>['name']; cor: string };

function resolverTipoNotificacao(tipo: string | null): TipoInfo {
  switch (tipo) {
    case 'umidade_critica':
      return { titulo: 'Umidade Crítica', icone: 'alert-circle', cor: '#FF5252' };
    case 'irrigacao_automatica':
      return { titulo: 'Irrigação Automática', icone: 'water', cor: '#42A5F5' };
    case 'irrigacao_cronograma':
      return { titulo: 'Irrigação por Cronograma', icone: 'calendar', cor: '#26C6DA' };
    case 'falha_sensor':
      return { titulo: 'Falha no Sensor', icone: 'warning-outline', cor: '#FFCA28' };
    default:
      return { titulo: 'Alerta de Cuidado', icone: 'leaf', cor: '#4CAF50' };
  }
}

export default function NotificationScreen({ navigation }: Props) {
  const [notificacoes, setNotificacoes] = useState<NotificacaoResponse[]>([]);
  const [lidas, setLidas] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState<NotificacaoResponse | null>(null);

  const fetchNotificacoes = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await notificationService.getNotificacoes();
      
      setNotificacoes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível carregar suas notificações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotificacoes();
    }, [fetchNotificacoes])
  );

  const handleNotificacaoPress = async (item: NotificacaoResponse) => {
    setNotificacaoSelecionada(item);
    setModalVisible(true);
    
    if (item && item.id_notificacao && !lidas.includes(item.id_notificacao) && !item.lida) {
      try {
        await notificationService.marcarComoLida(item.id_notificacao);
        setLidas((prev) => [...prev, item.id_notificacao]);
      } catch (err) {
        console.error("Erro ao atualizar status de leitura no back-end:", err);    
        setLidas((prev) => [...prev, item.id_notificacao]);
      }
    }
  };

  const renderItem = ({ item }: { item: NotificacaoResponse }) => {
    if (!item) return null;

    const isLida = lidas.includes(item.id_notificacao) || item.lida;
    const tipoInfo = resolverTipoNotificacao(item.tipo_notificacao);

    let dataFormatada = '--/--';
    if (item.data_envio) {
      try {
        dataFormatada = new Date(item.data_envio).toLocaleDateString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch (e) {
        dataFormatada = String(item.data_envio);
      }
    }

    return (
      <TouchableOpacity
        style={[styles.notifCard, isLida && styles.notifLida]}
        onPress={() => handleNotificacaoPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.profileCircle, { backgroundColor: isLida ? 'rgba(255,255,255,0.08)' : `${tipoInfo.cor}22` }]}>
          <Ionicons
            name={isLida ? 'mail-open-outline' : tipoInfo.icone}
            size={20}
            color={isLida ? '#888' : tipoInfo.cor}
          />
        </View>

        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, !isLida && { color: tipoInfo.cor }]}>{tipoInfo.titulo}</Text>
            <Text style={styles.notifTime}>{dataFormatada}</Text>
          </View>
          <Text style={styles.notifText} numberOfLines={2}>
            {item.mensagem || 'Sem mensagem disponível.'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      );
    }

    if (erro) {
      return (
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={50} color="#FF5555" />
          <Text style={styles.stateText}>{erro}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchNotificacoes}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!notificacoes || notificacoes.length === 0) {
      return (
        <View style={styles.centerState}>
          <Ionicons name="notifications-off-outline" size={64} color="rgba(255,255,255,0.3)" />
          <Text style={styles.stateText}>Nenhum alerta por aqui!</Text>
          <Text style={styles.stateSubText}>
            Como você não possui plantas ativas precisando de cuidados imediatos, sua central está limpa.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={notificacoes}
        keyExtractor={(item) => item && item.id_notificacao ? String(item.id_notificacao) : Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <ImageBackground source={require('../../../assets/fundo.png')} style={styles.background}>
        <View style={styles.darkOverlay}>
          <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={28} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Notificações</Text>
              <View style={{ width: 28 }} /> 
            </View>

            {renderContent()}

            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseX}>
                    <Ionicons name="close" size={20} color="#4CAF50" />
                  </TouchableOpacity>

                  <View style={styles.modalBody}>
                    {(() => {
                      const info = resolverTipoNotificacao(notificacaoSelecionada?.tipo_notificacao ?? null);
                      return (
                        <>
                          <View style={styles.modalHeader}>
                            <Ionicons name={info.icone} size={24} color={info.cor} style={styles.modalIcon} />
                            <Text style={[styles.modalTitle, { color: info.cor }]}>{info.titulo}</Text>
                          </View>
                          <Text style={styles.modalDescription}>
                            {notificacaoSelecionada?.mensagem || 'Nenhum detalhe adicional fornecido.'}
                          </Text>
                        </>
                      );
                    })()}
                  </View>

                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalOkBtn}>
                    <Text style={styles.modalOkText}>Entendido</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  darkOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    height: 60,
  },
  backButton: { padding: 5 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  list: { 
    paddingHorizontal: 20, 
    paddingTop: 10,
    paddingBottom: 45,
  },
  notifCard: {
    flexDirection: 'row', 
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
  },
  notifLida: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.04)',
    opacity: 0.4, 
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  notifContent: {
    flex: 1, 
  },
  notifHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 6 
  },
  notifTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold', flex: 1, marginRight: 8 },
  notifTime: { color: '#CCC', fontSize: 11, flexShrink: 0 },
  notifText: { color: '#E0E0E0', fontSize: 14, lineHeight: 20 },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  stateText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
  stateSubText: {
    color: '#CCC',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  retryText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalCloseX: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 5,
  },
  modalBody: {
    marginTop: 5,
    marginBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalIcon: {
    marginRight: 8,
  },
  modalTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalItemTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalDescription: {
    color: '#555',
    fontSize: 15,
    lineHeight: 22,
  },
  modalOkBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  modalOkText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});