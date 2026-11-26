import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon, type IconName } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { EmptyState, ErrorState } from '../components/ui';
import { FAB } from '../components/leads';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { QuotationRow, QuotationStatus } from '../api/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// Exact chip styling per M20
const STATUS: Record<QuotationStatus, { bg: string; fg: string; label: string; icon?: IconName }> = {
  DRAFT: { bg: '#eef1f5', fg: '#44526a', label: 'Draft' },
  READY: { bg: '#e8f0fd', fg: '#1f5fd6', label: 'Ready', icon: 'check' },
  SHARED: { bg: '#e8f0fd', fg: '#1f5fd6', label: 'Shared', icon: 'send' },
  ACCEPTED: { bg: '#e7f4ee', fg: '#127650', label: 'Accepted', icon: 'check' },
  REJECTED: { bg: '#fbebec', fg: '#b4323c', label: 'Rejected', icon: 'x' },
  CANCELLED: { bg: '#eef1f5', fg: '#44526a', label: 'Cancelled' },
  EXPIRED: { bg: '#fbebec', fg: '#b4323c', label: 'Expired', icon: 'clock' },
};
const TABS: { key: 'ALL' | QuotationStatus; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'SHARED', label: 'Shared' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'EXPIRED', label: 'Expired' },
  { key: 'READY', label: 'Ready' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'CANCELLED', label: 'Cancelled' },
];
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');

export function QuotesScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<'ALL' | QuotationStatus>('ALL');
  const route = useRoute<any>();
  const filters = route.params?.filters;
  const [items, setItems] = useState<QuotationRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  const load = useCallback(async (which: 'ALL' | QuotationStatus, mode?: 'refresh') => {
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    if (mode !== 'refresh') setLoading(true);
    setError(null);
    try {
      const query: Record<string, string | number | undefined> = { page: 1, limit: 30 };
      if (which !== 'ALL') query.status = which;
      const { data, meta } = await api.quotations.list(query, { signal: ctrl.signal });
      if (ctrl.signal.aborted) return;
      setItems(data);
      if (meta?.counts) setCounts(meta.counts);
    } catch (e: any) {
      if (e?.name !== 'AbortError') setError(e instanceof ApiError ? e.message : 'Could not load quotations.');
    } finally {
      if (!ctrl.signal.aborted) { setLoading(false); setRefreshing(false); }
    }
  }, []);

  useEffect(() => { load(tab); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const countFor = (k: 'ALL' | QuotationStatus) =>
    k === 'ALL' ? Object.values(counts).reduce((a, b) => a + (b || 0), 0) || undefined : counts[k];

  const displayItems = useMemo(() => {
    if (!filters) return items;
    let r = [...items];
    if (!filters.showInactive) r = r.filter((x: any) => String(x.status ?? '').toUpperCase() !== 'INACTIVE');
    if (filters.city) r = r.filter((x: any) => String(x.city ?? '').toLowerCase() === String(filters.city).toLowerCase());
    if (filters.sort === 'NAME') r.sort((a: any, b: any) => String(a.name ?? '').localeCompare(String(b.name ?? '')));
    else if (filters.sort === 'OLDEST') r.reverse();
    return r;
  }, [items, filters]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.appbar}>
        <Text style={styles.title}>Quotes</Text>
        <Pressable style={[styles.iconBtn, shadow.iconBtn]} onPress={() => navigation.navigate('Filters', { target: 'Quotes' })}>
          <Icon name="filter" size={19} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.chipsWrap}>
          <FlatList
            horizontal
            data={TABS}
            keyExtractor={(t) => t.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            renderItem={({ item: t }) => {
              const on = t.key === tab;
              const c = countFor(t.key);
              return (
                <Pressable onPress={() => setTab(t.key)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                  <Text style={[styles.chipLabel, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.label}</Text>
                  {typeof c === 'number' ? <Text style={[styles.chipCount, { color: on ? colors.onPrimary : colors.muted }]}>{c}</Text> : null}
                </Pressable>
              );
            }}
          />
        </View>

        <View style={styles.comparePad}>
          <Pressable style={styles.compare} onPress={() => navigation.navigate('ComparisonBuilder')}>
            <Icon name="git-pull-request" size={16} color={colors.navy} />
            <Text style={styles.compareText}>New comparison</Text>
          </Pressable>
        </View>

        {error ? (
          <ErrorState message={error} onRetry={() => load(tab)} />
        ) : (
          <FlatList
            data={loading ? [] : displayItems}
            keyExtractor={(q) => q.id}
            style={styles.flex1}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(tab, 'refresh'); }}
            renderItem={({ item }) => {
              const s = STATUS[item.status] ?? STATUS.DRAFT;
              return (
                <Pressable style={styles.card} onPress={() => navigation.navigate('QuoteDetail', { id: item.id, number: item.number ?? undefined, customerName: item.customer?.name })}>
                  <View style={styles.topRow}>
                    <View style={styles.topLeft}>
                      <Text style={styles.number} numberOfLines={1}>{item.number || 'Draft quotation'}</Text>
                      <Text style={styles.sub} numberOfLines={1}>{[item.customer?.name, item.productName].filter(Boolean).join(' · ') || '—'}</Text>
                    </View>
                    <Text style={styles.premium}>{rupees(item.premium)}</Text>
                  </View>
                  <View style={[styles.chipTag, { backgroundColor: s.bg, paddingLeft: s.icon ? 8 : 12 }]}>
                    {s.icon ? <Icon name={s.icon} size={13} color={s.fg} /> : null}
                    <Text style={[styles.chipTagText, { color: s.fg }]}>{s.label}</Text>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={loading ? <EmptyState icon="loader" title="Loading…" /> : <EmptyState icon="file-text" title="No quotations" subtitle="Quotations you create appear here." />}
          />
        )}
      </View>

      <FAB onPress={() => navigation.navigate('QuoteBuilder')} />
      <TabBar active="quotes" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 20, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  title: { flex: 1, fontSize: 26, fontFamily: family.bold, color: colors.text, letterSpacing: -0.26 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, paddingTop: 12 },
  chipsWrap: { paddingBottom: 10 },
  chips: { gap: 6, paddingHorizontal: 16, alignItems: 'flex-start' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipLabel: { fontSize: 12, fontFamily: family.semibold },
  chipCount: { fontSize: 11, fontFamily: family.bold },
  comparePad: { paddingHorizontal: 16, paddingBottom: 10 },
  compare: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 36, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, paddingLeft: 12, paddingRight: 14, justifyContent: 'center' },
  compareText: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 14, gap: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  topLeft: { flex: 1, gap: 2 },
  number: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  premium: { fontSize: 15, fontFamily: family.bold, color: colors.text },
  chipTag: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  chipTagText: { fontSize: 12, fontFamily: family.semibold },
});
