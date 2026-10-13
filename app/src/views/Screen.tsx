import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from './theme';

export function Screen({
  title,
  maxWidth = 640,
  children,
}: {
  title?: string;
  maxWidth?: number;
  children: ReactNode;
}) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.page}>
      <View style={[styles.column, { maxWidth }]}>
        {title ? (
          <View style={styles.titleRow}>
            <View style={styles.accent} />
            <Text style={styles.title}>{title}</Text>
          </View>
        ) : null}
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  page: { alignItems: 'center', padding: spacing.md, paddingBottom: spacing.xl },
  column: { width: '100%', gap: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  accent: { width: 6, alignSelf: 'stretch', backgroundColor: colors.primary },
  title: { fontFamily: fonts.black, fontSize: 26, color: colors.text, textTransform: 'uppercase', flexShrink: 1 },
});
