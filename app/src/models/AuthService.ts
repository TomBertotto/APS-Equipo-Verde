import { ApiClient } from './ApiClient';

export type User = { username: string; role: string };
export type Session = User & { token: string };

export class AuthService {
  constructor(private api: ApiClient) {}

  register(username: string, password: string) {
    return this.api.request<Session>('/auth/register', 'POST', { username, password });
  }

  login(username: string, password: string) {
    return this.api.request<Session>('/auth/login', 'POST', { username, password });
  }

  logout() {
    return this.api.request('/auth/logout', 'POST');
  }

  me() {
    return this.api.request<User>('/auth/me');
  }
}
