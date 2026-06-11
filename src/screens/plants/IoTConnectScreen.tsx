import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView,
  StatusBar, ActivityIndicator, FlatList, TextInput, ScrollView,
  Platform, PermissionsAndroid, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BleManager, Device, State as BleState, BleError } from 'react-native-ble-plx';
import { RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';
import { gerarToken } from '../../services/iotService';

type Props = NativeStackScreenProps<RootStackParamList, 'IoTConnect'>;

const SERVICE_UUID  = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const SSID_UUID     = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const SENHA_UUID    = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';
const TOKEN_UUID    = 'beb5483e-36e1-4688-b7f5-ea07361b26ab';
const STATUS_UUID   = 'beb5483e-36e1-4688-b7f5-ea07361b26aa';
const TIMEOUT_SCAN  = 30000;
const TIMEOUT_OK    = 20000;
const TOKEN_DURACAO = 600;

type Estado =
  | 'GERANDO_TOKEN'
  | 'ESCANEANDO'
  | 'FORMULARIO_WIFI'
  | 'ENVIANDO'
  | 'AGUARDANDO_CONFIRMACAO'
  | 'SUCESSO'
  | 'ERRO';

type AcaoErro = 'reiniciar_fluxo' | 'reiniciar_scan' | 'abrir_config' | 'tentar_novamente' | 'voltar';

interface DispositivoItem {
  id: string;
  nome: string;
  rssi: number | null;
}

function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

function formatarTempo(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function IoTConnectScreen({ route, navigation }: Props) {
  const { plantaId, nome } = route.params;

  const [estado, setEstado] = useState<Estado>('GERANDO_TOKEN');
  const [token, setToken] = useState<string | null>(null);
  const [tokenRestante, setTokenRestante] = useState(TOKEN_DURACAO);
  const [dispositivos, setDispositivos] = useState<DispositivoItem[]>([]);
  const [dispositivoSelecionado, setDispositivoSelecionado] = useState<DispositivoItem | null>(null);
  const [ssid, setSsid] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [acaoErro, setAcaoErro] = useState<AcaoErro>('voltar');

  const managerRef      = useRef<BleManager | null>(null);
  const dispositivoRef  = useRef<Device | null>(null);
  const scanTimeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const okTimeoutRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef      = useRef(true);

  useEffect(() => {
    managerRef.current = new BleManager();
    iniciarFluxo();
    return () => {
      mountedRef.current = false;
      limparTudo();
    };
  }, []);

  // Token expirou durante scan ou formulário
  useEffect(() => {
    if (tokenRestante === 0 && (estado === 'ESCANEANDO' || estado === 'FORMULARIO_WIFI')) {
      managerRef.current?.stopDeviceScan();
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      mostrarErro('O tempo de configuração expirou. Tente novamente.', 'reiniciar_fluxo');
    }
  }, [tokenRestante, estado]);

  function limparTudo() {
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    if (okTimeoutRef.current) clearTimeout(okTimeoutRef.current);
    if (tokenTimerRef.current) clearInterval(tokenTimerRef.current);
    managerRef.current?.stopDeviceScan();
    dispositivoRef.current?.cancelConnection().catch(() => {});
    dispositivoRef.current = null;
    managerRef.current?.destroy();
    managerRef.current = null;
  }

  function mostrarErro(msg: string, acao: AcaoErro) {
    setMensagemErro(msg);
    setAcaoErro(acao);
    setEstado('ERRO');
  }

  function iniciarCountdown() {
    if (tokenTimerRef.current) clearInterval(tokenTimerRef.current);
    setTokenRestante(TOKEN_DURACAO);
    tokenTimerRef.current = setInterval(() => {
      setTokenRestante(prev => {
        if (prev <= 1) { clearInterval(tokenTimerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  async function solicitarPermissoes(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    const api = Platform.Version as number;
    const perms = api >= 31
      ? [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]
      : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
    const results = await PermissionsAndroid.requestMultiple(perms);
    return Object.values(results).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
  }

  const iniciarFluxo = useCallback(async () => {
    if (!mountedRef.current) return;
    setEstado('GERANDO_TOKEN');
    setDispositivos([]);
    setDispositivoSelecionado(null);
    setSsid('');
    setSenha('');

    try {
      const resp = await gerarToken(plantaId);
      if (!mountedRef.current) return;
      setToken(resp.token);
      iniciarCountdown();
      await iniciarScan(resp.token);
    } catch (e: any) {
      if (!mountedRef.current) return;
      if (e?.response?.status === 401) { navigation.replace('Auth', undefined); return; }
      mostrarErro(
        e?.response?.status === 404
          ? 'Planta não encontrada ou não pertence à sua conta.'
          : 'Não foi possível gerar o token de vinculação. Verifique sua conexão.',
        'reiniciar_fluxo',
      );
    }
  }, [plantaId]);

  const iniciarScan = useCallback(async (tokenAtual: string) => {
    if (!mountedRef.current) return;

    const permissoes = await solicitarPermissoes();
    if (!mountedRef.current) return;
    if (!permissoes) {
      mostrarErro('O app precisa de permissão de Bluetooth para continuar.', 'abrir_config');
      return;
    }

    const manager = managerRef.current;
    if (!manager) return;

    const btState = await manager.state();
    if (!mountedRef.current) return;
    if (btState !== BleState.PoweredOn) {
      mostrarErro('Ligue o Bluetooth do celular para continuar.', 'tentar_novamente');
      return;
    }

    manager.stopDeviceScan();
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    setDispositivos([]);
    setEstado('ESCANEANDO');

    manager.startDeviceScan([SERVICE_UUID], null, (error: BleError | null, device: Device | null) => {
      if (!mountedRef.current) return;
      if (error) {
        manager.stopDeviceScan();
        mostrarErro('Erro ao escanear. Verifique se o Bluetooth está ligado.', 'tentar_novamente');
        return;
      }
      if (device && (device.name === 'CROOP' || device.localName === 'CROOP')) {
        setDispositivos(prev => {
          const existe = prev.find(d => d.id === device.id);
          if (existe) return prev.map(d => d.id === device.id ? { ...d, rssi: device.rssi } : d);
          return [...prev, { id: device.id, nome: device.name ?? device.localName ?? 'CROOP', rssi: device.rssi }];
        });
      }
    });

    scanTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      manager.stopDeviceScan();
      setEstado(prev => {
        if (prev === 'ESCANEANDO') {
          mostrarErro('Dispositivo não encontrado. Verifique se está ligado e próximo.', 'reiniciar_scan');
          return 'ERRO';
        }
        return prev;
      });
    }, TIMEOUT_SCAN);
  }, []);

  function selecionarDispositivo(dispositivo: DispositivoItem) {
    managerRef.current?.stopDeviceScan();
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    setDispositivoSelecionado(dispositivo);
    setEstado('FORMULARIO_WIFI');
  }

  function voltarParaScan() {
    setDispositivoSelecionado(null);
    if (token && tokenRestante > 0) iniciarScan(token);
  }

  async function enviarConfiguracao() {
    if (!dispositivoSelecionado || !token || !ssid.trim()) return;
    setEstado('ENVIANDO');

    const manager = managerRef.current;
    if (!manager) return;

    try {
      const device = await manager.connectToDevice(dispositivoSelecionado.id, { timeout: 10000 });
      if (!mountedRef.current) return;
      dispositivoRef.current = device;

      await device.discoverAllServicesAndCharacteristics();
      if (!mountedRef.current) return;

      await new Promise<void>((resolve, reject) => {
        const sub = device.monitorCharacteristicForService(
          SERVICE_UUID, STATUS_UUID,
          (err: BleError | null, char: any) => {
            if (err) {
              if ((err as any).errorCode === 2) return; // OperationCancelled — esperado ao desconectar
              reject(err);
              return;
            }
            const valor = char?.value ? atob(char.value) : '';
            if (valor === 'OK') {
              clearTimeout(okTimeoutRef.current!);
              sub.remove();
              resolve();
            }
          },
        );

        device.writeCharacteristicWithResponseForService(SERVICE_UUID, SSID_UUID, toBase64(ssid.trim()))
          .then(() => device.writeCharacteristicWithResponseForService(SERVICE_UUID, SENHA_UUID, toBase64(senha)))
          .then(() => device.writeCharacteristicWithResponseForService(SERVICE_UUID, TOKEN_UUID, toBase64(token)))
          .then(() => {
            if (!mountedRef.current) return;
            setEstado('AGUARDANDO_CONFIRMACAO');
            okTimeoutRef.current = setTimeout(() => {
              sub.remove();
              reject(new Error('timeout_ok'));
            }, TIMEOUT_OK);
          })
          .catch(reject);
      });

      if (!mountedRef.current) return;

      try { await device.cancelConnection(); } catch {}
      dispositivoRef.current = null;
      if (tokenTimerRef.current) clearInterval(tokenTimerRef.current);
      setEstado('SUCESSO');

    } catch (e: any) {
      if (!mountedRef.current) return;
      try { await dispositivoRef.current?.cancelConnection(); } catch {}
      dispositivoRef.current = null;

      const msg = e?.message === 'timeout_ok'
        ? 'O dispositivo não respondeu. Verifique se está ligado.'
        : 'Não foi possível conectar ao dispositivo. Tente aproximar o celular.';
      mostrarErro(msg, 'tentar_novamente');
    }
  }

  function executarAcaoErro() {
    switch (acaoErro) {
      case 'reiniciar_fluxo':   iniciarFluxo(); break;
      case 'reiniciar_scan':    if (token && tokenRestante > 0) iniciarScan(token); else iniciarFluxo(); break;
      case 'abrir_config':      Linking.openSettings(); break;
      case 'tentar_novamente':  if (token && tokenRestante > 0) iniciarScan(token); else iniciarFluxo(); break;
      case 'voltar':            navigation.goBack(); break;
    }
  }

  const labelAcao: Record<AcaoErro, string> = {
    reiniciar_fluxo:   'Tentar novamente',
    reiniciar_scan:    'Reiniciar scan',
    abrir_config:      'Abrir configurações',
    tentar_novamente:  'Tentar novamente',
    voltar:            'Voltar',
  };

  const bloqueado = estado === 'ENVIANDO' || estado === 'AGUARDANDO_CONFIRMACAO';

  // ─── Renders por estado ────────────────────────────────────────────────────

  function TimerBadge() {
    const urgente = tokenRestante < 60;
    return (
      <View style={[styles.timerBadge, urgente && styles.timerBadgeUrgente]}>
        <Ionicons name="timer-outline" size={13} color={urgente ? '#FF5252' : 'rgba(255,255,255,0.45)'} />
        <Text style={[styles.timerTexto, urgente && styles.timerTextoUrgente]}>
          {formatarTempo(tokenRestante)}
        </Text>
      </View>
    );
  }

  function renderGerandoToken() {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.estadoTitulo}>Preparando vinculação...</Text>
      </View>
    );
  }

  function renderEscaneando() {
    return (
      <>
        <View style={styles.centrado}>
          <View style={styles.scanAnima}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
          <Text style={styles.estadoTitulo}>Buscando dispositivo</Text>
          <Text style={styles.estadoSubtitulo}>
            Certifique-se de que o dispositivo está ligado e próximo.
          </Text>
          <TimerBadge />
        </View>

        {dispositivos.length > 0 && (
          <View style={styles.listaCard}>
            <Text style={styles.listaLabel}>Dispositivos encontrados</Text>
            <FlatList
              data={dispositivos}
              keyExtractor={d => d.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.dispositivoItem} onPress={() => selecionarDispositivo(item)}>
                  <Ionicons name="hardware-chip-outline" size={20} color="#4CAF50" />
                  <View style={styles.dispositivoInfo}>
                    <Text style={styles.dispositivoNome}>{item.nome}</Text>
                    {item.rssi !== null && (
                      <Text style={styles.dispositivoRssi}>Sinal: {item.rssi} dBm</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </>
    );
  }

  function renderFormulario() {
    const btnDesabilitado = !ssid.trim() || !senha.trim();
    return (
      <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.formTimerRow}>
          <TimerBadge />
        </View>

        <TouchableOpacity style={styles.dispositivoCard} onPress={voltarParaScan}>
          <Ionicons name="hardware-chip-outline" size={18} color="#4CAF50" />
          <Text style={styles.dispositivoCardNome}>{dispositivoSelecionado?.nome}</Text>
          <Text style={styles.trocarTexto}>Trocar</Text>
        </TouchableOpacity>

        <Text style={styles.formSecaoTitulo}>Rede WiFi</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nome da rede (SSID)</Text>
          <TextInput
            style={styles.input}
            value={ssid}
            onChangeText={setSsid}
            placeholder="Nome da sua rede WiFi"
            placeholderTextColor="rgba(255,255,255,0.35)"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={32}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Senha</Text>
          <View style={styles.senhaRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={senha}
              onChangeText={setSenha}
              placeholder="Senha da rede"
              placeholderTextColor="rgba(255,255,255,0.35)"
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={64}
            />
            <TouchableOpacity style={styles.olhoBtn} onPress={() => setMostrarSenha(p => !p)}>
              <Ionicons name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'} size={20} color="rgba(255,255,255,0.45)" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.avisoCard}>
          <Ionicons name="information-circle-outline" size={15} color="rgba(255,255,255,0.35)" />
          <Text style={styles.avisoTexto}>
            Se a senha estiver errada, o processo vai falhar e você precisará tentar novamente.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btnPrimary, btnDesabilitado && styles.btnDesabilitado]}
          onPress={enviarConfiguracao}
          disabled={btnDesabilitado}
        >
          <Ionicons name="send-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnPrimaryTexto}>Enviar ao dispositivo</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  function renderEnviando() {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.estadoTitulo}>Enviando configurações...</Text>
        <Text style={styles.estadoSubtitulo}>Não feche o app nem se afaste do dispositivo.</Text>
      </View>
    );
  }

  function renderAguardando() {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.estadoTitulo}>Aguardando confirmação</Text>
        <Text style={styles.estadoSubtitulo}>
          O dispositivo está se conectando ao WiFi...
        </Text>
      </View>
    );
  }

  function renderSucesso() {
    return (
      <View style={styles.centrado}>
        <View style={styles.iconeCirculo}>
          <Ionicons name="checkmark" size={44} color="#4CAF50" />
        </View>
        <Text style={styles.estadoTitulo}>Dispositivo configurado!</Text>
        <Text style={styles.estadoSubtitulo}>
          Em alguns instantes ele aparecerá como online na tela da planta.
        </Text>
        <TouchableOpacity style={[styles.btnPrimary, { marginTop: 36, width: '100%' }]} onPress={() => navigation.goBack()}>
          <Text style={styles.btnPrimaryTexto}>Voltar para {nome}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderErro() {
    return (
      <View style={styles.centrado}>
        <View style={[styles.iconeCirculo, { borderColor: 'rgba(255,82,82,0.3)', backgroundColor: 'rgba(255,82,82,0.08)' }]}>
          <Ionicons name="alert-circle-outline" size={44} color="#FF5252" />
        </View>
        <Text style={[styles.estadoTitulo, { color: '#FF5252' }]}>Algo deu errado</Text>
        <Text style={styles.estadoSubtitulo}>{mensagemErro}</Text>
        <TouchableOpacity style={[styles.btnPrimary, { marginTop: 32, width: '100%' }]} onPress={executarAcaoErro}>
          <Text style={styles.btnPrimaryTexto}>{labelAcao[acaoErro]}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecundario} onPress={() => navigation.goBack()}>
          <Text style={styles.btnSecundarioTexto}>Voltar para a planta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderConteudo() {
    switch (estado) {
      case 'GERANDO_TOKEN':          return renderGerandoToken();
      case 'ESCANEANDO':             return renderEscaneando();
      case 'FORMULARIO_WIFI':        return renderFormulario();
      case 'ENVIANDO':               return renderEnviando();
      case 'AGUARDANDO_CONFIRMACAO': return renderAguardando();
      case 'SUCESSO':                return renderSucesso();
      case 'ERRO':                   return renderErro();
    }
  }

  return (
    <ScreenBackground overlayOpacity={0.85}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            disabled={bloqueado}
          >
            <Ionicons name="arrow-back-outline" size={26} color={bloqueado ? 'rgba(255,255,255,0.2)' : '#FFF'} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <CroopLogo width={140} height={55} curve="M 40,80 Q 200,10 360,80" fontSize={55} shadowDy={4} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.tituloPagina}>Conectar dispositivo</Text>
        <Text style={styles.subtituloPagina}>{nome}</Text>

        <View style={styles.conteudo}>
          {renderConteudo()}
        </View>
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
  backBtn: { width: 40, alignItems: 'flex-start' },
  logoContainer: { flex: 1, alignItems: 'center' },
  tituloPagina: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 4,
  },
  subtituloPagina: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 2,
  },
  conteudo: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // ─── Centrado (estados de loading/erro/sucesso) ───────────────────────────
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  scanAnima: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  estadoTitulo: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  estadoSubtitulo: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  iconeCirculo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(76,175,80,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Timer ────────────────────────────────────────────────────────────────
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timerBadgeUrgente: {
    backgroundColor: 'rgba(255,82,82,0.08)',
    borderColor: 'rgba(255,82,82,0.3)',
  },
  timerTexto: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  timerTextoUrgente: { color: '#FF5252' },

  // ─── Lista de dispositivos ────────────────────────────────────────────────
  listaCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  listaLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  dispositivoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    gap: 12,
  },
  dispositivoInfo: { flex: 1 },
  dispositivoNome: { color: '#FFF', fontSize: 15, fontWeight: '500' },
  dispositivoRssi: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },

  // ─── Formulário ───────────────────────────────────────────────────────────
  formScroll: { paddingBottom: 40 },
  formTimerRow: { alignItems: 'flex-end', marginBottom: 8 },
  formSecaoTitulo: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 14,
    marginTop: 4,
  },
  dispositivoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(76,175,80,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  dispositivoCardNome: { color: '#FFF', fontSize: 14, fontWeight: '500', flex: 1 },
  trocarTexto: { color: '#4CAF50', fontSize: 13, fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: '#4CAF50', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    color: '#FFF',
    fontSize: 15,
  },
  senhaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  olhoBtn: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avisoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    marginBottom: 20,
    marginTop: 4,
  },
  avisoTexto: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  // ─── Botões ───────────────────────────────────────────────────────────────
  btnPrimary: {
    height: 52,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  btnPrimaryTexto: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  btnDesabilitado: { backgroundColor: 'rgba(76,175,80,0.3)' },
  btnSecundario: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    width: '100%',
  },
  btnSecundarioTexto: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
});
