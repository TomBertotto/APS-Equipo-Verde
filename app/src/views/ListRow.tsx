import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from './theme';

// Fila de listado con título, detalle y acciones (botones chicos) a la derecha
export function ListRow({ title, detail, children }: { title: string; detail?: string; children?: ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  text: { flex: 1 },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  detail: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  actions: { flexDirection: 'row', gap: spacing.xs },
});
