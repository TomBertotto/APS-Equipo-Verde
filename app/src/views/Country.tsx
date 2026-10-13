import { Image, StyleSheet, View } from 'react-native';
import { findCountry } from '../models/countries';
import { BodyText } from './Typography';
import { colors, spacing } from './theme';

// País con su bandera al lado (si se reconoce)
export function Country({ value }: { value: string }) {
  const country = findCountry(value);
  return (
    <View style={styles.row}>
      {country ? (
        <Image
          source={{ uri: `https://flagcdn.com/w40/${country.code}.png` }}
          style={styles.flag}
          accessibilityLabel={`Bandera de ${country.name}`}
        />
      ) : null}
      <BodyText muted>{country?.name ?? value}</BodyText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flag: { width: 24, height: 16, borderRadius: 2, borderWidth: 1, borderColor: colors.border },
});
