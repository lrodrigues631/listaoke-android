import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { supabase } from './src/lib/supabase';

type AuthStatus = 'loading' | 'success' | 'error';

export default function App() {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [message, setMessage] = useState('Conectando ao Supabase...');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function startAnonymousSession() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (sessionData.session?.user) {
          if (!isMounted) return;

          setUserId(sessionData.session.user.id);
          setMessage('Sessão anônima recuperada. O karaokê ainda vive.');
          setStatus('success');
          return;
        }

        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
          throw error;
        }

        if (!isMounted) return;

        setUserId(data.user?.id ?? null);
        setMessage('Usuário anônimo criado. Bora montar essa fila.');
        setStatus('success');
      } catch (error) {
        if (!isMounted) return;

        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

        setMessage(errorMessage);
        setStatus('error');
      }
    }

    startAnonymousSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Listaokê Mobile</Text>

        {status === 'loading' && <ActivityIndicator size="large" />}

        <Text style={styles.message}>{message}</Text>

        {userId && (
          <Text style={styles.userId}>
            ID anônimo:
            {'\n'}
            {userId}
          </Text>
        )}

        {status === 'error' && (
          <Text style={styles.errorHint}>
            Se deu ruim aqui, provavelmente é .env, chave do Supabase ou Anonymous Sign-Ins.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101014',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#1B1B22',
    padding: 24,
    gap: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  message: {
    color: '#E7E7EA',
    fontSize: 18,
    lineHeight: 26,
  },
  userId: {
    color: '#A7F3D0',
    fontSize: 13,
    lineHeight: 20,
  },
  errorHint: {
    color: '#FCA5A5',
    fontSize: 14,
    lineHeight: 20,
  },
});