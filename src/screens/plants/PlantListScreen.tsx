import React from 'react';
import {
  StyleSheet, View, Text, Image, FlatList,
  TouchableOpacity, SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';

type Props = NativeStackScreenProps<RootStackParamList, 'PlantList'>;

const { width } = Dimensions.get('window');

const PLANTAS = [
  {
    id: '1',
    nome: 'Espada de São Jorge',
    porte: 'Médio',
    ambiente: 'Meia-Sombra',
    imagem: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSv0s-4e5HYtGpHCLSzW2QoZ8W8E2nbXOVKew4uxkjdYZhS2gqbtAd4i9TZwssIaVjnRPBM1hOBO-6FvtROxCofXhmxdkAxkFBvIruKQOdJQA&s=10',
  },
];

export default function PlantListScreen({ navigation }: Props) {
  const renderItem = ({ item }: { item: typeof PLANTAS[0] }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Image source={{ uri: item.imagem }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.plantaNome}>{item.nome}</Text>
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
          Porte: {item.porte} | Ambiente: {item.ambiente}
        </Text>
      </View>
    </TouchableOpacity>
  );

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

        <FlatList
          data={PLANTAS}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer} pointerEvents="box-none">
          <TouchableOpacity style={styles.btnAdd}>
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
  cardContent: { padding: 20, backgroundColor: 'rgba(0,0,0,0.45)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plantaNome: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cardActions: { flexDirection: 'row' },
  plantaInfo: { color: '#CCC', fontSize: 14, marginTop: 5 },
  footer: { position: 'absolute', bottom: 30, right: 20, left: 20, alignItems: 'flex-end' },
  btnAdd: {
    borderWidth: 1.5, borderColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 25,
    borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  btnAddText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});
