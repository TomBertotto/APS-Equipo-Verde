import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function Home() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(JSON.stringify(data)))
      .catch((err) => setStatus(`error: ${err.message}`));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FIA Connect</Text>
      <Text>API: {status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 24, fontWeight: 'bold' },
});
