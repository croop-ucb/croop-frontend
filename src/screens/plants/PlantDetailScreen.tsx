import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';
import { getEspecie } from '../../services/especiesService';
import { deletarPlanta } from '../../services/plantsService';
import { getStatus, irrigarManualmente } from '../../services/iotService';
import { EspecieResponse, StatusPlantaResponse } from '../../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'PlantDetail'>;

function classificarUmidade(pct: number): { label: string; cor: string; corFundo: string } {
  if (pct < 30) return { label: 'Seco', cor: '#FF7043', corFundo: 'rgba(255,112,67,0.12)' };
  if (pct > 70) return { label: 'Encharcado', cor: '#42A5F5', corFundo: 'rgba(66,165,245,0.12)' };
  return { label: 'Ideal', cor: '#4CAF50', corFundo: 'rgba(76,175,80,0.12)' };
}

function formatarRelativo(iso: string): string {
  const agora = Date.now();
  const data = new Date(iso);
  const diffMin = Math.floor((agora - data.getTime()) / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffH / 24);

  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffH < 24) return `há ${diffH}h`;
  if (diffDias === 1) {
    const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `ontem às ${hora}`;
  }
  return `há ${diffDias} dias`;
}

export default function PlantDetailScreen({ route, navigation }: Props) {
  const { plantaId, nome, ambiente, porte, id_especie } = route.params;

  const [especie, setEspecie] = useState<EspecieResponse | null>(null);
  const [carregandoEspecie, setCarregandoEspecie] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  const [status, setStatus] = useState<StatusPlantaResponse | null>(null);
  const [carregandoStatus, setCarregandoStatus] = useState(true);
  const [erroStatus, setErroStatus] = useState<string | null>(null);
  const [irrigando, setIrrigando] = useState(false);

  useEffect(() => {
    getEspecie(id_especie)
      .then(setEspecie)
      .catch(() => setEspecie(null))
      .finally(() => setCarregandoEspecie(false));
  }, [id_especie]);

  const carregarStatus = useCallback(async () => {
    setCarregandoStatus(true);
    setErroStatus(null);
    try {
      const data = await getStatus(plantaId);
      setStatus(data);
    } catch {
      setErroStatus('Não foi possível obter o status. Verifique sua conexão.');
    } finally {
      setCarregandoStatus(false);
    }
  }, [plantaId]);

  const refreshStatus = useCallback(async () => {
    try {
      const data = await getStatus(plantaId);
      setStatus(data);
      setErroStatus(null);
    } catch {
      // Silencioso — não derruba dados existentes em falha de background
    }
  }, [plantaId]);

  useFocusEffect(
    useCallback(() => {
      carregarStatus();
      const intervalo = setInterval(refreshStatus, 30000);
      return () => clearInterval(intervalo);
    }, [carregarStatus, refreshStatus]),
  );

  const confirmarIrrigacao = useCallback(async () => {
    setIrrigando(true);
    try {
      const resposta = await irrigarManualmente(plantaId);
      setStatus((prev) => prev ? { ...prev, tem_comando_pendente: true } : prev);
      Alert.alert('Irrigação solicitada', resposta.status ?? 'Comando enviado ao dispositivo.');
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar o comando. Tente novamente.');
    } finally {
      setIrrigando(false);
    }
  }, [plantaId]);

  const handleIrrigar = useCallback(() => {
    const umidade = status?.ultima_leitura?.umidade_percentual;

    if (umidade !== undefined && umidade > 70) {
      Alert.alert(
        'Solo encharcado',
        `A umidade está em ${umidade.toFixed(0)}% — acima do ideal. Irrigar agora pode prejudicar a planta. Deseja prosseguir?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Irrigar mesmo assim', style: 'destructive', onPress: confirmarIrrigacao },
        ],
      );
      return;
    }

    confirmarIrrigacao();
  }, [status, confirmarIrrigacao]);

  const umidadePct = status?.ultima_leitura?.umidade_percentual;
  const classificacao = umidadePct !== undefined ? classificarUmidade(umidadePct) : null;
  const comandoPendente = status?.tem_comando_pendente ?? false;
  const dispositivoOnline = status?.dispositivo_online ?? true;
  const btnIrrigarDesabilitado = comandoPendente || irrigando || carregandoStatus;

  return (
    <ScreenBackground overlayOpacity={0.8}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={26} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <CroopLogo width={140} height={55} curve="M 40,80 Q 200,10 360,80" fontSize={55} shadowDy={4} />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('PlantEdit', { plantaId })} style={styles.backButton}>
            <Ionicons name="pencil-outline" size={22} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.plantaNome}>{nome}</Text>

          {carregandoEspecie ? (
            <ActivityIndicator size="small" color="#4CAF50" style={styles.especieLoader} />
          ) : especie && (
            <View style={styles.especieContainer}>
              <Text style={styles.especieNome}>{especie.nome_comum}</Text>
              {especie.nome_cientifico && (
                <Text style={styles.especieCientifico}>{especie.nome_cientifico}</Text>
              )}
            </View>
          )}

          {/* Card de umidade / status IoT (#8, #10, #11) */}
          <View style={styles.statusCard}>
            {carregandoStatus && (
              <ActivityIndicator size="small" color="#4CAF50" />
            )}

            {!carregandoStatus && erroStatus && (
              <View style={styles.estadoCentro}>
                <Ionicons name="wifi-outline" size={24} color="rgba(255,255,255,0.35)" />
                <Text style={styles.estadoTextoFraco}>{erroStatus}</Text>
                <TouchableOpacity style={styles.btnRetry} onPress={carregarStatus}>
                  <Text style={styles.btnRetryText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            )}

            {!carregandoStatus && !erroStatus && !status?.ultima_leitura && (
              <View style={styles.estadoCentro}>
                <Ionicons
                  name={dispositivoOnline ? 'hardware-chip-outline' : 'cloud-offline-outline'}
                  size={24}
                  color={dispositivoOnline ? 'rgba(255,255,255,0.35)' : 'rgba(255,152,0,0.6)'}
                />
                <Text style={[styles.estadoTextoFraco, !dispositivoOnline && { color: 'rgba(255,152,0,0.7)' }]}>
                  {dispositivoOnline
                    ? 'Aguardando primeira leitura do sensor.'
                    : 'Dispositivo offline. Aguardando primeira conexão.'}
                </Text>
              </View>
            )}

            {!carregandoStatus && !erroStatus && status?.ultima_leitura && classificacao && (
              <>
                <View style={styles.umidadeHeader}>
                  <View style={styles.umidadeLabelRow}>
                    <Ionicons name="water-outline" size={16} color={classificacao.cor} />
                    <Text style={[styles.umidadeLabelTexto, { color: classificacao.cor }]}>Umidade atual</Text>
                    {dispositivoOnline ? (
                      <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveTexto}>ao vivo</Text>
                      </View>
                    ) : (
                      <View style={styles.offlineBadge}>
                        <View style={styles.offlineDot} />
                        <Text style={styles.offlineTexto}>offline</Text>
                      </View>
                    )}
                  </View>
                  {comandoPendente && (
                    <View style={styles.pendenteBadge}>
                      <ActivityIndicator size={10} color="#4CAF50" style={{ marginRight: 5 }} />
                      <Text style={styles.pendenteTexto}>Irrigando...</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.umidadeValor, { color: classificacao.cor }]}>
                  {umidadePct!.toFixed(0)}%
                </Text>

                <View style={styles.barraFundo}>
                  <View
                    style={[
                      styles.barraPreenchimento,
                      {
                        width: `${Math.min(Math.round(umidadePct!), 100)}%`,
                        backgroundColor: classificacao.cor,
                      },
                    ]}
                  />
                </View>

                <View style={[styles.estadoBadge, { backgroundColor: classificacao.corFundo, borderColor: classificacao.cor }]}>
                  <Text style={[styles.estadoBadgeTexto, { color: classificacao.cor }]}>{classificacao.label}</Text>
                </View>

                <Text style={styles.timestampTexto}>
                  Leitura: {formatarRelativo(status.ultima_leitura.timestamp)}
                </Text>

                {status.ultimo_evento_irrigacao ? (
                  <Text style={styles.timestampTexto}>
                    Última irrigação: {formatarRelativo(status.ultimo_evento_irrigacao.timestamp)}
                    {' '}· {status.ultimo_evento_irrigacao.duracao_segundos}s
                  </Text>
                ) : (
                  <Text style={styles.timestampTexto}>Sem eventos de irrigação registrados.</Text>
                )}

                {!dispositivoOnline && (
                  <View style={styles.offlineBanner}>
                    <Ionicons name="cloud-offline-outline" size={13} color="#FF9800" />
                    <Text style={styles.offlineBannerTexto}>
                      Dispositivo offline · aguardando reconexão
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Informações estáticas da planta */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="leaf-outline" size={18} color="#4CAF50" />
              <Text style={styles.infoLabel}>Ambiente</Text>
              <Text style={styles.infoValue}>{ambiente}</Text>
            </View>
            {porte && (
              <View style={[styles.infoRow, styles.infoRowBorder]}>
                <Ionicons name="resize-outline" size={18} color="#4CAF50" />
                <Text style={styles.infoLabel}>Porte</Text>
                <Text style={styles.infoValue}>{porte}</Text>
              </View>
            )}
            {especie?.necessidade_luz && (
              <View style={[styles.infoRow, styles.infoRowBorder]}>
                <Ionicons name="sunny-outline" size={18} color="#4CAF50" />
                <Text style={styles.infoLabel}>Luz</Text>
                <Text style={styles.infoValue}>{especie.necessidade_luz}</Text>
              </View>
            )}
          </View>

          {/* Ações (#12, #13) */}
          <View style={styles.actions}>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btnPrimary, styles.btnRowItem]}
                onPress={() => navigation.navigate('Schedule', { plantaId, nome })}
              >
                <Ionicons name="calendar-outline" size={18} color="#FFF" style={styles.btnIcon} />
                <Text style={styles.btnPrimaryText}>Ver Cronograma</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnPrimary, styles.btnRowItem]}
                onPress={() => navigation.navigate('Historico', { plantaId, nome })}
              >
                <Ionicons name="analytics-outline" size={18} color="#FFF" style={styles.btnIcon} />
                <Text style={styles.btnPrimaryText}>Ver Histórico</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btnSecondary, btnIrrigarDesabilitado && styles.btnDesabilitado]}
              onPress={handleIrrigar}
              disabled={btnIrrigarDesabilitado}
            >
              {irrigando
                ? <ActivityIndicator color="#4CAF50" />
                : <>
                    <Ionicons
                      name="water-outline"
                      size={20}
                      color={btnIrrigarDesabilitado ? 'rgba(255,255,255,0.25)' : '#4CAF50'}
                      style={styles.btnIcon}
                    />
                    <Text style={[
                      styles.btnSecondaryText,
                      btnIrrigarDesabilitado && { color: 'rgba(255,255,255,0.25)' },
                    ]}>
                      {comandoPendente ? 'Irrigação pendente' : 'Irrigar agora'}
                    </Text>
                  </>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnDanger}
              disabled={excluindo}
              onPress={() => Alert.alert(
                'Excluir planta',
                `Tem certeza que deseja excluir "${nome}"? Esta ação não pode ser desfeita.`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                      setExcluindo(true);
                      try {
                        await deletarPlanta(plantaId);
                        navigation.goBack();
                      } catch {
                        Alert.alert('Erro', 'Não foi possível excluir a planta.');
                        setExcluindo(false);
                      }
                    },
                  },
                ],
              )}
            >
              {excluindo
                ? <ActivityIndicator color="#FF5252" />
                : <>
                    <Ionicons name="trash-outline" size={20} color="#FF5252" style={styles.btnIcon} />
                    <Text style={styles.btnDangerText}>Excluir planta</Text>
                  </>
              }
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    height: 70,
  },
  backButton: { width: 40, alignItems: 'flex-start' },
  logoContainer: { flex: 1, alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16 },
  plantaNome: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 8,
  },
  especieLoader: { marginBottom: 20 },
  especieContainer: { alignItems: 'center', marginBottom: 20 },
  especieNome: { color: '#4CAF50', fontSize: 15, fontWeight: '600' },
  especieCientifico: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
  },

  /* Status card */
  statusCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    marginBottom: 16,
    minHeight: 80,
    justifyContent: 'center',
  },
  estadoCentro: { alignItems: 'center', gap: 10 },
  estadoTextoFraco: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    textAlign: 'center',
  },
  btnRetry: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 20,
  },
  btnRetryText: { color: '#4CAF50', fontSize: 13, fontWeight: '600' },

  umidadeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  umidadeLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  umidadeLabelTexto: { fontSize: 13, fontWeight: '600' },
  pendenteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76,175,80,0.12)',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  pendenteTexto: { color: '#4CAF50', fontSize: 11, fontWeight: '600' },

  umidadeValor: {
    fontSize: 48,
    fontWeight: '200',
    textAlign: 'center',
    marginBottom: 12,
  },
  barraFundo: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  barraPreenchimento: { height: '100%', borderRadius: 3 },
  estadoBadge: {
    alignSelf: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  estadoBadgeTexto: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  timestampTexto: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },

  /* Info card */
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  infoValue: { color: '#FFF', fontSize: 14, fontWeight: '500' },

  /* Actions */
  actions: { gap: 14 },
  btnRow: { flexDirection: 'row', gap: 12 },
  btnRowItem: { flex: 1, height: undefined, paddingVertical: 14 },
  btnPrimary: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  btnPrimaryText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', textAlign: 'center', flexShrink: 1 },
  btnSecondary: {
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  btnSecondaryText: { color: '#4CAF50', fontSize: 16, fontWeight: '600' },
  btnDesabilitado: {
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  btnIcon: { marginRight: 8 },
  btnDanger: {
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FF5252',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  btnDangerText: { color: '#FF5252', fontSize: 16, fontWeight: '600' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50' },
  liveTexto: { color: 'rgba(76,175,80,0.8)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  offlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 6 },
  offlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF9800' },
  offlineTexto: { color: 'rgba(255,152,0,0.8)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(255,152,0,0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,152,0,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  offlineBannerTexto: { color: '#FF9800', fontSize: 11, fontWeight: '500', flex: 1 },
});
