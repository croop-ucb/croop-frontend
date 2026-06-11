import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text,
  Dimensions, Animated, StatusBar,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import CroopLogo from './src/components/CroopLogo';
import { navigationRef } from './src/navigation/navigationRef';
import { loadToken } from './src/services/tokenStore';

const { width, height } = Dimensions.get('window');

const BouncingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -15, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      );
    };
    animate(dot1, 0).start();
    animate(dot2, 200).start();
    animate(dot3, 400).start();
  }, []);

  return (
    <View style={styles.dotRow}>
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
};

export default function App() {
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        loadToken(),
        new Promise(resolve => setTimeout(resolve, 3000)),
      ]);
      setCarregando(false);
    };
    init();
  }, []);

  if (carregando) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        {/* Trocamos o ImageBackground por uma View escura segura para evitar a Tela Branca */}
        <View style={styles.safeBackground}>
          <View style={styles.overlay}>
            <CroopLogo width={width * 0.85} height={130} fontSize={70} shadowDy={5} />

            <View style={styles.loaderArea}>
              <BouncingDots />
              <Text style={styles.loadingText}>CARREGANDO</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1C10' },
  safeBackground: { width, height, flex: 1, backgroundColor: '#0B1C10' }, // Cor verde escuro do seu app
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 80, // Ajustado para dar mais espaço ao SVG topo
    paddingBottom: 60,
  },
  loaderArea: { alignItems: 'center', marginBottom: 50 },
  dotRow: { flexDirection: 'row', marginBottom: 20 },
  dot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#FFFFFF', marginHorizontal: 6,
  },
  loadingText: { color: '#FFF', fontSize: 12, letterSpacing: 5, fontWeight: 'bold' },
});