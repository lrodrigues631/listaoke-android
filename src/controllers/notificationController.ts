import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { supabase } from '../config/supabase';

type RegisterPushTokenParams = {
  userId: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function warnPushRegistration(message: string, error?: unknown) {
  if (error) {
    console.warn(`[push] ${message}`, error);
    return;
  }

  console.warn(`[push] ${message}`);
}

function getProjectId() {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
}

async function configureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await Notifications.setNotificationChannelAsync('next-singer', {
      name: 'Próximo a cantar',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F04BFF',
    });
  } catch (error) {
    warnPushRegistration('Não foi possível configurar o canal Android next-singer.', error);
  }
}

export async function registerPushNotifications({ userId }: RegisterPushTokenParams) {
  try {
    if (!userId) {
      warnPushRegistration('Registro de notificações ignorado: usuário não identificado.');
      return null;
    }

    const projectId = getProjectId();

    if (!projectId) {
      warnPushRegistration('Registro de notificações ignorado: projectId do EAS ausente.');
      return null;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      warnPushRegistration('Não foi possível validar o usuário no Supabase.', userError);
      return null;
    }

    if (!userData.user?.id) {
      warnPushRegistration('Registro de notificações ignorado: sessão Supabase ausente.');
      return null;
    }

    if (userData.user.id !== userId) {
      warnPushRegistration('Registro de notificações ignorado: usuário local difere da sessão.');
      return null;
    }

    await configureAndroidNotificationChannel();

    const permissionResponse = await Notifications.getPermissionsAsync();

    let finalStatus = permissionResponse.status;

    if (finalStatus !== 'granted') {
      const requestResponse = await Notifications.requestPermissionsAsync();
      finalStatus = requestResponse.status;
    }

    if (finalStatus !== 'granted') {
      warnPushRegistration('Permissão de notificação não concedida.');
      return null;
    }

    let expoPushToken: string;

    try {
      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      expoPushToken = tokenResponse.data;
    } catch (error) {
      warnPushRegistration('Não foi possível gerar o ExpoPushToken.', error);
      return null;
    }

    const { error } = await supabase.from('push_tokens').upsert(
      {
        user_id: userId,
        expo_push_token: expoPushToken,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,expo_push_token',
      }
    );

    if (error) {
      warnPushRegistration('Token gerado, mas não foi possível salvar no Supabase.', error);
      return null;
    }

    return expoPushToken;
  } catch (error) {
    warnPushRegistration('Erro inesperado ao registrar notificações.', error);
    return null;
  }
}
