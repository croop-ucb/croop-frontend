import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

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

              <TouchableOpacity style={styles.buttonMain}>
                <Text style={styles.buttonText}>Próximo</Text>
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
  buttonMain: {
    backgroundColor: '#4CAF50', width: 180, height: 50, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  linkContainer: { marginTop: 15 },
  linkGreen: { color: '#4CAF50', textDecorationLine: 'underline', fontSize: 14, fontWeight: '500' },
});
