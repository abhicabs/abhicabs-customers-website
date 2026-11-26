import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { Button } from './Button';
import { colors, radius, spacing, family } from '../theme/theme';

// Section header: bold 16 title + blue 13 action link (used on every card).
export function SectionHeader({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {action ? (
        <Text style={styles.headerAction} onPress={onPress} suppressHighlighting>
          {action}
        </Text>
      ) : null}
    </View>
  );
}

// White rounded card (radius 22, pad 16) — the dashboard section container.
export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PriorityChip({ priority }: { priority: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const map = {
    HIGH: { bg: colors.redSoft, fg: colors.red, label: 'High' },
    MEDIUM: { bg: colors.amberChip, fg: colors.amber, label: 'Medium' },
    LOW: { bg: colors.bg, fg: colors.muted2, label: 'Low' },
  }[priority];
  return (
    <View style={[styles.chip, { backgroundColor: map.bg }]}>
      <Text style={[styles.chipText, { color: map.fg }]}>{map.label}</Text>
    </View>
  );
}

export function EmptyState({ icon = 'check-circle', title, subtitle }: { icon?: IconName; title: string; subtitle?: string }) {
  return (
    <View style={styles.center}>
      <Icon name={icon} size={28} color={colors.muted} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySub}>{subtitle}</Text> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Icon name="wifi-off" size={26} color={colors.red} />
      <Text style={styles.errTitle}>Couldn’t load</Text>
      <Text style={styles.emptySub}>{message}</Text>
      {onRetry ? <Button label="Retry" variant="ghost" onPress={onRetry} style={{ marginTop: spacing.xl }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.xs, paddingHorizontal: 2 },
  headerTitle: { flex: 1, fontSize: 16, fontFamily: family.bold, color: colors.text },
  headerAction: { fontSize: 13, fontFamily: family.bold, color: colors.blue },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.xl, gap: spacing.lg },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.chip, alignSelf: 'flex-start' },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: 15, fontFamily: family.bold, color: colors.text },
  emptySub: { fontSize: 13, fontFamily: family.medium, color: colors.muted, textAlign: 'center', lineHeight: 19 },
  errTitle: { fontSize: 15, fontFamily: family.bold, color: colors.red },
});
