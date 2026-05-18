import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, Image, FlatList,
  TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';
import { getUserPlants } from '../../services/plantsService';
import { Plant } from '../../types/plant';

type Props = NativeStackScreenProps<RootStackParamList, 'PlantList'>;

export default function PlantListScreen({ navigation }: Props) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserPlants();
      setPlants(data);
    } catch {
      setError('Não foi possível carregar as plantas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  const renderItem = ({ item }: { item: Plant }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      {item.imagem ? (
        <Image source={{ uri: item.imagem }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Ionicons name="leaf-outline" size={48} color="rgba(255,255,255,0.3)" />
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.plantaNome}>{item.nome}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('PlantForm', { plantId: item.id })}
            >
              <Ionicons name="pencil-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.plantaInfo}>
          Porte: {item.porte} | Ambiente: {item.ambiente}
        </Text>
        {item.especie ? (
          <Text style={styles.plantaEspecie}>{item.especie}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.stateText}>Carregando plantas…</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchPlants}>
            <Text style={styles.retryBtnText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (plants.length === 0) {
      return (
        <View style={styles.centerState}>
          <Ionicons name="leaf-outline" size={64} color="rgba(255,255,255,0.3)" />
          <Text style={styles.stateTitle}>Nenhuma planta cadastrada</Text>
          <Text style={styles.stateText}>
            Adicione sua primeira planta para começar a monitorá-la.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
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

        <View style={styles.footer} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.btnAdd}
            onPress={() => navigation.navigate('PlantForm', undefined)}
          >
            <Text style={styles.btnAddText}>Adicionar planta</Text>
          </TouchableOpacity>
        </View>
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
  cardImage: { width: '100%', height: 200 },
  cardImagePlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardContent: { padding: 20, backgroundColor: 'rgba(0,0,0,0.45)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plantaNome: { color: '#FFF', fontSize: 18, fontWeight: 'bold', flex: 1 },
  cardActions: { flexDirection: 'row' },
  plantaInfo: { color: '#CCC', fontSize: 14, marginTop: 5 },
  plantaEspecie: { color: '#A8D5BA', fontSize: 13, marginTop: 3, fontStyle: 'italic' },
  centerState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, paddingBottom: 100,
  },
  stateTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 16, textAlign: 'center' },
  stateText: { color: '#CCC', fontSize: 14, marginTop: 8, textAlign: 'center' },
  retryBtn: {
    marginTop: 20, borderWidth: 1.5, borderColor: '#4CAF50',
    paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20,
  },
  retryBtnText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 14 },
  footer: { position: 'absolute', bottom: 30, right: 20, left: 20, alignItems: 'flex-end' },
  btnAdd: {
    borderWidth: 1.5, borderColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 25,
    borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  btnAddText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});
