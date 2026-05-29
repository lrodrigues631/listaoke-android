import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { supabase } from '../config/supabase';

type RegisterPushTokenParams = {
  userId: string;
};

const ENABLE_PUSH_DEBUG_ALERTS = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function showPushDebug(title: string, message: string) {
  if (!ENABLE_PUSH_DEBUG_ALERTS) {
    return;
  }

  Alert.alert(title, message);
}

function getProjectId() {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
}

export async function registerPushNotifications({ userId }: RegisterPushTokenParams) {
  try {
    if (!userId) {
      showPushDebug('Push debug', 'Sem userId. Não deu para registrar notificação.');
      return null;
    }

    const projectId = getProjectId();

    if (!projectId) {
      showPushDebug(
        'Push debug',
        'Não encontrei o projectId do EAS. Confere o extra.eas.projectId no app.json.'
      );
      return null;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      showPushDebug('Push debug', `Erro ao validar usuário no Supabase:\n${userError.message}`);
      return null;
    }

    if (!userData.user?.id) {
      showPushDebug('Push debug', 'Usuário Supabase não encontrado na sessão atual.');
      return null;
    }

    if (userData.user.id !== userId) {
      showPushDebug(
        'Push debug',
        `UserId do app diferente da sessão Supabase.\nApp: ${userId}\nSessão: ${userData.user.id}`
      );
      return null;
    }

    const permissionResponse = await Notifications.getPermissionsAsync();

    let finalStatus = permissionResponse.status;

    if (finalStatus !== 'granted') {
      const requestResponse = await Notifications.requestPermissionsAsync();
      finalStatus = requestResponse.status;
    }

    if (finalStatus !== 'granted') {
      showPushDebug('Push debug', 'Permissão de notificação negada pelo usuário.');
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

    let expoPushToken: string;

    try {
      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      expoPushToken = tokenResponse.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      showPushDebug(
        'Push debug',
        `Não consegui gerar o ExpoPushToken.\n\nProject ID:\n${projectId}\n\nErro:\n${message}`
      );

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
      showPushDebug(
        'Push debug',
        `Token gerado, mas não consegui salvar no Supabase.\n\nErro:\n${error.message}\n\nToken:\n${expoPushToken}`
      );

      return null;
    }

    showPushDebug(
      'Push ativado',
      `Token salvo no Supabase.\n\n${expoPushToken.slice(0, 40)}...`
    );

    return expoPushToken;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    showPushDebug('Push debug', `Erro inesperado:\n${message}`);

    return null;
  }
}