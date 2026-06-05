import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'croop_token';

let _token: string | null = null;

export async function saveToken(token: string): Promise<void> {
  _token = token;
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function loadToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    _token = localStorage.getItem(TOKEN_KEY);
  } else {
    _token = await SecureStore.getItemAsync(TOKEN_KEY);
  }
  return _token;
}

export function getToken(): string | null {
  return _token;
}

export async function clearToken(): Promise<void> {
  _token = null;
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}
