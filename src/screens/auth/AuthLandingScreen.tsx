import React from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  Dimensions, SafeAreaView, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<AuthStackParamList, 'AuthLanding'>;

export default function AuthLandingScreen({ navigation }: Props) {
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <CroopLogo />
        </View>

        <View style={styles.contentArea}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.mainButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>Cadastro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  logoContainer: { marginTop: 40 },
  contentArea: { flex: 1, width: '100%', justifyContent: 'center' },
  buttonContainer: { alignItems: 'center', gap: 20 },
  mainButton: {
    backgroundColor: '#4CAF50',
    width: width * 0.7,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
      android: { elevation: 5 },
    }),
  },
  btnText: { color: '#FFF', fontSize: 20, fontWeight: '600' },
});
