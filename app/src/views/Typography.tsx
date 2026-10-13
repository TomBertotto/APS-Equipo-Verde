import { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, fonts, spacing } from './theme';

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Label({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function BodyText({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && styles.muted]}>{children}</Text>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  return children ? <Text style={styles.error}>{children}</Text> : null;
}

const styles = StyleSheet.create({
  section: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted, textTransform: 'uppercase' },
  body: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  muted: { color: colors.muted },
  error: { fontFamily: fonts.semibold, fontSize: 14, color: colors.danger },
});
