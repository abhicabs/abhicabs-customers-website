import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'AdminAccountDetail'>;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayMonth = (iso?: string | null) => { if (!iso) return '—'; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]} ${d.getFullYear()}`; };
const statusChip = (s: string) => {
  const u = (s || '').toUpperCase();
  if (u === 'SUSPENDED') return { bg: '#fbf1e1', fg: '#8a5a12', label: 'Suspended' };
  if (u === 'CLOSED') return { bg: '#eef1f5', fg: '#44526a', label: 'Closed' };
  if (u === 'GRACE') return { bg: '#fbf1e1', fg: '#8a5a12', label: 'Grace' };
  if (u === 'READ_ONLY') return { bg: '#fbf1e1', fg: '#8a5a12', label: 'Read-only' };
  if (u === 'TRIAL') return { bg: '#e8f0fd', fg: '#1f5fd6', label: 'Trial' };
  return { bg: '#e7f4ee', fg: '#127650', label: 'Active' };
};

export function AdminAccountDetailScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [a, setA] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.admin.account(params.id); setA(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this account.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !a) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const chip = statusChip(a.status);
  const stats = a.stats ?? {};
  const kycLabel = a.kycStatus === 'VERIFIED' ? 'Verified' : a.kycStatus === 'PENDING_REVIEW' ? 'Pending review' : a.kycStatus === 'REJECTED' ? 'Rejected' : 'Not submitted';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle} numberOfLines={1}>{params.name ?? a.name ?? 'Account'}</Text>
          <Text style={styles.navSub} numberOfLines={1}>{a.plan ? a.plan.charAt(0) + a.plan.slice(1).toLowerCase() : ''}{a.number ? ` · ${a.number}` : ''}</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Subscription</Text>
            <View style={[styles.chip, { backgroundColor: chip.bg }]}><Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text></View>
          </View>
          <Row label="Plan" value={a.plan ? a.plan.charAt(0) + a.plan.slice(1).toLowerCase() : '—'} />
          {a.validUntil ? <Row label="Valid until" value={dayMonth(a.validUntil)} /> : null}
          {a.graceUntil ? <Row label="Grace until" value={dayMonth(a.graceUntil)} /> : null}
          <Row label="KYC" value={kycLabel} />
        </View>

        {(stats.leads != null || stats.customers != null || stats.policies != null) ? (
          <View style={styles.tiles}>
            <Tile label="Leads" value={String(stats.leads ?? 0)} bg="#d9eafd" />
            <Tile label="Policy holders" value={String(stats.customers ?? 0)} bg="#e9e3fc" />
            <Tile label="Policies" value={String(stats.policies ?? 0)} bg="#d4f1e7" />
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact</Text>
          {a.mobile ? <Row label="Mobile" value={a.mobile} /> : null}
          {a.email ? <Row label="Email" value={a.email} /> : null}
        </View>
      </ScrollView>

      <View style={styles.sticky}>
        <Pressable style={styles.ghost} onPress={() => navigation.navigate('RecordSubPayment', { id: a.id ?? params.id, name: params.name ?? a.name })}>
          <Icon name="credit-card" size={18} color={colors.text} /><Text style={styles.ghostText}>Record payment</Text>
        </Pressable>
        <Pressable style={styles.danger} onPress={() => navigation.navigate('SuspendAccount', { id: a.id ?? params.id, name: params.name ?? a.name })}>
          <Icon name="slash" size={18} color={colors.red} /><Text style={styles.dangerText}>Suspend</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue} numberOfLines={1}>{value}</Text></View>;
}
function Tile({ label, value, bg }: { label: string; value: string; bg: string }) {
  return <View style={[styles.tile, { backgroundColor: bg }]}><Text style={styles.tileLabel}>{label}</Text><Text style={styles.tileValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { flex: 1, fontSize: 16, fontFamily: family.bold, color: colors.text },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.muted },
  rowValue: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, borderRadius: 16, padding: 12, gap: 2 },
  tileLabel: { fontSize: 10, fontFamily: family.bold, color: '#44526a' },
  tileValue: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  sticky: { flexDirection: 'row', gap: 10, backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  ghost: { flex: 1.3, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 24 },
  ghostText: { fontSize: 14, fontFamily: family.semibold, color: colors.text },
  danger: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#f2c4c8', borderRadius: 24 },
  dangerText: { fontSize: 14, fontFamily: family.semibold, color: colors.red },
});
