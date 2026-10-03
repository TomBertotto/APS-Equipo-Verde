import { createContext, ReactNode, useContext } from 'react';
import { AuthService } from '../models/AuthService';
import { TokenStorage } from '../models/TokenStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export type Container = {
  authService: AuthService;
  tokenStorage: TokenStorage;
};

const defaultContainer: Container = {
  authService: new AuthService(API_URL),
  tokenStorage: new TokenStorage(),
};

const ContainerContext = createContext<Container>(defaultContainer);

export function ContainerProvider({ children }: { children: ReactNode }) {
  return <ContainerContext.Provider value={defaultContainer}>{children}</ContainerContext.Provider>;
}

export function useContainer() {
  return useContext(ContainerContext);
}
