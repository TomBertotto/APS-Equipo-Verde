import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, spacing } from './theme';

// light: borde y texto blancos, para fondos oscuros
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'light';

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  small = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  small?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        variantStyles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, small && styles.smallText, { color: textColors[variant] }]}>{title}</Text>
    </Pressable>
  );
}

const textColors: Record<Variant, string> = {
  primary: colors.onDark,
  secondary: colors.text,
  danger: colors.danger,
  ghost: colors.text,
  light: colors.onDark,
};

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondary: { backgroundColor: 'transparent', borderColor: colors.dark },
  danger: { backgroundColor: 'transparent', borderColor: colors.danger },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  light: { backgroundColor: 'transparent', borderColor: colors.onDark },
});

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  small: { paddingVertical: 4, paddingHorizontal: spacing.sm, borderWidth: 1 },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.4 },
  text: { fontFamily: fonts.bold, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' },
  smallText: { fontSize: 12, letterSpacing: 0.5 },
});
