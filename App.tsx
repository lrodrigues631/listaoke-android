import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { colors } from './src/constants/colors';
import { startAnonymousSession } from './src/controllers/authController';
import {
  clearCurrentRoomSession,
  createRoomFlow,
  joinRoomFlow,
  restoreRoomFlow,
} from './src/controllers/roomController';
import { getSavedCurrentRoom } from './src/models/currentRoomStorageModel';
import type { AuthStatus } from './src/types/authTypes';
import type { CurrentRoom } from './src/types/roomTypes';
import { CreateRoomScreen } from './src/views/screens/CreateRoomScreen';
import { HomeScreen } from './src/views/screens/HomeScreen';
import { JoinRoomScreen } from './src/views/screens/JoinRoomScreen';
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

  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [joinRoomError, setJoinRoomError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      try {
        const result = await startAnonymousSession();

        if (!isMounted) return;

        setUserId(result.userId);
        setAuthMessage(result.message);

        const savedRoom = await getSavedCurrentRoom();

        if (savedRoom) {
          try {
            if (isMounted) {
              setAuthMessage('Voltando para sua sala...');
            }

            const restoredRoom = await restoreRoomFlow({
              roomId: savedRoom.roomId,
              userId: result.userId,
            });

            if (!isMounted) return;

            if (restoredRoom) {
              setCurrentRoom(restoredRoom);
              setScreen('room');
              setAuthMessage('Sala restaurada. Bora continuar a cantoria.');
            } else {
              setCurrentRoom(null);
              setScreen('home');
              setAuthMessage(result.message);
            }
          } catch {
            await clearCurrentRoomSession();

            if (!isMounted) return;

            setCurrentRoom(null);
            setScreen('home');
            setAuthMessage(result.message);
          }
        }

        if (!isMounted) return;

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

  async function handleJoinRoom(roomCode: string, guestName: string) {
    if (!userId) {
      setJoinRoomError('Ainda não identifiquei seu usuário anônimo. Tenta de novo em alguns segundos.');
      return;
    }

    try {
      setJoinRoomError(null);
      setIsJoiningRoom(true);

      const joinedRoom = await joinRoomFlow({
        roomCode,
        guestName,
        userId,
      });

      setCurrentRoom(joinedRoom);
      setScreen('room');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao entrar na sala.';
      setJoinRoomError(errorMessage);
    } finally {
      setIsJoiningRoom(false);
    }
  }

  function handleBackHome() {
    setCurrentRoom(null);
    setCreateRoomError(null);
    setJoinRoomError(null);
    setScreen('home');
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
      <SafeAreaView style={styles.appContainer}>
        <JoinRoomScreen
          isJoining={isJoiningRoom}
          errorMessage={joinRoomError}
          onBack={() => {
            setJoinRoomError(null);
            setScreen('home');
          }}
          onJoinRoom={handleJoinRoom}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'room' && currentRoom) {
    return (
      <SafeAreaView style={styles.appContainer}>
        <RoomScreen room={currentRoom} onBackHome={handleBackHome} />
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
        onJoinRoom={() => {
          setJoinRoomError(null);
          setScreen('joinRoom');
        }}
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
});