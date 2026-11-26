import React, { useCallback, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { relativeTime } from '../lib/format';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'ComparisonDetail'>;
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayMonth = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const RANK_BG = ['#e9e3fc', '#d9eafd', '#fde8c9', '#d4f1e7'];

export function ComparisonDetailScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const idem = useRef(newIdempotencyKey());

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.comparisons.get(params.id); setD(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this comparison.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !d) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const options: any[] = (d.options ?? []).slice().sort((a: any, b: any) => (a.rank ?? 99) - (b.rank ?? 99));
  const chosenId = d.chosenProductId ?? d.chosen?.productId;
  const recommendedId = d.recommendedProductId;
  const status = (d.status ?? 'DRAFT').toUpperCase();
  const customerName = d.customer?.name ?? params.customerName;

  const heroFor = () => {
    if (status === 'CHOSEN' || chosenId) return { bg: '#e7f4ee', chipBg: '#d4f1e7', chipFg: '#127650', icon: 'check' as IconName, label: 'Customer chose', title: `${customerName ?? 'Customer'} picked an option` };
    if (status === 'SHARED') return { bg: '#e8f0fd', chipBg: '#d9eafd', chipFg: '#1f5fd6', icon: 'send' as IconName, label: 'Shared', title: `Shared · waiting for ${customerName ?? 'customer'}` };
    if (status === 'EXPIRED') return { bg: '#fbebec', chipBg: '#fbd3dc', chipFg: '#b4323c', icon: 'clock' as IconName, label: 'Expired', title: 'Comparison expired' };
    return { bg: '#eef1f5', chipBg: '#e4e8ef', chipFg: '#44526a', icon: 'file-text' as IconName, label: 'Draft', title: 'Comparison draft' };
  };
  const h = heroFor();

  const choose = (o: any) => {
    Alert.alert('Mark as chosen?', `${o.name ?? o.productName} for ${customerName ?? 'the customer'}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark chosen', onPress: async () => {
        setBusy(true);
        try { await api.comparisons.choose(params.id, { version: d.version, productId: o.productId, variantId: o.variantId ?? undefined }, { idempotencyKey: idem.current }); idem.current = newIdempotencyKey(); await load(); }
        catch (e) { Alert.alert('Could not update', e instanceof ApiError ? e.message : 'Try again.'); }
        finally { setBusy(false); }
      } },
    ]);
  };
  const share = () => {
    Alert.alert('Share comparison', 'Choose how to share', [
      { text: 'WhatsApp', onPress: () => doShare('WHATSAPP') },
      { text: 'Email', onPress: () => doShare('EMAIL') },
      { text: 'Copy link', onPress: () => doShare('LINK') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };
  const doShare = async (channel: string) => {
    setBusy(true);
    try { await api.comparisons.share(params.id, channel, { idempotencyKey: newIdempotencyKey() }); await load(); }
    catch (e) { Alert.alert('Could not share', e instanceof ApiError ? e.message : 'Try again.'); }
    finally { setBusy(false); }
  };
  const createQuote = async () => {
    const chosen = options.find((o) => o.productId === chosenId);
    if (!chosen) return;
    setBusy(true);
    try { const { data } = await api.comparisons.createQuotation(params.id, { productId: chosen.productId, variantId: chosen.variantId ?? undefined }, { idempotencyKey: newIdempotencyKey() }); const q = data?.quotation ?? data; if (q?.id) navigation.navigate('QuoteDetail', { id: q.id, number: q.number, customerName }); }
    catch (e) { Alert.alert('Could not create quotation', e instanceof ApiError ? e.message : 'Try again.'); }
    finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle} numberOfLines={1}>{d.number ?? 'Comparison'}</Text>
          <Text style={styles.navSub} numberOfLines={1}>{[customerName, `${options.length} options`].filter(Boolean).join(' · ')}</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: h.bg }]}>
          <View style={[styles.chip, { backgroundColor: h.chipBg }]}><Icon name={h.icon} size={13} color={h.chipFg} /><Text style={[styles.chipText, { color: h.chipFg }]}>{h.label}</Text></View>
          <Text style={styles.heroTitle}>{h.title}</Text>
          {d.validUntil ? <Text style={styles.heroSub}>Valid till {dayMonth(d.validUntil)}{typeof d.openedCount === 'number' ? ` · opened ${d.openedCount} times` : ''}</Text> : null}
        </View>

        <Text style={styles.sectionLabel}>OPTIONS</Text>
        {options.map((o, i) => {
          const isChosen = o.productId === chosenId;
          const isRec = o.productId === recommendedId || (!recommendedId && i === 0);
          return (
            <Pressable key={o.productId ?? i} style={[styles.opt, isChosen && styles.optChosen]} disabled={busy} onPress={() => (chosenId ? undefined : choose(o))}>
              <View style={[styles.rank, { backgroundColor: RANK_BG[i % RANK_BG.length] }]}><Text style={styles.rankText}>{o.rank ?? i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optTitle} numberOfLines={1}>{o.name ?? o.productName}</Text>
                <Text style={styles.optSub}>{rupees(o.premium ?? o.total)}</Text>
              </View>
              {isChosen ? <View style={[styles.tag, { backgroundColor: '#d4f1e7' }]}><Text style={[styles.tagText, { color: '#127650' }]}>Chosen</Text></View>
                : isRec ? <View style={[styles.tag, { backgroundColor: '#e7f4ee' }]}><Text style={[styles.tagText, { color: '#127650' }]}>Recommended</Text></View>
                : <Icon name="chevron-right" size={16} color={colors.grayBar} />}
            </Pressable>
          );
        })}

        {Array.isArray(d.activity) && d.activity.length ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Activity</Text>
            {d.activity.map((a: any, i: number) => (
              <View key={i} style={styles.actRow}>
                <View style={styles.actIcon}><Icon name={/view|open/i.test(a.type ?? '') ? 'eye' : 'mail'} size={14} color={colors.text} /></View>
                <View style={{ flex: 1 }}><Text style={styles.actText} numberOfLines={1}>{a.text ?? a.label}</Text><Text style={styles.actTime}>{relativeTime(a.at ?? a.createdAt ?? new Date().toISOString())}</Text></View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {chosenId ? (
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={createQuote}><Icon name="file-text" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Working…' : 'Create quotation from choice'}</Text></Pressable>
        ) : (
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={share}><Icon name="send" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Working…' : 'Share comparison'}</Text></Pressable>
        )}
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
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 12 },
  hero: { borderRadius: 22, padding: 16, gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  heroTitle: { fontSize: 18, lineHeight: 24, fontFamily: family.bold, color: colors.text },
  heroSub: { fontSize: 12, lineHeight: 18, fontFamily: family.medium, color: colors.muted },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6, marginTop: 2 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: 'transparent' },
  optChosen: { borderColor: '#127650' },
  rank: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 13, fontFamily: family.bold, color: colors.navy },
  optTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  optSub: { fontSize: 12, fontFamily: family.semibold, color: colors.muted, marginTop: 2 },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  tagText: { fontSize: 12, fontFamily: family.semibold },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 10 },
  cardTitle: { fontSize: 16, fontFamily: family.bold, color: colors.text },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#d9eafd', alignItems: 'center', justifyContent: 'center' },
  actText: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  actTime: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
