import { TokenStorage } from './TokenStorage';

export class ApiClient {
  constructor(private apiUrl: string, private tokenStorage: TokenStorage) {}

  url(path: string) {
    return `${this.apiUrl}${path}`;
  }

  async request<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const token = await this.tokenStorage.get();
    const res = await fetch(this.url(path), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Error');
    return data;
  }
}
