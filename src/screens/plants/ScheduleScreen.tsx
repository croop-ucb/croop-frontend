import React, { useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  SafeAreaView, StatusBar, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';
import { getCronograma, gerarCronograma } from '../../services/cronogramaService';
import { CronogramaResponse } from '../../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Schedule'>;

const TODOS_DIAS = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
const LABELS_DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const PRIORIDADE_COR: Record<string, string> = {
  urgente: '#FF5252',
  alto: '#FF9800',
  normal: '#4CAF50',
  baixo: '#9E9E9E',
};

const PRIORIDADE_LABEL: Record<string, string> = {
  urgente: 'Urgente',
  alto: 'Alta',
  normal: 'Normal',
  baixo: 'Baixa',
};

function formatarData(iso: string, horario: string): string {
  const date = new Date(iso);
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${diasSemana[date.getDay()]}, ${date.getDate().toString().padStart(2, '0')} ${meses[date.getMonth()]} · ${horario}`;
}

export default function ScheduleScreen({ route, navigation }: Props) {
  const { plantaId, nome } = route.params;

  const [cronograma, setCronograma] = useState<CronogramaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [semCronograma, setSemCronograma] = useState(false);
  const [gerando, setGerando] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    setSemCronograma(false);
    try {
      const data = await getCronograma(plantaId);
      setCronograma(data);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        setSemCronograma(true);
      } else {
        setErro('Não foi possível carregar o cronograma.');
      }
    } finally {
      setLoading(false);
    }
  }, [plantaId]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const handleGerar = async () => {
    setGerando(true);
    setErro(null);
    setSemCronograma(false);
    try {
      const data = await gerarCronograma(plantaId);
      setCronograma(data);
    } catch {
      setErro('Não foi possível gerar o cronograma. Tente novamente.');
    } finally {
      setGerando(false);
    }
  };

  const prioridadeCor = PRIORIDADE_COR[cronograma?.nivel_prioridade ?? 'normal'];
  const prioridadeLabel = PRIORIDADE_LABEL[cronograma?.nivel_prioridade ?? 'normal'];

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
          <View style={styles.backButton} />
        </View>

        <Text style={styles.plantaNome}>{nome}</Text>

        {loading && (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        )}

        {!loading && erro && (
          <View style={styles.centerState}>
            <Text style={styles.stateText}>{erro}</Text>
            <TouchableOpacity style={styles.btnRetry} onPress={carregar}>
              <Text style={styles.btnRetryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && semCronograma && (
          <View style={styles.centerState}>
            <Ionicons name="calendar-outline" size={56} color="rgba(255,255,255,0.3)" />
            <Text style={styles.stateText}>Nenhum cronograma gerado ainda.</Text>
            <TouchableOpacity style={styles.btnGerar} onPress={handleGerar} disabled={gerando}>
              {gerando
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.btnGerarText}>Gerar Cronograma</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {!loading && cronograma && (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Prioridade */}
            <View style={[styles.badge, { backgroundColor: prioridadeCor + '22', borderColor: prioridadeCor }]}>
              <View style={[styles.badgeDot, { backgroundColor: prioridadeCor }]} />
              <Text style={[styles.badgeText, { color: prioridadeCor }]}>
                Prioridade {prioridadeLabel}
              </Text>
            </View>

            {/* Frequência */}
            <View style={styles.card}>
              <View style={styles.frequenciaRow}>
                <Ionicons name="calendar-outline" size={22} color="#4CAF50" />
                <Text style={styles.frequenciaTexto}>
                  {cronograma.frequencia_semanal}x por semana · {cronograma.horario_sugerido}
                </Text>
              </View>

              {/* Dias da semana */}
              <View style={styles.diasRow}>
                {TODOS_DIAS.map((dia, i) => {
                  const ativo = cronograma.dias_sugeridos.includes(dia);
                  return (
                    <View
                      key={dia}
                      style={[styles.diaChip, ativo && styles.diaChipAtivo]}
                    >
                      <Text style={[styles.diaLabel, ativo && styles.diaLabelAtivo]}>
                        {LABELS_DIAS[i]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Próximas irrigações */}
            {cronograma.itens.length > 0 && (
              <View style={styles.secao}>
                <Text style={styles.secaoTitulo}>Próximas irrigações</Text>
                {cronograma.itens.map((item) => (
                  <View key={item.id_item_cronograma} style={styles.itemCard}>
                    <Ionicons name="water-outline" size={18} color="#4CAF50" />
                    <Text style={styles.itemData}>
                      {formatarData(item.data_prevista, cronograma.horario_sugerido)}
                    </Text>
                    <View style={styles.itemStatusBadge}>
                      <Text style={styles.itemStatusTexto}>
                        {item.status_execucao ?? 'pendente'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Observações */}
            {!!cronograma.observacoes && (
              <View style={styles.secao}>
                <Text style={styles.secaoTitulo}>Observações</Text>
                <View style={styles.textoCard}>
                  <Text style={styles.textoConteudo}>{cronograma.observacoes}</Text>
                </View>
              </View>
            )}

            {/* Justificativa */}
            {!!cronograma.justificativa && (
              <View style={styles.secao}>
                <Text style={styles.secaoTitulo}>Raciocínio da IA</Text>
                <View style={styles.textoCard}>
                  <Text style={styles.textoConteudo}>{cronograma.justificativa}</Text>
                </View>
              </View>
            )}

            {/* Botão atualizar */}
            <TouchableOpacity
              style={styles.btnAtualizar}
              onPress={handleGerar}
              disabled={gerando}
            >
              {gerando
                ? <ActivityIndicator color="#4CAF50" />
                : <>
                    <Ionicons name="refresh-outline" size={18} color="#4CAF50" style={{ marginRight: 8 }} />
                    <Text style={styles.btnAtualizarText}>Atualizar cronograma</Text>
                  </>
              }
            </TouchableOpacity>

            <View style={{ height: 32 }} />
          </ScrollView>
        )}
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
  plantaNome: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  stateText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    textAlign: 'center',
  },
  btnRetry: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  btnRetryText: { color: '#4CAF50', fontWeight: 'bold' },
  btnGerar: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    height: 50,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnGerarText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 16 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 6,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    marginBottom: 16,
  },
  frequenciaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  frequenciaTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  diasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diaChip: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  diaChipAtivo: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  diaLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '600',
  },
  diaLabelAtivo: { color: '#FFF' },
  secao: { marginBottom: 16 },
  secaoTitulo: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  itemData: {
    color: '#FFF',
    fontSize: 14,
    flex: 1,
  },
  itemStatusBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  itemStatusTexto: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  textoCard: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
  },
  textoConteudo: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    lineHeight: 21,
  },
  btnAtualizar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    borderRadius: 16,
    height: 50,
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  btnAtualizarText: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: '600',
  },
});
