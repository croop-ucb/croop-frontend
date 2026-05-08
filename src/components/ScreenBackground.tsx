import React from 'react';
import { ImageBackground, View, StyleSheet, Dimensions, ViewStyle } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
  overlayOpacity?: number;
  style?: ViewStyle;
}

export default function ScreenBackground({ children, overlayOpacity = 0.7, style }: Props) {
  return (
    <ImageBackground
      source={require('../../assets/fundo.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: `rgba(0,0,0,${overlayOpacity})` }, style]}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width, height },
  overlay: { flex: 1 },
});
