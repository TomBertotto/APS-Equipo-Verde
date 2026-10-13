import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from './theme';

type Option<T> = { label: string; value: T };

export function OptionPicker<T>({
  options,
  selected,
  onSelect,
}: {
  options: Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={option.label}
            onPress={() => onSelect(option.value)}
            style={[styles.option, active && styles.selected]}
          >
            <Text style={[styles.text, active && styles.selectedText]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  selectedText: { color: colors.onDark },
});
