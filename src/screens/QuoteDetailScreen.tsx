import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { QuotationDetail, QuotationStatus } from '../api/types';

type R = RouteProp<AppStackParamList, 'QuoteDetail'>;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (iso?: string | null) => { if (!iso) return null; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const dateTime = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso); let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}, ${h}:${String(d.getMinutes()).padStart(2, '0')} ${ap}`;
};
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');
const STATUS: Record<QuotationStatus, { bg: string; fg: string; label: string; icon?: IconName }> = {
  DRAFT: { bg: '#eef1f5', fg: '#44526a', label: 'Draft' },
  READY: { bg: '#e8f0fd', fg: '#1f5fd6', label: 'Ready', icon: 'check' },
  SHARED: { bg: '#e8f0fd', fg: '#1f5fd6', label: 'Shared', icon: 'send' },
  ACCEPTED: { bg: '#e7f4ee', fg: '#127650', label: 'Accepted', icon: 'check' },
  REJECTED: { bg: '#fbebec', fg: '#b4323c', label: 'Rejected', icon: 'x' },
  CANCELLED: { bg: '#eef1f5', fg: '#44526a', label: 'Cancelled' },
  EXPIRED: { bg: '#fbebec', fg: '#b4323c', label: 'Expired', icon: 'clock' },
};

export function QuoteDetailScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [q, setQ] = useState<QuotationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.quotations.get(params.id); setQ(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this quotation.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !q) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const rev = q.revisions?.[q.revisions.length - 1];
  const inputs = q.inputs ?? {};
  const premium = rev?.final ?? q.calc?.breakdown?.final ?? null;
  const product = inputs.productName ?? inputs.product?.name ?? '—';
  const variant = inputs.variantName ?? inputs.variant?.name ?? null;
  const people = Array.isArray(inputs.members) ? inputs.members.length : inputs.peopleCount;
  const sumInsured = inputs.sumInsured ?? inputs.cover ?? null;
  const st = STATUS[q.status] ?? STATUS.DRAFT;

  // Activity derived from the latest revision
  const activity: { icon: IconName; title: string; at?: string | null }[] = [];
  if (rev?.viewed) activity.push({ icon: 'eye', title: `Viewed ${rev.viewed} time${rev.viewed === 1 ? '' : 's'}` });
  if (rev?.sharedAt) activity.push({ icon: 'message-circle', title: 'Shared', at: rev.sharedAt });
  if (rev?.generatedAt) activity.push({ icon: 'file-text', title: `R${rev.revision} generated`, at: rev.generatedAt });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.appbarTitle}>
          <Text style={styles.navName} numberOfLines={1}>{q.number ?? 'Quotation'}</Text>
          <Text style={styles.navSub} numberOfLines={1}>
            {rev ? `R${rev.revision}` : 'Draft'}{params.customerName ? ` · ${params.customerName}` : ''}
          </Text>
        </View>
        <Pressable style={[styles.moreBtn, shadow.iconBtn]} hitSlop={10} onPress={() => navigation.navigate('QuoteActions', { id: q.id, number: q.number ?? params.number, status: q.statusLabel ?? q.status, customerName: params.customerName, amount: premium ?? undefined })}>
          <Icon name="more-horizontal" size={19} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Status / headline */}
        <View style={styles.card}>
          <View style={styles.chipRow}>
            <View style={[styles.chip, { backgroundColor: st.bg, paddingLeft: st.icon ? 8 : 12 }]}>
              {st.icon ? <Icon name={st.icon} size={13} color={st.fg} /> : null}
              <Text style={[styles.chipText, { color: st.fg }]}>{st.label}</Text>
            </View>
            {shortDate(rev?.validUntil) ? (
              <View style={[styles.chip, { backgroundColor: '#eef1f5', paddingLeft: 8 }]}>
                <Icon name="clock" size={13} color="#44526a" />
                <Text style={[styles.chipText, { color: '#44526a' }]}>Valid till {shortDate(rev?.validUntil)}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.product}>{product}{variant ? ` · ${variant}` : ''}</Text>
          <Text style={styles.premium}>{rupees(premium)}</Text>
          <Text style={styles.premiumSub}>
            {[premium ? 'per year incl. GST' : null, people ? `${people} people` : null, sumInsured ? rupees(sumInsured) : null].filter(Boolean).join(' · ') || '—'}
          </Text>
        </View>

        {/* Activity */}
        {activity.length ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Activity</Text>
            {activity.map((a, i) => (
              <View key={i} style={styles.actRow}>
                <View style={styles.actIcon}><Icon name={a.icon} size={14} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actTitle}>{a.title}</Text>
                  {a.at ? <Text style={styles.actSub}>{dateTime(a.at)}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky actions */}
      <View style={styles.sticky}>
        <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate('QuoteShare', { id: q.id, customerName: params.customerName })}>
          <LinearGradient colors={[colors.addFrom, colors.addTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.share}>
            <Icon name="send" size={18} color={colors.navy} />
            <Text style={styles.shareText}>Share</Text>
          </LinearGradient>
        </Pressable>
        <Pressable style={styles.record} onPress={() => navigation.navigate('RecordPayment', { id: q.id, customerName: params.customerName, amount: premium ?? undefined })}>
          <Icon name="credit-card" size={18} color={colors.onPrimary} />
          <Text style={styles.recordText}>Record payment</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
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
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 12 },
  chipRow: { flexDirection: 'row', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  product: { fontSize: 17, fontFamily: family.bold, color: colors.text },
  premium: { fontSize: 30, fontFamily: family.bold, color: colors.text, letterSpacing: -0.6 },
  premiumSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: -4 },
  cardTitle: { fontSize: 16, fontFamily: family.bold, color: colors.text },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  actTitle: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  actSub: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  sticky: { flexDirection: 'row', gap: 10, backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  share: { height: 46, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  shareText: { fontSize: 14, fontFamily: family.semibold, color: colors.navy },
  record: { flex: 1, height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  recordText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
