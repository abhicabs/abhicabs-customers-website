import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { ProfileHeader } from '../components/ProfileHeader';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerDetail } from '../api/types';

type R = RouteProp<AppStackParamList, 'PolicyHolderPayments'>;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayMonth = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : null);
const TILE = ['#d9eafd', '#e9e3fc', '#fde8c9', '#d4f1e7'];
const chipFor = (st?: string) => (st === 'CANCELLED' || st === 'REFUNDED' ? { bg: '#eef1f5', fg: '#44526a', label: 'Cancelled' } : st === 'FAILED' ? { bg: '#fbebec', fg: '#b4323c', label: 'Failed' } : { bg: '#e7f4ee', fg: '#127650', label: 'Paid' });

export function PolicyHolderPaymentsScreen() {
  const { params } = useRoute<R>();
  const [c, setC] = useState<CustomerDetail | null>(null);
  const [acts, setActs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [cu, act] = await Promise.all([api.customers.get(params.id), api.customers.activity(params.id)]);
      setC(cu.data);
      const a = act.data; setActs(Array.isArray(a) ? a : a.items ?? a.events ?? a.activity ?? []);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load payments.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const payments = useMemo(() => acts.filter((r) => /PAY|PAID|PREMIUM/i.test(r.type ?? r.kind ?? r.category ?? r.action ?? '')), [acts]);

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !c) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ProfileHeader c={c} active="Payments" />
        <View style={styles.list}>
          <Text style={styles.sectionLabel}>PREMIUM PAYMENTS</Text>
          {payments.length ? payments.map((r, i) => {
            const chip = chipFor(r.status);
            const title = rupees(r.amount) ? `${rupees(r.amount)}${r.mode ?? r.method ? ` · ${r.mode ?? r.method}` : ''}` : (r.title ?? 'Payment');
            const sub = [r.reference ?? r.ref ?? r.title, dayMonth(r.at ?? r.createdAt)].filter(Boolean).join(' · ');
            return (
              <View key={r.id ?? i} style={styles.item}>
                <View style={[styles.tile, { backgroundColor: TILE[i % TILE.length] }]}><Icon name="credit-card" size={17} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{title}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>{sub}</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: chip.bg }]}><Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text></View>
              </View>
            );
          }) : <EmptyState icon="credit-card" title="No payments" subtitle="Premium payments will appear here." />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  body: { paddingBottom: 40 },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  tile: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
});
