import axios from 'axios';
import { getToken, clearToken } from './tokenStore';
import { navigationRef } from '../navigation/navigationRef';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'bypass-tunnel-authorization': 'true',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearToken();
      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'Auth' }] });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
