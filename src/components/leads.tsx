import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { colors, radius, family, spacing, shadow } from '../theme/theme';
import type { LeadStatus, Priority } from '../api/types';

const STATUS: Record<LeadStatus, { bg: string; fg: string; label: string }> = {
  NEW: { bg: colors.blueSoft, fg: colors.blue, label: 'New' },
  CONTACTED: { bg: colors.purpleSoft, fg: colors.purple, label: 'Contacted' },
  QUALIFIED: { bg: colors.greenSoft, fg: colors.green, label: 'Qualified' },
  FOLLOW_UP: { bg: colors.amberChip, fg: colors.amber, label: 'Follow-up' },
  CONVERTED: { bg: colors.greenSoft2, fg: colors.green, label: 'Converted' },
  LOST: { bg: '#eef1f5', fg: colors.muted2, label: 'Lost' },
};

export function StatusChip({ status, label }: { status: LeadStatus; label?: string }) {
  const s = STATUS[status];
  return (
    <View style={[styles.chip, { backgroundColor: s.bg }]}>
      <Text style={[styles.chipText, { color: s.fg }]}>{label ?? s.label}</Text>
    </View>
  );
}

const PRIORITY: Record<Priority, { bg: string; fg: string; label: string }> = {
  HIGH: { bg: colors.redSoft, fg: colors.red, label: 'High' },
  MEDIUM: { bg: colors.amberChip, fg: colors.amber, label: 'Medium' },
  LOW: { bg: colors.bg, fg: colors.muted2, label: 'Low' },
};
export function PriorityChip({ priority }: { priority: Priority }) {
  const p = PRIORITY[priority];
  return (
    <View style={[styles.chip, { backgroundColor: p.bg }]}>
      <Text style={[styles.chipText, { color: p.fg }]}>{p.label}</Text>
    </View>
  );
}

const SOURCE_ICON: Record<string, IconName> = {
  META_ADS: 'bar-chart-2',
  FACEBOOK: 'bar-chart-2',
  INSTAGRAM: 'bar-chart-2',
  GOOGLE_ADS: 'search',
  LINKEDIN_ADS: 'linkedin',
  WEBSITE: 'globe',
  REFERRAL: 'user-check',
  SOCIAL_MEDIA: 'share-2',
  WALK_IN: 'map-pin',
  CAMPAIGN: 'radio',
};
export function SourceChip({ code, label, extra }: { code: string | null; label: string; extra?: string | null }) {
  const icon = (code && SOURCE_ICON[code]) || 'tag';
  return (
    <View style={styles.source}>
      <Icon name={icon} size={11} color={colors.blue} />
      <Text style={styles.sourceText} numberOfLines={1}>
        {label}
        {extra ? ` · ${extra}` : ''}
      </Text>
    </View>
  );
}

const AVATAR_BG = [colors.blueSoft, colors.purpleSoft, colors.greenSoft, colors.amberSoft, colors.renewalCard];
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const init =
    name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
  const bg = AVATAR_BG[(name.charCodeAt(0) || 0) % AVATAR_BG.length];
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.3 }]}>{init}</Text>
    </View>
  );
}

export function FAB({ onPress, bottom = 100 }: { onPress: () => void; bottom?: number }) {
  return (
    <Pressable onPress={onPress} style={[styles.fab, { bottom }, shadow.button]}>
      <Icon name="plus" size={26} color={colors.navy} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.chip, alignSelf: 'flex-start' },
  chipText: { fontSize: 11, fontFamily: family.semibold },
  source: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  sourceText: { fontSize: 11, fontFamily: family.semibold, color: colors.blue, flexShrink: 1 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: family.bold, color: colors.navy },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.addTo,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
