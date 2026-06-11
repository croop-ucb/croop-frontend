import React, { useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, SafeAreaView, StatusBar,
  TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';
import { getLeituras, getIrrigacoes } from '../../services/iotService';
import { LeituraResponse, IrrigacaoEventoResponse } from '../../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Historico'>;
type Aba = 'umidade' | 'irrigacoes';

const CHART_WIDTH = Dimensions.get('window').width - 48;
const LIMITE_IRRIGACOES = 15;

function classificarUmidade(pct: number): { cor: string; label: string } {
  if (pct < 30) return { cor: '#FF7043', label: 'Seco' };
  if (pct > 70) return { cor: '#42A5F5', label: 'Encharcado' };
  return { cor: '#4CAF50', label: 'Ideal' };
}

function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatarHora(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function umidadeAntesIrrigacao(tsIrr: string, leituras: LeituraResponse[]): number | null {
  const t = new Date(tsIrr).getTime();
  const antes = leituras.filter((l) => new Date(l.timestamp).getTime() <= t);
  if (antes.length === 0) return null;
  return antes.reduce((a, b) =>
    new Date(a.timestamp).getTime() > new Date(b.timestamp).getTime() ? a : b,
  ).umidade_percentual;
}

const chartConfig = {
  backgroundGradientFrom: '#0D2412',
  backgroundGradientTo: '#0D2412',
  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.45})`,
  strokeWidth: 2,
  decimalPlaces: 0,
  propsForBackgroundLines: { strokeDasharray: '', stroke: 'rgba(255,255,255,0.05)' },
};

export default function HistoricoScreen({ route, navigation }: Props) {
  const { plantaId, nome } = route.params;
  const [abaAtiva, setAbaAtiva] = useState<Aba>('umidade');

  const [leituras, setLeituras] = useState<LeituraResponse[]>([]);
  const [loadingUmidade, setLoadingUmidade] = useState(true);
  const [erroUmidade, setErroUmidade] = useState<string | null>(null);

  const [irrigacoes, setIrrigacoes] = useState<IrrigacaoEventoResponse[]>([]);
  const [loadingIrrigacoes, setLoadingIrrigacoes] = useState(true);
  const [erroIrrigacoes, setErroIrrigacoes] = useState<string | null>(null);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [temMais, setTemMais] = useState(true);

  const carregarUmidade = useCallback(async () => {
    setLoadingUmidade(true);
    setErroUmidade(null);
    try {
      setLeituras(await getLeituras(plantaId, 100));
    } catch {
      setErroUmidade('Não foi possível carregar o histórico de umidade.');
    } finally {
      setLoadingUmidade(false);
    }
  }, [plantaId]);

  const carregarIrrigacoesInicial = useCallback(async () => {
    setLoadingIrrigacoes(true);
    setErroIrrigacoes(null);
    try {
      const data = await getIrrigacoes(plantaId, LIMITE_IRRIGACOES, 0);
      setIrrigacoes(data);
      setTemMais(data.length === LIMITE_IRRIGACOES);
    } catch {
      setErroIrrigacoes('Não foi possível carregar o histórico de irrigações.');
    } finally {
      setLoadingIrrigacoes(false);
    }
  }, [plantaId]);

  const carregarMaisIrrigacoes = useCallback(async () => {
    if (carregandoMais || !temMais) return;
    setCarregandoMais(true);
    try {
      const data = await getIrrigacoes(plantaId, LIMITE_IRRIGACOES, irrigacoes.length);
      setIrrigacoes((prev) => [...prev, ...data]);
      setTemMais(data.length === LIMITE_IRRIGACOES);
    } catch {
      // silencioso — usuário pode rolar novamente para tentar
    } finally {
      setCarregandoMais(false);
    }
  }, [carregandoMais, temMais, plantaId, irrigacoes.length]);

  useFocusEffect(useCallback(() => {
    carregarUmidade();
    carregarIrrigacoesInicial();
  }, [carregarUmidade, carregarIrrigacoesInicial]));

  // --- Dados do gráfico de umidade ---
  const pontosUmidade = [...leituras].slice(0, 20).reverse();
  const labelIntUmidade = Math.max(1, Math.ceil(pontosUmidade.length / 5));
  const umidadeChartData = {
    labels: pontosUmidade.map((l, i) => i % labelIntUmidade === 0 ? formatarHora(l.timestamp) : ''),
    datasets: [{ data: pontosUmidade.map((l) => Math.round(l.umidade_percentual)) }],
  };

  // --- Dados do gráfico de irrigações ---
  const pontosIrrigacoes = [...irrigacoes].slice(0, 10).reverse();
  const labelIntIrr = Math.max(1, Math.ceil(pontosIrrigacoes.length / 5));
  const irrigacoesChartData = {
    labels: pontosIrrigacoes.map((e, i) => i % labelIntIrr === 0 ? formatarHora(e.timestamp) : ''),
    datasets: [{
      data: pontosIrrigacoes.map((e) => {
        const u = umidadeAntesIrrigacao(e.timestamp, leituras);
        return u !== null ? Math.round(u) : 0;
      }),
    }],
  };

  // --- Helpers de renderização ---
  const renderEstadoCentral = (
    icone: string,
    texto: string,
    onRetry?: () => void,
  ) => (
    <View style={styles.centerState}>
      <Ionicons name={icone as any} size={48} color="rgba(255,255,255,0.3)" />
      <Text style={styles.stateText}>{texto}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.btnRetry} onPress={onRetry}>
          <Text style={styles.btnRetryText}>Tentar novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTabelaHeader = (col1: string, col2: string, col3?: string) => (
    <View style={styles.tabelaHeaderRow}>
      <Text style={[styles.celulaHeader, { flex: 2 }]}>{col1}</Text>
      <Text style={[styles.celulaHeader, { flex: 1, textAlign: 'right' }]}>{col2}</Text>
      {col3 && <Text style={[styles.celulaHeader, { flex: 1, textAlign: 'center' }]}>{col3}</Text>}
    </View>
  );

  // --- Aba Umidade ---
  const renderAbaUmidade = () => {
    if (loadingUmidade) return renderEstadoCentral('analytics-outline', '');
    if (erroUmidade) return renderEstadoCentral('alert-circle-outline', erroUmidade, carregarUmidade);
    if (leituras.length === 0) return renderEstadoCentral('analytics-outline', 'Nenhuma leitura registrada ainda.');

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.secaoTitulo}>GRÁFICO · ÚLTIMAS {pontosUmidade.length} LEITURAS</Text>

        {pontosUmidade.length >= 2 ? (
          <View style={styles.chartContainer}>
            <LineChart
              data={umidadeChartData}
              width={CHART_WIDTH}
              height={200}
              yAxisSuffix="%"
              fromZero
              bezier
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </View>
        ) : (
          <View style={styles.chartVazio}>
            <Text style={styles.stateText}>Mínimo de 2 leituras para o gráfico.</Text>
          </View>
        )}

        <Text style={[styles.secaoTitulo, { marginTop: 28 }]}>
          HISTÓRICO COMPLETO · {leituras.length} REGISTROS
        </Text>

        <View style={styles.tabela}>
          {renderTabelaHeader('Data / Hora', 'Umidade', 'Estado')}
          {leituras.map((l, i) => {
            const { cor, label } = classificarUmidade(l.umidade_percentual);
            return (
              <View key={`${l.timestamp}-${i}`} style={[styles.tabelaRow, i % 2 !== 0 && styles.tabelaRowAlt]}>
                <Text style={[styles.celula, { flex: 2 }]}>{formatarDataHora(l.timestamp)}</Text>
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
    );
  };

  // --- Aba Irrigações ---
  const IrrigacoesHeader = () => (
    <>
      <Text style={styles.secaoTitulo}>GRÁFICO · ÚLTIMAS {pontosIrrigacoes.length} IRRIGAÇÕES</Text>
      {pontosIrrigacoes.length >= 1 ? (
        <View style={styles.chartContainer}>
          <BarChart
            data={irrigacoesChartData}
            width={CHART_WIDTH - 16}
            height={200}
            yAxisLabel=""
            yAxisSuffix="%"
            fromZero
            showValuesOnTopOfBars
            chartConfig={{ ...chartConfig, barPercentage: 0.6 }}
            style={styles.chart}
          />
        </View>
      ) : (
        <View style={styles.chartVazio}>
          <Text style={styles.stateText}>Sem dados para o gráfico.</Text>
        </View>
      )}
      <Text style={[styles.secaoTitulo, { marginTop: 28 }]}>HISTÓRICO COMPLETO</Text>
      {renderTabelaHeader('Data / Hora', 'Umidade')}
    </>
  );

  const renderItemIrrigacao = ({ item, index }: { item: IrrigacaoEventoResponse; index: number }) => {
    const umidade = umidadeAntesIrrigacao(item.timestamp, leituras);
    const { cor } = umidade !== null ? classificarUmidade(umidade) : { cor: 'rgba(255,255,255,0.4)' };
    return (
      <View style={[styles.tabelaRow, index % 2 !== 0 && styles.tabelaRowAlt]}>
        <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="water-outline" size={13} color="rgba(76,175,80,0.5)" />
          <Text style={styles.celula}>{formatarDataHora(item.timestamp)}</Text>
        </View>
        <Text style={[styles.celula, { flex: 1, textAlign: 'right', color: cor, fontWeight: '600' }]}>
          {umidade !== null ? `${umidade.toFixed(1)}%` : '–'}
        </Text>
      </View>
    );
  };

  const IrrigacoesFooter = () => {
    if (carregandoMais) return <View style={styles.footerLoader}><ActivityIndicator size="small" color="#4CAF50" /></View>;
    if (!temMais && irrigacoes.length > 0) return <View style={styles.footerFim}><Text style={styles.footerFimTexto}>Todos os registros carregados.</Text></View>;
    return <View style={{ height: 32 }} />;
  };

  const renderAbaIrrigacoes = () => {
    if (loadingIrrigacoes) return renderEstadoCentral('water-outline', '');
    if (erroIrrigacoes) return renderEstadoCentral('alert-circle-outline', erroIrrigacoes, carregarIrrigacoesInicial);
    if (irrigacoes.length === 0) return renderEstadoCentral('water-outline', 'Nenhum evento de irrigação registrado ainda.');

    return (
      <FlatList
        data={irrigacoes}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        renderItem={renderItemIrrigacao}
        ListHeaderComponent={<IrrigacoesHeader />}
        ListFooterComponent={<IrrigacoesFooter />}
        onEndReached={carregarMaisIrrigacoes}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

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

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, abaAtiva === 'umidade' && styles.tabAtiva]}
            onPress={() => setAbaAtiva('umidade')}
          >
            <Ionicons
              name="analytics-outline"
              size={15}
              color={abaAtiva === 'umidade' ? '#FFF' : 'rgba(255,255,255,0.4)'}
            />
            <Text style={[styles.tabTexto, abaAtiva === 'umidade' && styles.tabTextoAtivo]}>
              Umidade
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, abaAtiva === 'irrigacoes' && styles.tabAtiva]}
            onPress={() => setAbaAtiva('irrigacoes')}
          >
            <Ionicons
              name="water-outline"
              size={15}
              color={abaAtiva === 'irrigacoes' ? '#FFF' : 'rgba(255,255,255,0.4)'}
            />
            <Text style={[styles.tabTexto, abaAtiva === 'irrigacoes' && styles.tabTextoAtivo]}>
              Irrigações
            </Text>
          </TouchableOpacity>
        </View>

        {abaAtiva === 'umidade' ? renderAbaUmidade() : renderAbaIrrigacoes()}
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
    paddingHorizontal: 24,
    marginBottom: 12,
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 4,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 16,
  },
  tabAtiva: { backgroundColor: '#4CAF50' },
  tabTexto: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' },
  tabTextoAtivo: { color: '#FFF' },

  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 14,
  },
  stateText: { color: 'rgba(255,255,255,0.45)', fontSize: 15, textAlign: 'center' },
  btnRetry: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 24,
  },
  btnRetryText: { color: '#4CAF50', fontWeight: '600' },

  scrollContent: { paddingHorizontal: 24 },
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
  chartVazio: {
    height: 90,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(76,175,80,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  tabelaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tabelaRowAlt: { backgroundColor: 'rgba(255,255,255,0.025)' },
  celulaHeader: { color: '#4CAF50', fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  celula: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  badge: { borderRadius: 8, borderWidth: 1, paddingVertical: 2, paddingHorizontal: 7 },
  badgeTexto: { fontSize: 10, fontWeight: '700' },

  footerLoader: { paddingVertical: 20, alignItems: 'center' },
  footerFim: { paddingVertical: 20, alignItems: 'center' },
  footerFimTexto: { color: 'rgba(255,255,255,0.25)', fontSize: 12 },
});
