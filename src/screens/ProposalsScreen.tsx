import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { ProposalRow, ProposalStatus } from '../api/types';

const TABS: { key: 'ALL' | ProposalStatus; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'ISSUED', label: 'Issued' },
  { key: 'DECLINED', label: 'Declined' },
  { key: 'CANCELLED', label: 'Cancelled' },
];
const CHIP: Record<ProposalStatus, { bg: string; fg: string; label: string; icon?: IconName }> = {
  DRAFT: { bg: '#eef1f5', fg: '#44526a', label: 'Draft' },
  SUBMITTED: { bg: '#f0ecfb', fg: '#5b3fb8', label: 'Submitted', icon: 'clock' },
  ISSUED: { bg: '#e7f4ee', fg: '#127650', label: 'Issued', icon: 'check' },
  DECLINED: { bg: '#fbebec', fg: '#b4323c', label: 'Declined', icon: 'x' },
  CANCELLED: { bg: '#eef1f5', fg: '#44526a', label: 'Cancelled' },
};
const TILE: Record<ProposalStatus, string> = { SUBMITTED: '#e9e3fc', DRAFT: '#eef1f5', ISSUED: '#d4f1e7', DECLINED: '#fde8ec', CANCELLED: '#eef1f5' };

export function ProposalsScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<'ALL' | ProposalStatus>('ALL');
  const [all, setAll] = useState<ProposalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode?: 'refresh') => {
    if (mode !== 'refresh') setLoading(true);
    setError(null);
    try { const { data } = await api.proposals.list(); setAll(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load proposals.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: all.length };
    for (const p of all) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, [all]);
  const items = useMemo(() => (tab === 'ALL' ? all : all.filter((p) => p.status === tab)), [all, tab]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Proposals</Text>
      </View>

      <View style={styles.chipsWrap}>
        <FlatList
          horizontal
          data={TABS}
          keyExtractor={(t) => t.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item: t }) => {
            const on = t.key === tab;
            const c = counts[t.key];
            return (
              <Pressable onPress={() => setTab(t.key)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                <Text style={[styles.chipLabel, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.label}</Text>
                {typeof c === 'number' ? <Text style={[styles.chipCount, { color: on ? colors.onPrimary : colors.muted }]}>{c}</Text> : null}
              </Pressable>
            );
          }}
        />
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => load()} />
      ) : (
        <FlatList
          data={loading ? [] : items}
          keyExtractor={(p) => p.id}
          style={styles.flex1}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={false}
          onRefresh={() => load('refresh')}
          renderItem={({ item }) => {
            const chip = CHIP[item.status];
            const sub = [item.customer?.name, item.productName].filter(Boolean).join(' · ') || '—';
            return (
              <Pressable style={styles.card} onPress={() => navigation.navigate('ProposalDetail', { id: item.id, number: item.number ?? undefined, customerName: item.customer?.name })}>
                <View style={[styles.tile, { backgroundColor: TILE[item.status] ?? '#eef1f5' }]}>
                  <Icon name="send" size={18} color={colors.text} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.title} numberOfLines={1}>{item.number || 'Proposal'}</Text>
                  <Text style={styles.sub} numberOfLines={1}>{sub}</Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: chip.bg, paddingLeft: chip.icon ? 8 : 12 }]}>
                  {chip.icon ? <Icon name={chip.icon} size={13} color={chip.fg} /> : null}
                  <Text style={[styles.statusText, { color: chip.fg }]}>{chip.label}</Text>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={loading ? <EmptyState icon="loader" title="Loading…" /> : <EmptyState icon="send" title="No proposals" subtitle="Nothing in this tab." />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  chipsWrap: { paddingTop: 12, paddingBottom: 10 },
  chips: { gap: 6, paddingHorizontal: 16, alignItems: 'flex-start' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipLabel: { fontSize: 12, fontFamily: family.semibold },
  chipCount: { fontSize: 11, fontFamily: family.bold },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  tile: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 3 },
  title: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  statusText: { fontSize: 12, fontFamily: family.semibold },
});
