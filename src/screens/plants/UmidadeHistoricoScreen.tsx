import React, { useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, SafeAreaView, StatusBar,
  TouchableOpacity, ScrollView, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LineChart } from 'react-native-chart-kit';
import { RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';
import { getLeituras } from '../../services/iotService';
import { LeituraResponse } from '../../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'UmidadeHistorico'>;

const CHART_WIDTH = Dimensions.get('window').width - 48;

function classificar(pct: number): { cor: string; label: string } {
  if (pct < 30) return { cor: '#FF7043', label: 'Seco' };
  if (pct > 70) return { cor: '#42A5F5', label: 'Encharcado' };
  return { cor: '#4CAF50', label: 'Ideal' };
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarHora(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function UmidadeHistoricoScreen({ route, navigation }: Props) {
  const { plantaId, nome } = route.params;

  const [leituras, setLeituras] = useState<LeituraResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await getLeituras(plantaId, 100);
      setLeituras(data);
    } catch {
      setErro('Não foi possível carregar o histórico de umidade.');
    } finally {
      setLoading(false);
    }
  }, [plantaId]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  // API retorna mais recente primeiro; gráfico precisa de ordem cronológica
  const pontosGrafico = [...leituras].slice(0, 20).reverse();
  const podeExibirGrafico = pontosGrafico.length >= 2;

  const labelInterval = Math.max(1, Math.ceil(pontosGrafico.length / 5));
  const chartLabels = pontosGrafico.map((l, i) =>
    i % labelInterval === 0 ? formatarHora(l.timestamp) : '',
  );
  const chartValues = pontosGrafico.map((l) => Math.round(l.umidade_percentual));

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
            <Ionicons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.3)" />
            <Text style={styles.stateText}>{erro}</Text>
            <TouchableOpacity style={styles.btnRetry} onPress={carregar}>
              <Text style={styles.btnRetryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !erro && leituras.length === 0 && (
          <View style={styles.centerState}>
            <Ionicons name="analytics-outline" size={56} color="rgba(255,255,255,0.3)" />
            <Text style={styles.stateText}>Nenhuma leitura registrada ainda.</Text>
          </View>
        )}

        {!loading && !erro && leituras.length > 0 && (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Gráfico */}
            <Text style={styles.secaoTitulo}>
              GRÁFICO · ÚLTIMAS {pontosGrafico.length} LEITURAS
            </Text>

            {podeExibirGrafico ? (
              <View style={styles.chartContainer}>
                <LineChart
                  data={{ labels: chartLabels, datasets: [{ data: chartValues }] }}
                  width={CHART_WIDTH}
                  height={200}
                  yAxisSuffix="%"
                  fromZero
                  bezier
                  chartConfig={{
                    backgroundGradientFrom: '#0D2412',
                    backgroundGradientTo: '#0D2412',
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.45})`,
                    strokeWidth: 2,
                    decimalPlaces: 0,
                    propsForDots: { r: '3', strokeWidth: '1', stroke: '#4CAF50' },
                    propsForBackgroundLines: {
                      strokeDasharray: '',
                      stroke: 'rgba(255,255,255,0.05)',
                    },
                  }}
                  style={styles.chart}
                />
              </View>
            ) : (
              <View style={styles.graficoIndisponivel}>
                <Text style={styles.stateText}>Mínimo de 2 leituras para exibir o gráfico.</Text>
              </View>
            )}

            {/* Tabela */}
            <Text style={[styles.secaoTitulo, { marginTop: 28 }]}>
              HISTÓRICO COMPLETO · {leituras.length} REGISTROS
            </Text>

            <View style={styles.tabela}>
              <View style={[styles.tabelaRow, styles.tabelaHeaderRow]}>
                <Text style={[styles.celula, styles.celulaHeader, { flex: 2 }]}>Data / Hora</Text>
                <Text style={[styles.celula, styles.celulaHeader, { flex: 1, textAlign: 'right' }]}>Umidade</Text>
                <Text style={[styles.celula, styles.celulaHeader, { flex: 1, textAlign: 'center' }]}>Estado</Text>
              </View>

              {leituras.map((l, i) => {
                const { cor, label } = classificar(l.umidade_percentual);
                return (
                  <View
                    key={`${l.timestamp}-${i}`}
                    style={[styles.tabelaRow, i % 2 !== 0 && styles.tabelaRowAlternada]}
                  >
                    <Text style={[styles.celula, { flex: 2 }]}>{formatarData(l.timestamp)}</Text>
                    <Text style={[styles.celula, { flex: 1, textAlign: 'right', color: cor, fontWeight: '600' }]}>
                      {l.umidade_percentual.toFixed(1)}%
                    </Text>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <View style={[styles.badge, { borderColor: cor, backgroundColor: cor + '1A' }]}>
                        <Text style={[styles.badgeTexto, { color: cor }]}>{label}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

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
    fontSize: 20,
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
    color: 'rgba(255,255,255,0.45)',
    fontSize: 15,
    textAlign: 'center',
  },
  btnRetry: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 24,
  },
  btnRetryText: { color: '#4CAF50', fontWeight: '600' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 16 },
  secaoTitulo: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 2,
  },
  chartContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  chart: { borderRadius: 16 },
  graficoIndisponivel: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tabela: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tabelaHeaderRow: {
    backgroundColor: 'rgba(76,175,80,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  tabelaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  tabelaRowAlternada: { backgroundColor: 'rgba(255,255,255,0.025)' },
  celulaHeader: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  celula: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  badge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  badgeTexto: { fontSize: 10, fontWeight: '700' },
});
