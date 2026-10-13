import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radius, spacing } from './theme';

export function TextField({ label, multiline, style, ...props }: TextInputProps & { label?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={colors.muted}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[styles.input, multiline && styles.multiline, focused && styles.focused, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted, textTransform: 'uppercase' },
  input: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 2,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    outlineStyle: 'none',
  } as object,
  focused: { borderBottomColor: colors.primary },
  multiline: { height: 90, textAlignVertical: 'top' },
});
