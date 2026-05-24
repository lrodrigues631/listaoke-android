export type AuthStatus = 'loading' | 'success' | 'error';

export type AnonymousAuthResult = {
  userId: string;
  message: string;
};