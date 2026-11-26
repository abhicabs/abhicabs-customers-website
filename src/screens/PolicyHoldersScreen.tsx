import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { EmptyState, ErrorState } from '../components/ui';
import { FAB } from '../components/leads';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, spacing, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerSummary, CustomerStats } from '../api/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type TabKey = 'ALL' | 'RENEWAL' | 'CONSENT' | 'INACTIVE';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'RENEWAL', label: 'Renewal due' },
  { key: 'CONSENT', label: 'Consent missing' },
  { key: 'INACTIVE', label: 'Inactive' },
];
const AV = ['#fbd5dd', '#d9eafd', '#e9e3fc', '#d4f1e7', '#fde8c9'];
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

export function PolicyHoldersScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<TabKey>('ALL');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const route = useRoute<any>();
  const filters = route.params?.filters;
  const [items, setItems] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abort = useRef<AbortController | null>(null);

  const load = useCallback(async (opts: { tab: TabKey; search: string; mode?: 'refresh' }) => {
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    if (opts.mode !== 'refresh') setLoading(true);
    setError(null);
    try {
      const query: Record<string, string | number | undefined> = { page: 1, limit: 50 };
      if (opts.tab === 'INACTIVE') query.status = 'INACTIVE';
      else if (opts.tab !== 'ALL') query.status = 'ACTIVE';
      if (opts.search.trim()) query.search = opts.search.trim();
      const { data } = await api.customers.list(query, { signal: ctrl.signal });
      if (ctrl.signal.aborted) return;
      setItems(opts.tab === 'CONSENT' ? data.filter((c) => c.personalDataConsent !== 'GIVEN') : data);
    } catch (e: any) {
      if (e?.name !== 'AbortError') setError(e instanceof ApiError ? e.message : 'Could not load policy holders.');
    } finally {
      if (!ctrl.signal.aborted) { setLoading(false); setRefreshing(false); }
    }
  }, []);

  const loadStats = useCallback(async () => {
    try { const { data } = await api.customers.stats(); setStats(data); } catch { /* no counts */ }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { load({ tab, search }); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSearch = (t: string) => {
    setSearch(t);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load({ tab, search: t }), 350);
  };

  const countFor = (k: TabKey) =>
    k === 'ALL' ? (stats ? stats.active + stats.inactive : undefined)
      : k === 'INACTIVE' ? stats?.inactive
      : k === 'CONSENT' ? stats?.consentPending
      : undefined;

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
        <Text style={styles.title}>Policy holders</Text>
        <Pressable style={[styles.iconBtn, shadow.iconBtn]} onPress={() => navigation.navigate('Filters', { target: 'PolicyHolders' })}>
          <Icon name="filter" size={19} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.bodyTop}>
        <View style={styles.search}>
          <Icon name="search" size={17} color={colors.grayBar} />
          <TextInput value={search} onChangeText={onSearch} placeholder="Name, mobile or CU number" placeholderTextColor={colors.grayBar} style={styles.searchInput} selectionColor={colors.blue} />
        </View>
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

      {error ? (
        <ErrorState message={error} onRetry={() => load({ tab, search })} />
      ) : (
        <FlatList
          data={loading ? [] : displayItems}
          keyExtractor={(c) => c.id}
          style={styles.flex1}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); loadStats(); load({ tab, search, mode: 'refresh' }); }}
          renderItem={({ item, index }) => {
            const given = item.personalDataConsent === 'GIVEN';
            const sub = [item.number, item.city, item.familyCount ? `${item.familyCount} family` : null].filter(Boolean).join(' · ');
            const note = item.policyCount ? `${item.policyCount} ${item.policyCount === 1 ? 'policy' : 'policies'}` : 'No policy yet';
            return (
              <Pressable style={styles.card} onPress={() => navigation.navigate('PolicyHolderDetail', { id: item.id, name: item.name })}>
                <View style={[styles.avatar, { backgroundColor: AV[index % AV.length] }]}>
                  <Text style={styles.avatarText}>{initials(item.name)}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.sub} numberOfLines={1}>{sub}</Text>
                  <View style={styles.footRow}>
                    {given ? (
                      <View style={styles.consentGiven}>
                        <Icon name="check" size={12} color={colors.green} />
                        <Text style={styles.consentGivenText}>Consent given</Text>
                      </View>
                    ) : (
                      <View style={styles.consentMissing}>
                        <Text style={styles.consentMissingText}>Not recorded</Text>
                      </View>
                    )}
                    <Text style={styles.note}>{note}</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={18} color={colors.grayBar} />
              </Pressable>
            );
          }}
          ListEmptyComponent={loading ? <EmptyState icon="loader" title="Loading…" /> : <EmptyState icon="users" title="No policy holders" subtitle="Converted leads appear here." />}
        />
      )}

      <FAB onPress={() => navigation.navigate('AddPolicyHolder')} />
      <TabBar active="policyholders" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingLeft: 20, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  title: { flex: 1, fontSize: 26, fontFamily: family.bold, color: colors.text, letterSpacing: -0.26 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  bodyTop: { paddingHorizontal: 16, paddingTop: 12 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 46, backgroundColor: colors.surface, borderRadius: 22, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.text, padding: 0 },
  chipsWrap: { paddingTop: 10, paddingBottom: 12 },
  chips: { gap: 6, paddingHorizontal: 16, alignItems: 'flex-start' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipLabel: { fontSize: 12, fontFamily: family.semibold },
  chipCount: { fontSize: 11, fontFamily: family.bold },
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontFamily: family.bold, color: colors.navy },
  cardBody: { flex: 1, gap: 3 },
  name: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  consentGiven: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.greenSoft2, paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  consentGivenText: { fontSize: 12, fontFamily: family.semibold, color: colors.green },
  consentMissing: { backgroundColor: '#eef1f5', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  consentMissingText: { fontSize: 12, fontFamily: family.semibold, color: colors.muted3 },
  note: { fontSize: 11, fontFamily: family.semibold, color: colors.muted },
});
