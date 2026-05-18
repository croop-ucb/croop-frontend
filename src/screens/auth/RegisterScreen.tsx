import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { AuthStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';
import { cadastrar } from '../../services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

function validarSenha(senha: string, email: string): string | null {
  if (senha.length < 6) return 'A senha deve ter no mínimo 6 caracteres.';
  if (!/[A-Z]/.test(senha)) return 'A senha deve conter ao menos uma letra maiúscula.';
  if (!/[a-z]/.test(senha)) return 'A senha deve conter ao menos uma letra minúscula.';
  if (!/[0-9]/.test(senha)) return 'A senha deve conter ao menos um número.';
  if (/\s/.test(senha)) return 'A senha não pode conter espaços.';
  if (senha === email) return 'A senha não pode ser igual ao e-mail.';
  return null;
}

export default function RegisterScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const handleCadastro = async () => {
    setErro(null);

    if (!nome.trim() || !cpf.trim() || !email.trim() || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos.');
      return;
    }

    const erroSenha = validarSenha(senha, email);
    if (erroSenha) {
      setErro(erroSenha);
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('A confirmação de senha não confere.');
      return;
    }

    setLoading(true);
    try {
      await cadastrar({ nome, cpf, email, senha, confirmacao_senha: confirmarSenha });
      setSucesso(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setErro('Este e-mail já está cadastrado.');
        } else {
          setErro(error.response?.data?.detail ?? 'Não foi possível criar a conta. Tente novamente.');
        }
      } else {
        setErro('Erro de conexão. Verifique sua internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.logoContainer}>
            <CroopLogo />
          </View>
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Cadastro realizado!</Text>
            <Text style={styles.successText}>Sua conta foi criada com sucesso.</Text>
            <TouchableOpacity style={styles.buttonMain} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.buttonText}>Fazer login</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

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
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.titlePage}>Faça seu cadastro!</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome:</Text>
                <TextInput style={styles.input} value={nome} onChangeText={setNome} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CPF:</Text>
                <TextInput style={styles.input} value={cpf} onChangeText={setCpf} keyboardType="numeric" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail:</Text>
                <TextInput
                  style={styles.input} value={email} onChangeText={setEmail}
                  keyboardType="email-address" autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha:</Text>
                <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar senha:</Text>
                <TextInput
                  style={styles.input} value={confirmarSenha}
                  onChangeText={setConfirmarSenha} secureTextEntry
                />
              </View>

              {erro && <Text style={styles.erroText}>{erro}</Text>}

              <TouchableOpacity style={styles.buttonMain} onPress={handleCadastro} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#FFF" />
                  : <Text style={styles.buttonText}>Cadastrar</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
                <Text style={styles.linkGreen}>Já tenho Login!</Text>
              </TouchableOpacity>
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
  titlePage: {
    color: '#FFF', fontSize: 28, marginBottom: 25, textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  form: { width: '100%', alignItems: 'center' },
  inputGroup: { width: '100%', marginBottom: 12 },
  label: { color: '#4CAF50', fontSize: 16, marginBottom: 5, fontWeight: 'bold' },
  input: {
    width: '100%', height: 40, backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10, paddingHorizontal: 15, color: '#FFF',
  },
  erroText: {
    color: '#FF6B6B', fontSize: 13, textAlign: 'center',
    marginBottom: 10, marginTop: 4,
  },
  buttonMain: {
    backgroundColor: '#4CAF50', width: 180, height: 50, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', marginTop: 12,
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  linkContainer: { marginTop: 15 },
  linkGreen: { color: '#4CAF50', textDecorationLine: 'underline', fontSize: 14, fontWeight: '500' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  successTitle: { color: '#4CAF50', fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  successText: { color: '#FFF', fontSize: 16, textAlign: 'center', marginBottom: 40, opacity: 0.8 },
});
