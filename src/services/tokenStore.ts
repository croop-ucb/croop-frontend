import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'croop_token';

let _token: string | null = null;

export async function saveToken(token: string): Promise<void> {
  _token = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function loadToken(): Promise<string | null> {
  _token = await SecureStore.getItemAsync(TOKEN_KEY);
  return _token;
}

export function getToken(): string | null {
  return _token;
}

export async function clearToken(): Promise<void> {
  _token = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
