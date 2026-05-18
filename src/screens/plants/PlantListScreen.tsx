import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet, View, Text, FlatList,
  TouchableOpacity, SafeAreaView, StatusBar, Dimensions, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';
import { listarPlantas } from '../../services/plantsService';
import { PlantaResponse } from '../../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'PlantList'>;

const { width } = Dimensions.get('window');

export default function PlantListScreen({ navigation }: Props) {
  const [plantas, setPlantas] = useState<PlantaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const fetchPlantas = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await listarPlantas();
      setPlantas(data);
    } catch {
      setErro('Não foi possível carregar suas plantas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchPlantas(); }, [fetchPlantas]));

  const renderItem = ({ item }: { item: PlantaResponse }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.plantaNome}>{item.nome_personalizado ?? `Planta #${item.id_planta}`}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity>
              <Ionicons name="link-outline" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 15 }}>
              <Ionicons name="pencil-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.plantaInfo}>
          {item.porte ? `Porte: ${item.porte} | ` : ''}Ambiente: {item.ambiente}
        </Text>
      </View>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      );
    }

    if (erro) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.stateText}>{erro}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPlantas}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (plantas.length === 0) {
      return (
        <View style={styles.centerState}>
          <Ionicons name="leaf-outline" size={64} color="rgba(255,255,255,0.3)" />
          <Text style={styles.stateText}>Nenhuma planta cadastrada ainda.</Text>
          <Text style={styles.stateSubText}>Adicione sua primeira planta!</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={plantas}
        keyExtractor={(item) => String(item.id_planta)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <ScreenBackground overlayOpacity={0.8}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <View style={styles.svgContainer}>
            <CroopLogo
              width={180}
              height={70}
              curve="M 40,80 Q 200,10 360,80"
              fontSize={70}
              shadowDy={5}
            />
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconSpacing}>
              <Ionicons name="notifications-outline" size={28} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.profileCircle} />
          </View>
        </View>

        <View style={styles.titleWrapper}>
          <Text style={styles.catalogTitle}>Meu Catálogo</Text>
        </View>

        {renderContent()}

        {!loading && !erro && (
          <View style={styles.footer} pointerEvents="box-none">
            <TouchableOpacity style={styles.btnAdd} onPress={() => navigation.navigate('PlantCreate')}>
              <Text style={styles.btnAddText}>Adicionar planta</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 10, height: 80,
  },
  svgContainer: { flex: 1, alignItems: 'center', marginLeft: 55 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconSpacing: { marginRight: 15 },
  profileCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#4CAF50', borderWidth: 1, borderColor: '#FFF',
  },
  titleWrapper: { width: '100%', alignItems: 'center', justifyContent: 'center', marginVertical: 15 },
  catalogTitle: { color: '#FFF', fontSize: 26, fontWeight: '300', textAlign: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 150 },
  card: {
    borderRadius: 25, marginBottom: 25, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  cardContent: { padding: 20, backgroundColor: 'rgba(0,0,0,0.45)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plantaNome: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cardActions: { flexDirection: 'row' },
  plantaInfo: { color: '#CCC', fontSize: 14, marginTop: 5 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  stateText: { color: '#FFF', fontSize: 16, textAlign: 'center', opacity: 0.7, marginTop: 16 },
  stateSubText: { color: '#4CAF50', fontSize: 14, textAlign: 'center', marginTop: 8, opacity: 0.8 },
  retryButton: { marginTop: 20, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: '#4CAF50' },
  retryText: { color: '#4CAF50', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, right: 20, left: 20, alignItems: 'flex-end' },
  btnAdd: {
    borderWidth: 1.5, borderColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 25,
    borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  btnAddText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});
