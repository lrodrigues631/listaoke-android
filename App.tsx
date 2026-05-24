import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { colors } from './src/constants/colors';
import { startAnonymousSession } from './src/controllers/authController';
import { createRoomFlow } from './src/controllers/roomController';
import type { AuthStatus } from './src/types/authTypes';
import type { CurrentRoom } from './src/types/roomTypes';
import { CreateRoomScreen } from './src/views/screens/CreateRoomScreen';
import { HomeScreen } from './src/views/screens/HomeScreen';
import { RoomScreen } from './src/views/screens/RoomScreen';

type AppScreen = 'home' | 'createRoom' | 'joinRoom' | 'room';

export default function App() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [authMessage, setAuthMessage] = useState('Conectando ao Supabase...');
  const [userId, setUserId] = useState<string | null>(null);

  const [screen, setScreen] = useState<AppScreen>('home');
  const [currentRoom, setCurrentRoom] = useState<CurrentRoom | null>(null);

  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [createRoomError, setCreateRoomError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      try {
        const result = await startAnonymousSession();

        if (!isMounted) return;

        setUserId(result.userId);
        setAuthMessage(result.message);
        setAuthStatus('success');
      } catch (error) {
        if (!isMounted) return;

        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

        setAuthMessage(errorMessage);
        setAuthStatus('error');
      }
    }

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCreateRoom(roomName: string, ownerName: string) {
    if (!userId) {
      setCreateRoomError('Ainda não identifiquei seu usuário anônimo. Tenta de novo em alguns segundos.');
      return;
    }

    try {
      setCreateRoomError(null);
      setIsCreatingRoom(true);

      const createdRoom = await createRoomFlow({
        roomName,
        ownerName,
        userId,
      });

      setCurrentRoom(createdRoom);
      setScreen('room');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao criar sala.';
      setCreateRoomError(errorMessage);
    } finally {
      setIsCreatingRoom(false);
    }
  }

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
      <SafeAreaView style={styles.appContainer}>
        <CreateRoomScreen
          isCreating={isCreatingRoom}
          errorMessage={createRoomError}
          onBack={() => {
            setCreateRoomError(null);
            setScreen('home');
          }}
          onCreateRoom={handleCreateRoom}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'joinRoom') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.placeholderTitle}>Entrar com código</Text>
        <Text style={styles.placeholderText}>
          Próxima etapa. Aqui vamos criar a entrada por código da sala.
        </Text>
        <Text style={styles.linkText} onPress={() => setScreen('home')}>
          Voltar
        </Text>
      </SafeAreaView>
    );
  }

  if (screen === 'room' && currentRoom) {
    return (
      <SafeAreaView style={styles.appContainer}>
        <RoomScreen
          room={currentRoom}
          onBackHome={() => {
            setCurrentRoom(null);
            setCreateRoomError(null);
            setScreen('home');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.appContainer}>
      <HomeScreen
        userId={userId}
        authMessage={authMessage}
        onCreateRoom={() => {
          setCreateRoomError(null);
          setScreen('createRoom');
        }}
        onJoinRoom={() => setScreen('joinRoom')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: colors.text,
    marginTop: 16,
    fontSize: 16,
  },
  errorCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 24,
    fontWeight: '900',
  },
  errorText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  errorHint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  placeholderTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 12,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  linkText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
});