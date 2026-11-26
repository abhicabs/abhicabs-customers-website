import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Icon, type IconName } from './Icon';
import { colors, radius, family, spacing, shadow } from '../theme/theme';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'navy' | 'ghost';
  icon?: IconName;
  style?: ViewStyle;
}

// Primary button = navy pill (radius 24) with drop shadow, matching Figma.
export function Button({ label, onPress, loading, disabled, variant = 'navy', icon, style }: Props) {
  const isDisabled = disabled || loading;
  const ghost = variant === 'ghost';
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        ghost ? styles.ghost : [styles.navy, shadow.button],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator size="small" color={ghost ? colors.text : colors.onPrimary} style={{ marginRight: spacing.md }} />
        ) : icon ? (
          <Icon name={icon} size={18} color={ghost ? colors.text : colors.onPrimary} />
        ) : null}
        <Text style={[styles.label, ghost ? styles.labelGhost : styles.labelNavy]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 54, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  navy: { backgroundColor: colors.navy },
  ghost: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.9 },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  label: { fontSize: 15, fontFamily: family.semibold },
  labelNavy: { color: colors.onPrimary },
  labelGhost: { color: colors.text },
});
