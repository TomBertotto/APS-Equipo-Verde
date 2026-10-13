import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useContainer } from '../di/container';
import { Session, User } from '../models/AuthService';

type AuthState = {
  currentUser: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
};

const AuthContext = createContext<AuthState | null>(null);

// Sesión compartida por la barra de navegación y todas las pantallas
export function AuthProvider({ children }: { children: ReactNode }) {
  const { authService, tokenStorage } = useContainer();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (await tokenStorage.get()) {
        try {
          setCurrentUser(await authService.me());
        } catch {
          await tokenStorage.clear();
        }
      }
      setLoading(false);
    })();
  }, []);

  async function startSession({ token, ...user }: Session) {
    await tokenStorage.set(token);
    setCurrentUser(user);
  }

  const value: AuthState = {
    currentUser,
    loading,
    login: async (username, password) => startSession(await authService.login(username, password)),
    register: async (username, password) => startSession(await authService.register(username, password)),
    logout: async () => {
      await authService.logout().catch(() => {});
      await tokenStorage.clear();
      setCurrentUser(null);
    },
    can: (permission) => currentUser?.permissions.includes(permission) ?? false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return auth;
}
