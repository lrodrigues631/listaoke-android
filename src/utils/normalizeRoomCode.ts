export function normalizeRoomCode(code: string): string {
  return code.replace(/\D/g, '').slice(0, 4);
}