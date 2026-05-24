import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { supabase } from './src/lib/supabase';
import { HomeScreen } from './src/screens/HomeScreen';

type AuthStatus = 'loading' | 'success' | 'error';
type AppScreen = 'home' | 'createRoom' | 'joinRoom';

export default function App() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [authMessage, setAuthMessage] = useState('Conectando ao Supabase...');
  const [userId, setUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<AppScreen>('home');

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
          setAuthMessage('Sessão anônima recuperada. O karaokê ainda vive.');
          setAuthStatus('success');
          return;
        }

        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
          throw error;
        }

        if (!isMounted) return;

        setUserId(data.user?.id ?? null);
        setAuthMessage('Usuário anônimo criado. Bora montar essa fila.');
        setAuthStatus('success');
      } catch (error) {
        if (!isMounted) return;

        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

        setAuthMessage(errorMessage);
        setAuthStatus('error');
      }
    }

    startAnonymousSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (authStatus === 'loading') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>{authMessage}</Text>
      </SafeAreaView>
    );
  }

  if (authStatus === 'error') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Deu ruim na conexão.</Text>
          <Text style={styles.errorText}>{authMessage}</Text>
          <Text style={styles.errorHint}>
            Confere o .env.local, a chave pública do Supabase e se Anonymous Sign-Ins está ativo.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'createRoom') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.placeholderTitle}>Criar sala</Text>
        <Text style={styles.placeholderText}>Próxima etapa. Aqui vamos criar a sala no Supabase.</Text>
        <Text style={styles.linkText} onPress={() => setScreen('home')}>
          Voltar
        </Text>
      </SafeAreaView>
    );
  }

  if (screen === 'joinRoom') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.placeholderTitle}>Entrar com código</Text>
        <Text style={styles.placeholderText}>Próxima etapa. Aqui o convidado vai entrar na sala.</Text>
        <Text style={styles.linkText} onPress={() => setScreen('home')}>
          Voltar
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.appContainer}>
      <HomeScreen
        userId={userId}
        onCreateRoom={() => setScreen('createRoom')}
        onJoinRoom={() => setScreen('joinRoom')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#101014',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#101014',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#1B1B22',
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    color: '#FCA5A5',
    fontSize: 24,
    fontWeight: '900',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  errorHint: {
    color: '#C9C9D1',
    fontSize: 14,
    lineHeight: 22,
  },
  placeholderTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 12,
  },
  placeholderText: {
    color: '#C9C9D1',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  linkText: {
    color: '#A7F3D0',
    fontSize: 16,
    fontWeight: '800',
  },
});