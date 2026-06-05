import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';
import { getEspecie } from '../../services/especiesService';
import { deletarPlanta } from '../../services/plantsService';
import { EspecieResponse } from '../../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'PlantDetail'>;

export default function PlantDetailScreen({ route, navigation }: Props) {
  const { plantaId, nome, ambiente, porte, id_especie } = route.params;

  const [especie, setEspecie] = useState<EspecieResponse | null>(null);
  const [carregandoEspecie, setCarregandoEspecie] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    getEspecie(id_especie)
      .then(setEspecie)
      .catch(() => setEspecie(null))
      .finally(() => setCarregandoEspecie(false));
  }, [id_especie]);

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
          <TouchableOpacity onPress={() => navigation.navigate('PlantEdit', { plantaId })} style={styles.backButton}>
            <Ionicons name="pencil-outline" size={22} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.plantaNome}>{nome}</Text>

          {carregandoEspecie ? (
            <ActivityIndicator size="small" color="#4CAF50" style={styles.especieLoader} />
          ) : especie && (
            <View style={styles.especieContainer}>
              <Text style={styles.especieNome}>{especie.nome_comum}</Text>
              {especie.nome_cientifico && (
                <Text style={styles.especieCientifico}>{especie.nome_cientifico}</Text>
              )}
            </View>
          )}

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
            {especie?.necessidade_luz && (
              <View style={[styles.infoRow, styles.infoRowBorder]}>
                <Ionicons name="sunny-outline" size={18} color="#4CAF50" />
                <Text style={styles.infoLabel}>Luz</Text>
                <Text style={styles.infoValue}>{especie.necessidade_luz}</Text>
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

            <TouchableOpacity
              style={styles.btnDanger}
              disabled={excluindo}
              onPress={() => Alert.alert(
                'Excluir planta',
                `Tem certeza que deseja excluir "${nome}"? Esta ação não pode ser desfeita.`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                      setExcluindo(true);
                      try {
                        await deletarPlanta(plantaId);
                        navigation.navigate('PlantList');
                      } catch {
                        Alert.alert('Erro', 'Não foi possível excluir a planta.');
                        setExcluindo(false);
                      }
                    },
                  },
                ]
              )}
            >
              {excluindo
                ? <ActivityIndicator color="#FF5252" />
                : <>
                    <Ionicons name="trash-outline" size={20} color="#FF5252" style={styles.btnIcon} />
                    <Text style={styles.btnDangerText}>Excluir planta</Text>
                  </>
              }
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
    paddingTop: 20,
  },
  plantaNome: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 8,
  },
  especieLoader: { marginBottom: 20 },
  especieContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  especieNome: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: '600',
  },
  especieCientifico: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
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
  actions: { gap: 14 },
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
  btnPrimaryText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
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
  btnSecondaryText: { color: '#4CAF50', fontSize: 16, fontWeight: '600' },
  btnIcon: { marginRight: 8 },
  btnDanger: {
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FF5252',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  btnDangerText: { color: '#FF5252', fontSize: 16, fontWeight: '600' },
});
