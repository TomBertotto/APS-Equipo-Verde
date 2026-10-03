export type Session = { token: string; username: string };

export class AuthService {
  constructor(private apiUrl: string) {}

  private async request(path: string, init: RequestInit = {}, token?: string) {
    const res = await fetch(`${this.apiUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Error');
    return data;
  }

  register(username: string, password: string): Promise<Session> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  login(username: string, password: string): Promise<Session> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  logout(token: string) {
    return this.request('/auth/logout', { method: 'POST' }, token);
  }

  me(token: string): Promise<{ username: string }> {
    return this.request('/auth/me', {}, token);
  }
}
