import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'auth_token';

export class TokenStorage {
  get() {
    return AsyncStorage.getItem(KEY);
  }

  set(token: string) {
    return AsyncStorage.setItem(KEY, token);
  }

  clear() {
    return AsyncStorage.removeItem(KEY);
  }
}
