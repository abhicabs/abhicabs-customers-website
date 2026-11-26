import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from './Icon';
import { colors } from '../theme/theme';

// App mark: navy rounded square with a shield/cross glyph (Figma M00/M01).
export function Badge({ size = 64 }: { size?: number }) {
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2 }]}>
      <Icon name="shield" size={size * 0.5} color={colors.onPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
});
