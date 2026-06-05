import React from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';

type Props = NativeStackScreenProps<RootStackParamList, 'PlantDetail'>;

export default function PlantDetailScreen({ route, navigation }: Props) {
  const { plantaId, nome, ambiente, porte } = route.params;

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

        <View style={styles.content}>
          <Text style={styles.plantaNome}>{nome}</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="leaf-outline" size={18} color="#4CAF50" />
              <Text style={styles.infoLabel}>Ambiente</Text>
              <Text style={styles.infoValue}>{ambiente}</Text>
            </View>
            {porte && (
              <View style={[styles.infoRow, styles.infoRowBorder]}>
                <Ionicons name="resize-outline" size={18} color="#4CAF50" />
                <Text style={styles.infoLabel}>Porte</Text>
                <Text style={styles.infoValue}>{porte}</Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => navigation.navigate('Schedule', { plantaId, nome })}
            >
              <Ionicons name="calendar-outline" size={20} color="#FFF" style={styles.btnIcon} />
              <Text style={styles.btnPrimaryText}>Ver Cronograma</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSecondary}>
              <Ionicons name="water-outline" size={20} color="#4CAF50" style={styles.btnIcon} />
              <Text style={styles.btnSecondaryText}>Irrigar agora</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  plantaNome: {
    color: '#FFF',
    fontSize: 28,
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
  },
  actions: {
    gap: 14,
  },
  btnPrimary: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  btnPrimaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnSecondary: {
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  btnSecondaryText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  btnIcon: {
    marginRight: 8,
  },
});
