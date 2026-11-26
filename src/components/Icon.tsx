import React from 'react';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/theme';

// Thin wrapper over Feather (bundled with Expo) — line icons that match the
// Figma set. Keep names in one place so swapping an icon set later is trivial.
export type IconName = React.ComponentProps<typeof Feather>['name'];

export function Icon({
  name,
  size = 20,
  color = colors.text,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Feather name={name} size={size} color={color} />;
}
