import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { loadToken } from './src/services/tokenStore';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    loadToken().then(() => {
      setPronto(true);
      SplashScreen.hideAsync();
    });
  }, []);

  if (!pronto) return null;

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  );
}
