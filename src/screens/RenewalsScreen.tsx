import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { RenewalRow } from '../api/types';

const TABS = [
  { key: 'DUE', label: 'Due', countKey: 'due' },
  { key: 'IN_FOLLOW_UP', label: 'Follow-up', countKey: 'inFollowUp' },
  { key: 'UPCOMING', label: 'Upcoming', countKey: 'upcoming30' },
  { key: 'LAPSED', label: 'Lapsed', countKey: 'lapsedThisMonth' },
  { key: 'RENEWED', label: 'Renewed', countKey: null },
  { key: 'NOT_RENEWING', label: 'Not renewing', countKey: null },
] as const;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const longDate = (iso: string) => { const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]} ${d.getFullYear()}`; };
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');
const AV = ['#fbd5dd', '#d9eafd', '#e9e3fc', '#d4f1e7', '#fde8c9'];
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

export function RenewalsScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<string>('DUE');
  const [items, setItems] = useState<RenewalRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (status: string, mode?: 'refresh') => {
    if (mode !== 'refresh') setLoading(true);
    setError(null);
    try { const { data } = await api.renewals.list({ status }); setItems(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load renewals.'); }
    finally { setLoading(false); }
  }, []);

  const loadCounts = useCallback(async () => {
    try { const { data } = await api.dashboard.renewalsDue(); setCounts(data.cards as unknown as Record<string, number>); } catch { /* no counts */ }
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);
  useEffect(() => { load(tab); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const daysChip = (r: RenewalRow) => {
    const d = r.daysLeft;
    const style = d < 0 ? { bg: '#fbebec', fg: '#b4323c' } : d <= 45 ? { bg: '#fbf1e1', fg: '#8a5a12' } : { bg: '#eef1f5', fg: '#44526a' };
    const label = d < 0 ? `${Math.abs(d)} days late` : `${d} days`;
    return (
      <View style={[styles.daysChip, { backgroundColor: style.bg }]}>
        <Icon name="clock" size={13} color={style.fg} />
        <Text style={[styles.daysText, { color: style.fg }]}>{label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Renewals</Text>
      </View>

      <View style={styles.chipsWrap}>
        <FlatList
          horizontal
          data={TABS as any}
          keyExtractor={(t: any) => t.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item: t }: any) => {
            const on = t.key === tab;
            const c = t.countKey ? counts[t.countKey] : undefined;
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
        <ErrorState message={error} onRetry={() => load(tab)} />
      ) : (
        <FlatList
          data={loading ? [] : items}
          keyExtractor={(r) => r.id}
          style={styles.flex1}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={false}
          onRefresh={() => { loadCounts(); load(tab, 'refresh'); }}
          renderItem={({ item, index }) => (
            <Pressable style={styles.card} onPress={() => navigation.navigate('RenewalDetail', { id: item.id })}>
              <View style={styles.row1}>
                <View style={[styles.avatar, { backgroundColor: AV[index % AV.length] }]}>
                  <Text style={styles.avatarText}>{initials(item.customer?.name ?? '?')}</Text>
                </View>
                <View style={styles.nameCol}>
                  <Text style={styles.name} numberOfLines={1}>{item.customer?.name ?? 'Customer'}</Text>
                  <Text style={styles.sub} numberOfLines={1}>{[item.policy?.product, item.policy?.insurer].filter(Boolean).join(' · ') || '—'}</Text>
                </View>
                {daysChip(item)}
              </View>
              <View style={styles.insets}>
                <View style={styles.inset}>
                  <Text style={styles.insetLabel}>Renews</Text>
                  <Text style={styles.insetValue}>{longDate(item.dueDate)}</Text>
                </View>
                <View style={styles.inset}>
                  <Text style={styles.insetLabel}>Premium</Text>
                  <Text style={styles.insetValue}>{rupees(item.premium)}</Text>
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={loading ? <EmptyState icon="loader" title="Loading…" /> : <EmptyState icon="refresh-cw" title="No renewals" subtitle="Nothing in this tab." />}
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
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 14, gap: 10 },
  row1: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontFamily: family.bold, color: colors.navy },
  nameCol: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  daysChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  daysText: { fontSize: 12, fontFamily: family.semibold },
  insets: { flexDirection: 'row', gap: 8, width: '100%' },
  inset: { flex: 1, backgroundColor: colors.bg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 1 },
  insetLabel: { fontSize: 10, fontFamily: family.semibold, color: colors.blue },
  insetValue: { fontSize: 13, fontFamily: family.bold, color: colors.text },
});
