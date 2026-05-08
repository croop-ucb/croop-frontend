import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const nextStep = () => setStep(step + 1);

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
          <View style={styles.content}>
            {step === 1 && (
              <View style={styles.form}>
                <Text style={styles.titlePage}>Redefinir senha</Text>
                <Text style={styles.label}>Nome:</Text>
                <TextInput style={styles.input} />
                <Text style={styles.label}>E-mail:</Text>
                <TextInput style={styles.input} keyboardType="email-address" autoCapitalize="none" />
                <Text style={styles.infoText}>
                  Um código de verificação será enviado para o seu endereço de e-mail para redefinir sua senha.
                </Text>
                <TouchableOpacity style={styles.buttonMain} onPress={nextStep}>
                  <Text style={styles.buttonText}>Avançar</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 2 && (
              <View style={styles.form}>
                <Text style={styles.titlePage}>Código de verificação</Text>
                <View style={styles.codeContainer}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TextInput key={i} style={styles.codeInput} keyboardType="numeric" maxLength={1} />
                  ))}
                </View>
                <TouchableOpacity style={styles.buttonMain} onPress={nextStep}>
                  <Text style={styles.buttonText}>Avançar</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 3 && (
              <View style={styles.form}>
                <Text style={styles.titlePage}>Redefinir senha</Text>
                <Text style={styles.label}>Nova senha:</Text>
                <TextInput style={styles.input} secureTextEntry />
                <Text style={styles.label}>Confirmar senha:</Text>
                <TextInput style={styles.input} secureTextEntry />
                <View style={{ height: 40 }} />
                <TouchableOpacity style={styles.buttonMain} onPress={nextStep}>
                  <Text style={styles.buttonText}>Avançar</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 4 && (
              <View style={styles.form}>
                <Text style={[styles.titlePage, { fontSize: 28, marginTop: 50 }]}>
                  {'Senha redefinida\ncom sucesso!'}
                </Text>
                <TouchableOpacity
                  style={[styles.buttonMain, { marginTop: 60 }]}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.buttonText}>Ir para Login</Text>
                </TouchableOpacity>
              </View>
            )}

            {step < 4 && (
              <TouchableOpacity
                onPress={step === 1 ? () => navigation.goBack() : () => setStep(step - 1)}
                style={styles.linkBack}
              >
                <Text style={styles.linkText}>{step === 1 ? 'Voltar ao login' : 'Voltar'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  logoContainer: { alignItems: 'center', marginTop: 20 },
  container: { flex: 1, width: '100%' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  form: { width: '100%', alignItems: 'center' },
  titlePage: { color: '#FFF', fontSize: 26, marginBottom: 30, textAlign: 'center' },
  label: { color: '#4CAF50', fontSize: 16, marginBottom: 5, fontWeight: 'bold', alignSelf: 'flex-start' },
  input: {
    width: '100%', height: 45, backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 15, paddingHorizontal: 15, color: '#FFF', marginBottom: 20,
  },
  infoText: { color: '#4CAF50', fontSize: 13, textAlign: 'center', marginBottom: 30, opacity: 0.8 },
  buttonMain: {
    backgroundColor: '#4CAF50', width: 140, height: 45, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  linkBack: { marginTop: 25 },
  linkText: { color: '#FFF', opacity: 0.6, fontSize: 14, textDecorationLine: 'underline' },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 40 },
  codeInput: {
    width: 45, height: 55, borderWidth: 1, borderColor: '#FFF',
    borderRadius: 8, color: '#FFF', textAlign: 'center', fontSize: 20,
  },
});
