import { createContext, ReactNode, useContext } from 'react';
import { AccessService } from '../models/AccessService';
import { CalendarService } from '../models/CalendarService';
import { ApiClient } from '../models/ApiClient';
import { AuthService } from '../models/AuthService';
import { CommunicationsService } from '../models/CommunicationsService';
import { ProfilesService } from '../models/ProfilesService';
import { ResultsService } from '../models/ResultsService';
import { TokenStorage } from '../models/TokenStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export type Container = {
  authService: AuthService;
  profilesService: ProfilesService;
  accessService: AccessService;
  calendarService: CalendarService;
  resultsService: ResultsService;
  communicationsService: CommunicationsService;
  tokenStorage: TokenStorage;
};

const tokenStorage = new TokenStorage();
const apiClient = new ApiClient(API_URL, tokenStorage);

const defaultContainer: Container = {
  authService: new AuthService(apiClient),
  profilesService: new ProfilesService(apiClient),
  accessService: new AccessService(apiClient),
  calendarService: new CalendarService(apiClient),
  resultsService: new ResultsService(apiClient),
  communicationsService: new CommunicationsService(apiClient),
  tokenStorage,
};

const ContainerContext = createContext<Container>(defaultContainer);

export function ContainerProvider({ children }: { children: ReactNode }) {
  return <ContainerContext.Provider value={defaultContainer}>{children}</ContainerContext.Provider>;
}

export function useContainer() {
  return useContext(ContainerContext);
}
