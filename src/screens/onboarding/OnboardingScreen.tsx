import React, { useState, useRef } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  SafeAreaView, StatusBar, FlatList, Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const DATA = [
  { id: '1', titulo: 'Seja bem-vindo(a)!', descricao: '' },
  { id: '2', titulo: 'Cuide das suas plantas com facilidade e eficiência', descricao: 'Monitore, organize e acompanhe a saúde das suas plantas em um só lugar.' },
  { id: '3', titulo: 'Controle inteligente e automático', descricao: 'Acompanhe a umidade, receba alertas e ative a irrigação sempre que necessário.' },
  { id: '4', titulo: 'Receba recomendações personalizadas', descricao: 'Nosso sistema analisa suas plantas e sugere os melhores cuidados para cada uma delas.' },
  { id: '5', titulo: 'Vamos Começar?', descricao: '' },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const goToNext = () => {
    if (activeIndex < DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      navigation.navigate('Auth', { screen: 'AuthLanding' });
    }
  };

  const skipAll = () => {
    const lastIndex = DATA.length - 1;
    flatListRef.current?.scrollToIndex({ index: lastIndex, animated: true });
    setActiveIndex(lastIndex);
  };

  const renderItem = ({ item }: { item: typeof DATA[0] }) => (
    <View style={styles.slide}>
      <Text style={styles.titleText}>{item.titulo}</Text>
      {item.descricao !== '' && (
        <Text style={styles.descriptionText}>{item.descricao}</Text>
      )}
    </View>
  );

  return (
    <ScreenBackground overlayOpacity={0.3}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <CroopLogo />
        </View>

        <FlatList
          ref={flatListRef}
          data={DATA}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          snapToInterval={width}
          snapToAlignment="center"
        />

        <View style={styles.footer}>
          <TouchableOpacity style={styles.navButton} onPress={skipAll}>
            <Text style={styles.buttonText}>Pular</Text>
          </TouchableOpacity>

          <View style={styles.pagination}>
            {DATA.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, activeIndex === index ? styles.activeDot : styles.inactiveDot]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.navButton} onPress={goToNext}>
            <Text style={styles.buttonText}>
              {activeIndex === DATA.length - 1 ? 'Iniciar' : 'Próximo'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  logoContainer: { marginTop: 40, alignItems: 'center' },
  slide: { width, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  titleText: {
    color: '#A8D5BA', fontSize: 26, textAlign: 'center', fontWeight: '600', marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5,
  },
  descriptionText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 30, paddingBottom: 50,
  },
  navButton: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', paddingVertical: 8,
    paddingHorizontal: 20, borderRadius: 20, minWidth: 90, alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  pagination: { flexDirection: 'row' },
  dot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 4 },
  activeDot: { backgroundColor: '#4CAF50', width: 8, height: 8 },
  inactiveDot: { backgroundColor: 'rgba(255,255,255,0.2)' },
});
