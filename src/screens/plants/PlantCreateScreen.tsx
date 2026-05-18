import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator, FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';
import { criarPlanta } from '../../services/plantsService';
import { buscarEspecies } from '../../services/especiesService';
import { EspecieResponse } from '../../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'PlantCreate'>;

const AMBIENTES = ['Interno', 'Externo'];
const PORTES = ['Pequeno', 'Médio', 'Grande'];

export default function PlantCreateScreen({ navigation }: Props) {
  const [especieSelecionada, setEspecieSelecionada] = useState<EspecieResponse | null>(null);
  const [buscaEspecie, setBuscaEspecie] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState<EspecieResponse[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const [nomePersonalizado, setNomePersonalizado] = useState('');
  const [ambiente, setAmbiente] = useState('');
  const [porte, setPorte] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const pesquisarEspecies = useCallback(async (texto: string) => {
    setBuscando(true);
    try {
      const resultados = await buscarEspecies(texto || undefined);
      setResultadosBusca(resultados);
    } catch {
      setResultadosBusca([]);
    } finally {
      setBuscando(false);
    }
  }, []);

  useEffect(() => {
    if (!mostrarResultados) return;
    const delay = setTimeout(() => pesquisarEspecies(buscaEspecie), 300);
    return () => clearTimeout(delay);
  }, [buscaEspecie, mostrarResultados, pesquisarEspecies]);

  const abrirBusca = () => {
    setMostrarResultados(true);
    pesquisarEspecies(buscaEspecie);
  };

  const selecionarEspecie = (especie: EspecieResponse) => {
    setEspecieSelecionada(especie);
    setBuscaEspecie('');
    setMostrarResultados(false);
  };

  const limparEspecie = () => {
    setEspecieSelecionada(null);
    setBuscaEspecie('');
    setMostrarResultados(false);
  };

  const handleCriar = async () => {
    setErro(null);

    if (!especieSelecionada) {
      setErro('Selecione a espécie da planta.');
      return;
    }
    if (!ambiente) {
      setErro('Selecione o ambiente da planta.');
      return;
    }

    setLoading(true);
    try {
      await criarPlanta({
        id_especie: especieSelecionada.id_especie,
        ambiente,
        nome_personalizado: nomePersonalizado.trim() || undefined,
        porte: porte || undefined,
        localizacao_descricao: localizacao.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
        ativa: true,
      });
      navigation.goBack();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErro(error.response?.data?.detail ?? 'Não foi possível cadastrar a planta.');
      } else {
        setErro('Erro de conexão. Verifique sua internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoContainer}>
          <CroopLogo />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.titlePage}>Nova Planta</Text>

            <View style={styles.form}>

              {/* Espécie */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Espécie: <Text style={styles.required}>*</Text></Text>

                {especieSelecionada ? (
                  <View style={styles.especieSelecionada}>
                    <View style={styles.especieInfo}>
                      <Text style={styles.especieNome}>{especieSelecionada.nome_comum}</Text>
                      {especieSelecionada.nome_cientifico && (
                        <Text style={styles.especieCientifico}>{especieSelecionada.nome_cientifico}</Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={limparEspecie} style={styles.limparBtn}>
                      <Text style={styles.limparText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TextInput
                    style={styles.input}
                    value={buscaEspecie}
                    onChangeText={setBuscaEspecie}
                    onFocus={abrirBusca}
                    placeholder="Buscar espécie..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                  />
                )}

                {mostrarResultados && (
                  <View style={styles.dropdown}>
                    {buscando ? (
                      <ActivityIndicator color="#4CAF50" style={{ padding: 12 }} />
                    ) : resultadosBusca.length === 0 ? (
                      <Text style={styles.dropdownVazio}>Nenhuma espécie encontrada.</Text>
                    ) : (
                      <FlatList
                        data={resultadosBusca}
                        keyExtractor={(item) => String(item.id_especie)}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => selecionarEspecie(item)}
                          >
                            <Text style={styles.dropdownNome}>{item.nome_comum}</Text>
                            {item.nome_cientifico && (
                              <Text style={styles.dropdownCientifico}>{item.nome_cientifico}</Text>
                            )}
                          </TouchableOpacity>
                        )}
                      />
                    )}
                  </View>
                )}
              </View>

              {/* Nome personalizado */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome personalizado:</Text>
                <TextInput
                  style={styles.input}
                  value={nomePersonalizado}
                  onChangeText={setNomePersonalizado}
                  onFocus={() => setMostrarResultados(false)}
                  placeholder="ex: Samambaia da sala"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              </View>

              {/* Ambiente */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ambiente: <Text style={styles.required}>*</Text></Text>
                <View style={styles.selectorRow}>
                  {AMBIENTES.map((op) => (
                    <TouchableOpacity
                      key={op}
                      style={[styles.selectorBtn, ambiente === op && styles.selectorBtnActive]}
                      onPress={() => { setMostrarResultados(false); setAmbiente(op); }}
                    >
                      <Text style={[styles.selectorText, ambiente === op && styles.selectorTextActive]}>
                        {op}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Porte */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Porte:</Text>
                <View style={styles.selectorRow}>
                  {PORTES.map((op) => (
                    <TouchableOpacity
                      key={op}
                      style={[styles.selectorBtn, porte === op && styles.selectorBtnActive]}
                      onPress={() => { setMostrarResultados(false); setPorte(porte === op ? '' : op); }}
                    >
                      <Text style={[styles.selectorText, porte === op && styles.selectorTextActive]}>
                        {op}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Localização */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Localização:</Text>
                <TextInput
                  style={styles.input}
                  value={localizacao}
                  onChangeText={setLocalizacao}
                  onFocus={() => setMostrarResultados(false)}
                  placeholder="ex: Varanda, sala de estar"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              </View>

              {/* Observações */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Observações:</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={observacoes}
                  onChangeText={setObservacoes}
                  onFocus={() => setMostrarResultados(false)}
                  multiline
                  numberOfLines={3}
                  placeholder="Informações adicionais..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              </View>

              {erro && <Text style={styles.erroText}>{erro}</Text>}

              <View style={styles.buttons}>
                <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.goBack()} disabled={loading}>
                  <Text style={styles.buttonSecondaryText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonMain} onPress={handleCriar} disabled={loading}>
                  {loading
                    ? <ActivityIndicator color="#FFF" />
                    : <Text style={styles.buttonText}>Cadastrar</Text>
                  }
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  logoContainer: { alignItems: 'center', marginTop: 20 },
  container: { flex: 1, width: '100%' },
  scrollContent: { alignItems: 'center', paddingBottom: 40, paddingHorizontal: 40 },
  titlePage: { color: '#FFF', fontSize: 28, marginBottom: 25, textAlign: 'center', fontWeight: '300' },
  form: { width: '100%' },
  inputGroup: { width: '100%', marginBottom: 16 },
  label: { color: '#4CAF50', fontSize: 15, marginBottom: 6, fontWeight: 'bold' },
  required: { color: '#FF6B6B' },
  input: {
    width: '100%', height: 42, backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10, paddingHorizontal: 15, color: '#FFF',
  },
  inputMultiline: { height: 80, paddingTop: 10, textAlignVertical: 'top' },
  especieSelecionada: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(76,175,80,0.2)', borderRadius: 10,
    borderWidth: 1, borderColor: '#4CAF50', paddingHorizontal: 15, paddingVertical: 10,
  },
  especieInfo: { flex: 1 },
  especieNome: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  especieCientifico: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  limparBtn: { paddingLeft: 10 },
  limparText: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  dropdown: {
    backgroundColor: 'rgba(20,40,20,0.97)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(76,175,80,0.4)', marginTop: 4,
    maxHeight: 220, overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 15, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  dropdownNome: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  dropdownCientifico: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  dropdownVazio: { color: 'rgba(255,255,255,0.4)', fontSize: 13, padding: 12, textAlign: 'center' },
  selectorRow: { flexDirection: 'row', gap: 10 },
  selectorBtn: {
    flex: 1, height: 42, borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  selectorBtnActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  selectorText: { color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  selectorTextActive: { color: '#FFF' },
  erroText: { color: '#FF6B6B', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 20, justifyContent: 'center' },
  buttonMain: {
    flex: 1, backgroundColor: '#4CAF50', height: 50, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  buttonSecondary: {
    flex: 1, height: 50, borderRadius: 15, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center',
  },
  buttonSecondaryText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
});
