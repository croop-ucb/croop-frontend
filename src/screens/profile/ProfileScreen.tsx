import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';
import { getMe } from '../../services/usuarioService';
import { clearToken } from '../../services/tokenStore';
import { UsuarioResponse } from '../../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function ProfileScreen({ navigation }: Props) {
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    getMe()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false));
  }, []);

  const handleLogout = async () => {
    setSaindo(true);
    await clearToken();
    navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
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
          <CroopLogo width={140} height={55} curve="M 40,80 Q 200,10 360,80" fontSize={55} shadowDy={4} />
        </View>

        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={44} color="#4CAF50" />
            </View>
          </View>

          {carregando && <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 32 }} />}

          {!carregando && usuario && (
            <>
              <Text style={styles.nomeUsuario}>{usuario.nome}</Text>

              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={18} color="#4CAF50" />
                  <Text style={styles.infoLabel}>E-mail</Text>
                  <Text style={styles.infoValue}>{usuario.email}</Text>
                </View>
                <View style={[styles.infoRow, styles.infoRowBorder]}>
                  <Ionicons name="calendar-outline" size={18} color="#4CAF50" />
                  <Text style={styles.infoLabel}>Membro desde</Text>
                  <Text style={styles.infoValue}>{formatarData(usuario.data_cadastro)}</Text>
                </View>
              </View>
            </>
          )}

          {!carregando && !usuario && (
            <Text style={styles.erroText}>Não foi possível carregar os dados do perfil.</Text>
          )}

          <TouchableOpacity
            style={styles.btnLogout}
            onPress={handleLogout}
            disabled={saindo}
          >
            {saindo
              ? <ActivityIndicator color="#FF5252" />
              : <>
                  <Ionicons name="log-out-outline" size={20} color="#FF5252" style={{ marginRight: 8 }} />
                  <Text style={styles.btnLogoutText}>Sair da conta</Text>
                </>
            }
          </TouchableOpacity>
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
  backButton: { width: 40, alignItems: 'flex-start' },
  logoContainer: { flex: 1, alignItems: 'center' },
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(76,175,80,0.15)',
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nomeUsuario: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 28,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 32,
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
  infoValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  erroText: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 32,
  },
  btnLogout: {
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FF5252',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  btnLogoutText: { color: '#FF5252', fontSize: 16, fontWeight: '600' },
});
