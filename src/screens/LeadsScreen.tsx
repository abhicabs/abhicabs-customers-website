import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { EmptyState, ErrorState } from '../components/ui';
import { StatusChip, SourceChip, Avatar, FAB } from '../components/leads';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, spacing, radius, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { LeadSummary, LeadStatus, LeadStatusCounts } from '../api/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const TABS: { key: 'ALL' | LeadStatus; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'NEW', label: 'New' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'FOLLOW_UP', label: 'Follow-up' },
  { key: 'QUALIFIED', label: 'Qualified' },
  { key: 'CONVERTED', label: 'Converted' },
  { key: 'LOST', label: 'Lost' },
];

const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function followUpAlert(iso: string | null): { text: string; tone: 'red' | 'amber' } | null {
  if (!iso) return null;
  const due = new Date(iso);
  const now = new Date();
  if (due.getTime() < now.getTime()) return { text: `Overdue · ${due.getDate()} ${MO[due.getMonth()]}`, tone: 'red' };
  if (due.toDateString() === now.toDateString()) {
    let h = due.getHours();
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return { text: `Due today · ${h}:${String(due.getMinutes()).padStart(2, '0')} ${ap}`, tone: 'amber' };
  }
  return null;
}

export function LeadsScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<'ALL' | LeadStatus>('ALL');
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState<LeadStatusCounts | null>(null);
  const route = useRoute<any>();
  const filters = route.params?.filters;
  const [items, setItems] = useState<LeadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abort = useRef<AbortController | null>(null);

  const load = useCallback(
    async (opts: { tab: 'ALL' | LeadStatus; search: string; mode?: 'full' | 'refresh' }) => {
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      if (opts.mode !== 'refresh') setLoading(true);
      setError(null);
      try {
        const query: Record<string, string | number | undefined> = { page: 1, limit: 30 };
        if (opts.tab !== 'ALL') query.status = opts.tab;
        if (opts.search.trim()) query.search = opts.search.trim();
        const { data } = await api.leads.list(query, { signal: ctrl.signal });
        if (!ctrl.signal.aborted) setItems(data);
      } catch (e: any) {
        if (e?.name !== 'AbortError') setError(e instanceof ApiError ? e.message : 'Could not load leads.');
      } finally {
        if (!ctrl.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [],
  );

  const loadCounts = useCallback(async () => {
    try {
      const { data } = await api.dashboard.leadStatusCounts();
      setCounts(data);
    } catch {
      /* chips just show no number */
    }
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);
  useEffect(() => {
    load({ tab, search });
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSearch = (t: string) => {
    setSearch(t);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load({ tab, search: t }), 350);
  };

  const countFor = (k: 'ALL' | LeadStatus) => (k === 'ALL' ? counts?.total : counts?.byStatus[k as keyof typeof counts.byStatus]);

  const callLead = (item: any) => {
    const num = String(item.mobile ?? item.number ?? '').replace(/[^\d+]/g, '');
    if (!num) { navigation.navigate('LeadDetail', { id: item.id, name: item.name }); return; }
    Linking.openURL(`tel:${num}`).catch(() => undefined);
    setTimeout(() => navigation.navigate('LogContact', { id: item.id, name: item.name }), 400);
  };

  const displayItems = useMemo(() => {
    if (!filters) return items;
    let r = [...items];
    if (!filters.showInactive) r = r.filter((x: any) => String(x.status ?? '').toUpperCase() !== 'INACTIVE');
    if (filters.city) r = r.filter((x: any) => String(x.city ?? '').toLowerCase() === String(filters.city).toLowerCase());
    if (filters.sort === 'NAME') r.sort((a: any, b: any) => String(a.name ?? '').localeCompare(String(b.name ?? '')));
    else if (filters.sort === 'OLDEST') r.reverse();
    return r;
  }, [items, filters]);

  const renderItem = ({ item }: { item: LeadSummary }) => {
    const alert = followUpAlert(item.nextFollowUpAt);

    return (
      <View style={styles.card}>
        <Pressable style={styles.cardMain} onPress={() => navigation.navigate('LeadDetail', { id: item.id, name: item.name })}>
        <Avatar name={item.name} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <StatusChip status={item.status} label={item.statusLabel} />
          </View>
          {item.interests?.[0] ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {item.interests[0]}
            </Text>
          ) : null}
          <SourceChip code={item.sourceCode} label={item.source} extra={item.campaign} />
          {alert ? (
            <View style={styles.alertRow}>
              <Icon name="alert-circle" size={13} color={alert.tone === 'red' ? colors.red : colors.amber} />
              <Text style={[styles.alertText, { color: alert.tone === 'red' ? colors.red : colors.amber }]}>{alert.text}</Text>
            </View>
          ) : null}
        </View>
        </Pressable>
        <Pressable style={styles.remarkBtn} hitSlop={8} onPress={() => navigation.navigate('Remarks', { id: item.id, name: item.name })}>
          <Icon name="message-circle" size={18} color={colors.blue} />
        </Pressable>
        <Pressable style={styles.callBtn} hitSlop={8} onPress={() => callLead(item)}>
          <Icon name="phone" size={18} color="#127650" />
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Leads</Text>
        <Pressable style={[styles.iconBtn, shadow.iconBtn]} onPress={() => navigation.navigate('LeadsBoard')}>
          <Icon name="grid" size={18} color={colors.text} />
        </Pressable>
        <Pressable style={[styles.iconBtn, shadow.iconBtn]} onPress={() => navigation.navigate('Filters', { target: 'Leads' })}>
          <Icon name="filter" size={18} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Icon name="search" size={18} color={colors.muted} />
        <TextInput
          value={search}
          onChangeText={onSearch}
          placeholder="Name, mobile or campaign"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          selectionColor={colors.blue}
        />
      </View>

      <View>
        <FlatList
          horizontal
          data={TABS}
          keyExtractor={(t) => t.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
          renderItem={({ item: t }) => {
            const on = t.key === tab;
            const c = countFor(t.key);
            return (
              <Pressable onPress={() => setTab(t.key)} style={[styles.tab, on && styles.tabOn]}>
                <Text style={[styles.tabLabel, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.label}</Text>
                {typeof c === 'number' ? (
                  <Text style={[styles.tabCount, { color: on ? colors.onPrimary : colors.muted }]}>{c}</Text>
                ) : null}
              </Pressable>
            );
          }}
        />
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => load({ tab, search })} />
      ) : (
        <FlatList
          data={loading ? [] : displayItems}
          keyExtractor={(l) => l.id}
          renderItem={renderItem}
          style={styles.flex1}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadCounts();
            load({ tab, search, mode: 'refresh' });
          }}
          ListEmptyComponent={
            loading ? <EmptyState icon="loader" title="Loading leads…" /> : <EmptyState icon="inbox" title="No leads" subtitle="Add your first lead with the + button." />
          }
        />
      )}

      <FAB onPress={() => navigation.navigate('LeadAdd')} />
      <TabBar active="leads" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { flex: 1, fontSize: 28, fontFamily: family.bold, color: colors.text },
  iconBtn: { width: 40, height: 40, borderRadius: radius.iconBtn, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm, paddingHorizontal: spacing.lg, height: 46, backgroundColor: colors.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, fontSize: 14, fontFamily: family.medium, color: colors.text },
  tabs: { gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, alignItems: 'flex-start' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.chip },
  tabOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  tabLabel: { fontSize: 12, fontFamily: family.semibold },
  tabCount: { fontSize: 11, fontFamily: family.bold },
  flex1: { flex: 1 },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 120, gap: spacing.md },
  card: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  remarkBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e8f0fd', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e7f4ee', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  cardBody: { flex: 1, gap: 5 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flex: 1, fontSize: 15, fontFamily: family.bold, color: colors.text },
  subtitle: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  alertText: { fontSize: 11, fontFamily: family.semibold },
});
