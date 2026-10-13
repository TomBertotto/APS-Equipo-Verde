import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from './theme';

export function StatusView({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

export const Loading = () => <StatusView message="Cargando..." />;
export const AccessDenied = () => <StatusView message="Acceso denegado" />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  text: { fontFamily: fonts.semibold, fontSize: 16, color: colors.muted },
});
