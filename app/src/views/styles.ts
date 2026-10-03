import { StyleSheet } from 'react-native';

export const formStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  form: { width: '100%', maxWidth: 300, gap: 8 },
  input: { borderWidth: 1, padding: 8 },
  error: { color: 'red' },
});
