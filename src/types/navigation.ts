import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  AuthLanding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  PlantList: undefined;
  PlantCreate: undefined;
  PlantDetail: { plantaId: number; nome: string; ambiente: string; porte: string | null; id_especie: number };
  Schedule: { plantaId: number; nome: string };
  Notification: undefined;
};
