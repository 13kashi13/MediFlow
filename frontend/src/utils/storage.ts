import type { User } from '../types';

export const storage = {
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
  
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem('token');
  },
  
  getUser: (): User | null => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    try {
      return JSON.parse(user) as User;
    } catch {
      return null;
    }
  },
  
  setUser: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  removeUser: (): void => {
    localStorage.removeItem('user');
  },
  
  clear: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
