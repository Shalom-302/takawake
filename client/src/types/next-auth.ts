/**
 * Types pour l'extension de next-auth
 */

export interface User {
  id: string | number;
  email?: string;
  name?: string;
  image?: string;
  role?: string;
}

export interface Session {
  user?: User;
  expires: string;
}
