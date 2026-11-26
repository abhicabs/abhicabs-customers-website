import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { PriorityChip } from './ui';
import { colors, radius, spacing, family } from '../theme/theme';
import type { Task } from '../api/types';

// "DD-MM-YYYY hh:mm AM" -> "hh:mm AM" (dueShown is IST from the API).
const timePart = (dueShown: string) => dueShown.split(' ').slice(1).join(' ') || dueShown;

// Row inside "My tasks": soft-gray pill, checkbox, title, "name · time", priority chip.
export function TaskRow({ task, onToggle, busy }: { task: Task; onToggle?: (t: Task) => void; busy?: boolean }) {
  const done = task.status === 'DONE';
  const meta = [task.linked?.name, timePart(task.dueShown)].filter(Boolean).join(' · ');
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onToggle?.(task)}
        disabled={!onToggle || busy}
        hitSlop={8}
        style={[styles.check, done && styles.checkDone]}
      >
        {busy ? (
          <ActivityIndicator size="small" color={colors.blue} />
        ) : done ? (
          <Icon name="check" size={15} color={colors.onPrimary} />
        ) : null}
      </Pressable>
      <View style={styles.body}>
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, task.overdue && styles.metaOverdue]} numberOfLines={1}>
            {task.overdue ? 'Overdue · ' : ''}
            {meta}
          </Text>
          <PriorityChip priority={task.priority} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg,
    borderRadius: radius.chip,
    padding: spacing.lg,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.checkboxBorder,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.green, borderColor: colors.green },
  body: { flex: 1, gap: 3 },
  title: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  titleDone: { textDecorationLine: 'line-through', color: colors.muted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meta: { flexShrink: 1, fontSize: 11, fontFamily: family.semibold, color: colors.blue },
  metaOverdue: { color: colors.red },
});
