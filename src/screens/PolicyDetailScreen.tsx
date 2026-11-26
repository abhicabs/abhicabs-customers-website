import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { downloadAndShare } from '../lib/download';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { PolicyDetail } from '../api/types';

type R = RouteProp<AppStackParamList, 'PolicyDetail'>;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const longDate = (iso: string | null) => { if (!iso) return '—'; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]} ${d.getFullYear()}`; };
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');
const CHIP: Record<string, { bg: string; fg: string; label: string }> = {
  ISSUED: { bg: '#e7f4ee', fg: '#127650', label: 'Issued' },
  AWAITING_ISSUANCE: { bg: '#f0ecfb', fg: '#5b3fb8', label: 'Awaiting' },
  EXPIRED: { bg: '#fbebec', fg: '#b4323c', label: 'Expired' },
  CANCELLED: { bg: '#eef1f5', fg: '#44526a', label: 'Cancelled' },
  RENEWED: { bg: '#e7f4ee', fg: '#127650', label: 'Renewed' },
};

export function PolicyDetailScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [p, setP] = useState<PolicyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.policies.get(params.id); setP(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this policy.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !p) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const chip = CHIP[p.status] ?? CHIP.ISSUED;
  const insured = p.insured?.length ? p.insured.map((i) => i.name).join(', ') : p.customer?.name ?? '—';
  const nominee = p.nominees?.[0];
  // coverage progress
  let pct = 0; let daysLeft: number | null = null;
  if (p.startDate && p.endDate) {
    const s = new Date(p.startDate).getTime(); const e = new Date(p.endDate).getTime(); const now = Date.now();
    pct = Math.max(0, Math.min(1, (now - s) / Math.max(1, e - s)));
    daysLeft = Math.max(0, Math.round((e - now) / 86_400_000));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.appbarTitle}>
          <Text style={styles.navName} numberOfLines={1}>{p.productName || 'Policy'}</Text>
          <Text style={styles.navSub} numberOfLines={1}>{p.policyNumber}</Text>
        </View>
        <Pressable style={[styles.moreBtn, shadow.iconBtn]} hitSlop={10} onPress={() => navigation.navigate('PolicyActions', { id: p.id, product: p.productName, status: p.statusLabel ?? p.status, policyNumber: p.policyNumber, renewalId: (p as any).renewalId })}>
          <Icon name="more-horizontal" size={19} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Coverage */}
        <LinearGradient colors={['#d4f1e7', '#b9e8d7']} style={styles.cov}>
          <View style={[styles.chip, { backgroundColor: '#e7f4ee', alignSelf: 'flex-start' }]}>
            <Icon name="check" size={13} color="#127650" />
            <Text style={[styles.chipText, { color: '#127650' }]}>{chip.label}</Text>
          </View>
          <Text style={styles.covTitle}>{insured}{p.sumInsured ? ` · ${rupees(p.sumInsured)}` : ''}</Text>
          <View style={styles.track}><View style={[styles.bar, { width: `${Math.round(pct * 100)}%` }]} /></View>
          <Text style={styles.covDates}>
            {longDate(p.startDate)} → {longDate(p.endDate)}{daysLeft !== null ? ` · ${daysLeft} days left` : ''}
          </Text>
        </LinearGradient>

        {/* Policy */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Policy</Text>
            <Pressable onPress={() => ((p as any).documentFileId ? downloadAndShare((p as any).documentFileId, `${p.policyNumber ?? 'policy'}.pdf`) : undefined)}><Text style={styles.pdf}>PDF</Text></Pressable>
          </View>
          <Row label="Premium" value={rupees(p.premium)} />
          {p.frequency ? <Row label="Frequency" value={p.frequency} /> : null}
          {p.agentCode ? <Row label="Agent code" value={p.agentCode} /> : null}
          {nominee ? <Row label="Nominee" value={`${nominee.name}${nominee.sharePercent ? ` · ${nominee.sharePercent}%` : ''}`} /> : null}
          {p.insurer ? <Row label="Insurer" value={p.insurer} /> : null}
        </View>

        {/* Commission (advisor only) */}
        {typeof p.expectedCommission === 'number' ? (
          <LinearGradient colors={[colors.navyGradFrom, colors.navyGradTo]} style={styles.comm}>
            <View style={styles.commHead}>
              <Text style={styles.commTitle}>Expected commission</Text>
              <View style={styles.onlyYou}>
                <Icon name="lock" size={13} color={colors.redPink} />
                <Text style={styles.onlyYouText}>Only you</Text>
              </View>
            </View>
            <Text style={styles.commValue}>{rupees(p.expectedCommission)}</Text>
          </LinearGradient>
        ) : null}
      </ScrollView>

      {p.status === 'AWAITING_ISSUANCE' ? (
        <View style={styles.sticky}>
          <Pressable style={[styles.openBtn, shadow.button]} onPress={() => navigation.navigate('RecordIssued', { id: p.id })}>
            <Icon name="check" size={18} color={colors.onPrimary} />
            <Text style={styles.openText}>Record issued</Text>
          </Pressable>
        </View>
      ) : p.renewal ? (
        <View style={styles.sticky}>
          <Pressable style={[styles.openBtn, shadow.button]} onPress={() => ((p as any).renewalId ? navigation.navigate('RenewalDetail', { id: (p as any).renewalId }) : undefined)}>
            <Icon name="refresh-cw" size={18} color={colors.onPrimary} />
            <Text style={styles.openText}>Open renewal</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  appbarTitle: { flex: 1, gap: 1 },
  navName: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  moreBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 12 },
  cov: { borderRadius: 22, padding: 16, gap: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  covTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.7)', overflow: 'hidden' },
  bar: { height: 8, borderRadius: 4, backgroundColor: '#16845b' },
  covDates: { fontSize: 12, fontFamily: family.semibold, color: '#2f6b55' },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', paddingTop: 4, paddingHorizontal: 2 },
  cardTitle: { flex: 1, fontSize: 16, fontFamily: family.bold, color: colors.text },
  pdf: { fontSize: 13, fontFamily: family.bold, color: colors.blue },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.muted },
  rowValue: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  comm: { borderRadius: 22, padding: 16, gap: 12 },
  commHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  commTitle: { fontSize: 14, fontFamily: family.bold, color: '#fff' },
  onlyYou: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fde8ec', paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  onlyYouText: { fontSize: 12, fontFamily: family.semibold, color: colors.redPink },
  commValue: { fontSize: 24, fontFamily: family.bold, color: '#fff' },
  sticky: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  openBtn: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  openText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
