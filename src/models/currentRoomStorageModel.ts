import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_ROOM_STORAGE_KEY = '@listaoke/current-room';

export type SavedCurrentRoom = {
  roomId: string;
  savedAt: string;
};

export async function saveCurrentRoom(roomId: string): Promise<void> {
  const payload: SavedCurrentRoom = {
    roomId,
    savedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(CURRENT_ROOM_STORAGE_KEY, JSON.stringify(payload));
}

export async function getSavedCurrentRoom(): Promise<SavedCurrentRoom | null> {
  const rawValue = await AsyncStorage.getItem(CURRENT_ROOM_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<SavedCurrentRoom>;

    if (!parsedValue.roomId || typeof parsedValue.roomId !== 'string') {
      await clearSavedCurrentRoom();
      return null;
    }

    return {
      roomId: parsedValue.roomId,
      savedAt:
        typeof parsedValue.savedAt === 'string'
          ? parsedValue.savedAt
          : new Date().toISOString(),
    };
  } catch {
    await clearSavedCurrentRoom();
    return null;
  }
}

export async function clearSavedCurrentRoom(): Promise<void> {
  await AsyncStorage.removeItem(CURRENT_ROOM_STORAGE_KEY);
}