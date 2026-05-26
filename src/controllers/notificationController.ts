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

function getProjectId() {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
}

export async function registerPushNotifications({ userId }: RegisterPushTokenParams) {
  if (!userId) {
    return null;
  }

  const projectId = getProjectId();

  if (!projectId) {
    console.warn('Project ID do EAS não encontrado para push notification.');
    return null;
  }

  const permissionResponse = await Notifications.getPermissionsAsync();

  let finalStatus = permissionResponse.status;

  if (finalStatus !== 'granted') {
    const requestResponse = await Notifications.requestPermissionsAsync();
    finalStatus = requestResponse.status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Permissão de notificação negada.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('next-singer', {
      name: 'Próximo a cantar',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F04BFF',
    });
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  const expoPushToken = tokenResponse.data;

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
    throw new Error(`Não consegui salvar o push token: ${error.message}`);
  }

  return expoPushToken;
}