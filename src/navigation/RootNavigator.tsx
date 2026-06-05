import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { loadToken } from '../services/tokenStore';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import PlantListScreen from '../screens/plants/PlantListScreen';
import PlantCreateScreen from '../screens/plants/PlantCreateScreen';
import NotificationScreen from '../screens/notification/NotificationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    loadToken().then((token) => {
      setInitialRoute(token ? 'PlantList' : 'Onboarding');
    });
  }, []);

  if (!initialRoute) return null;

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="PlantList" component={PlantListScreen} />
      <Stack.Screen name="PlantCreate" component={PlantCreateScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
    </Stack.Navigator>
  );
}
