import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { EmptyState, ErrorState } from '../components/ui';
import { StaffTabBar } from '../components/StaffTabBar';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';

const TABS = [
  { key: 'ALL', label: 'All' }, { key: 'TRIAL', label: 'Trial' }, { key: 'GRACE', label: 'Grace' },
  { key: 'READ_ONLY', label: 'Expired' }, { key: 'SUSPENDED', label: 'Suspended' },
];
const AV = ['#d9eafd', '#e9e3fc', '#fde8c9', '#d4f1e7', '#fbd5dd'];
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayMonth = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const chipFor = (st: string) => {
  const s = (st || '').toUpperCase();
  if (s === 'SUSPENDED') return { bg: '#fbf1e1', fg: '#8a5a12', label: 'Suspended' };
  if (s === 'CLOSED') return { bg: '#eef1f5', fg: '#44526a', label: 'Closed' };
  if (s === 'GRACE') return { bg: '#fbf1e1', fg: '#8a5a12', label: 'Grace' };
  if (s === 'READ_ONLY' || s === 'EXPIRED') return { bg: '#fbf1e1', fg: '#8a5a12', label: 'Read-only' };
  return { bg: '#e7f4ee', fg: '#127650', label: 'Active' };
};
const subFor = (a: any) => {
  const parts: string[] = [];
  if (a.plan) parts.push(a.plan.charAt(0) + a.plan.slice(1).toLowerCase());
  const s = (a.status || '').toUpperCase();
  if (s === 'TRIAL' && typeof a.trialDaysLeft === 'number') parts.push(`Trial ${a.trialDaysLeft} days`);
  else if (s === 'GRACE' && a.graceUntil) parts.push(`Grace till ${dayMonth(a.graceUntil)}`);
  else if ((s === 'READ_ONLY' || s === 'EXPIRED')) parts.push('Expired · read-only');
  else if (a.validUntil) parts.push(`till ${dayMonth(a.validUntil)}`);
  if (a.kycStatus === 'PENDING_REVIEW') parts.push('KYC pending');
  return parts.join(' · ') || '—';
};

export function AdminAdvisorsScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState('ALL');
  const [rows, setRows] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (t: string) => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.admin.accounts({ tab: t === 'ALL' ? undefined : t });
      const items = Array.isArray(data) ? data : data.items ?? data.accounts ?? [];
      setRows(items); setCounts((c) => ({ ...c, [t]: items.length, ...(data.counts ?? {}) }));
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load accounts.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(tab); }, [tab, load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Text style={styles.title}>Advisor accounts</Text>
        <Text style={styles.sub}>Summary only</Text>
      </View>
      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {TABS.map((t) => { const on = t.key === tab; const c = counts[t.key] ?? (counts as any)[t.label]; return (
            <Pressable key={t.key} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setTab(t.key)}>
              <Text style={[styles.chipLabel, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.label}</Text>
              {typeof c === 'number' ? <Text style={[styles.chipCount, { color: on ? colors.onPrimary : colors.muted }]}>{c}</Text> : null}
            </Pressable>
          ); })}
        </ScrollView>
      </View>

      {error ? <ErrorState message={error} onRetry={() => load(tab)} /> : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {loading ? <EmptyState icon="loader" title="Loading…" /> : rows.length ? rows.map((a, i) => {
            const chip = chipFor(a.status);
            const name = a.name ?? a.businessName ?? 'Advisor';
            return (
              <Pressable key={a.id ?? i} style={styles.item} onPress={() => navigation.navigate('AdminAccountDetail', { id: a.id, name })}>
                <View style={[styles.avatar, { backgroundColor: AV[i % AV.length] }]}><Text style={styles.avatarText}>{initials(name)}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{name}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>{subFor(a)}</Text>
                </View>
                <View style={[styles.chip2, { backgroundColor: chip.bg }]}><Text style={[styles.chip2Text, { color: chip.fg }]}>{chip.label}</Text></View>
              </Pressable>
            );
          }) : <EmptyState icon="users" title="No accounts" subtitle="Nothing in this tab." />}
        </ScrollView>
      )}

      <StaffTabBar active="Advisors" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { paddingLeft: 20, paddingRight: 16, paddingTop: 8, paddingBottom: 10, gap: 1 },
  title: { fontSize: 26, fontFamily: family.bold, color: colors.text, letterSpacing: -0.26 },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  chipsWrap: { paddingBottom: 12 },
  chips: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, alignItems: 'flex-start' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipLabel: { fontSize: 12, fontFamily: family.semibold },
  chipCount: { fontSize: 11, fontFamily: family.bold },
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontFamily: family.bold, color: colors.navy },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip2: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chip2Text: { fontSize: 12, fontFamily: family.semibold },
});
