import { Pressable, StyleSheet, Text, View } from 'react-native';

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
      {options.map((option) => (
        <Pressable
          key={option.label}
          onPress={() => onSelect(option.value)}
          style={[styles.option, option.value === selected && styles.selected]}
        >
          <Text>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  option: { borderWidth: 1, paddingVertical: 4, paddingHorizontal: 8 },
  selected: { backgroundColor: '#cde' },
});
