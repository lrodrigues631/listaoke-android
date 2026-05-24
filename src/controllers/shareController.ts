import * as Clipboard from 'expo-clipboard';

type CopyRoomInviteParams = {
  roomName: string;
  roomCode: string;
};

export async function copyRoomCode(roomCode: string): Promise<void> {
  await Clipboard.setStringAsync(roomCode);
}

export async function copyRoomInvite({
  roomName,
  roomCode,
}: CopyRoomInviteParams): Promise<void> {
  const inviteText = `Bora cantar no Listaokê?\n\nSala: ${roomName}\nCódigo: ${roomCode}\n\nEntra pelo código e já se prepara pra fila.`;

  await Clipboard.setStringAsync(inviteText);
}