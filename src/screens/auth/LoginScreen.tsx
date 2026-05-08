import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    navigation
      .getParent<NativeStackNavigationProp<RootStackParamList>>()
      ?.navigate('PlantList');
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoContainer}>
          <CroopLogo />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <Text style={styles.titlePage}>Login</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Usuário ou E-mail:</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Senha:</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.buttonMain} onPress={handleLogin}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.linkGreen}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não possui conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.footerText, styles.linkBold]}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  logoContainer: { alignItems: 'center', marginTop: 20 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  titlePage: { color: '#FFF', fontSize: 32, marginBottom: 30, fontWeight: '300' },
  form: { width: '100%', alignItems: 'center' },
  label: { color: '#4CAF50', alignSelf: 'flex-start', fontSize: 16, marginBottom: 8, fontWeight: 'bold' },
  input: {
    width: '100%', height: 45, backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 20, marginBottom: 20, paddingHorizontal: 15, color: '#FFF',
  },
  buttonMain: {
    backgroundColor: '#4CAF50', width: 160, height: 50, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  linkGreen: { color: '#4CAF50', marginTop: 15, textDecorationLine: 'underline', fontSize: 12 },
  footer: { flexDirection: 'row', marginTop: 40 },
  footerText: { color: '#FFF', fontSize: 14, opacity: 0.7 },
  linkBold: { fontWeight: 'bold', textDecorationLine: 'underline' },
});
