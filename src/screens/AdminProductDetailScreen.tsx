import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'AdminProductDetail'>;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayMonth = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]} ${d.getFullYear()}`; };
const AV = ['#d9eafd', '#e9e3fc', '#d4f1e7', '#fde8c9'];
const chipFor = (st: string) => {
  const s = (st || '').toUpperCase();
  if (s.includes('LIVE') || s.includes('PUBLISH')) return { bg: '#e7f4ee', fg: '#127650', label: 'Live' };
  if (s.includes('PENDING') || s.includes('REVIEW') || s.includes('DRAFT')) return { bg: '#f0ecfb', fg: '#5b3fb8', label: 'Pending' };
  if (s.includes('UPCOMING') || s.includes('SCHEDUL')) return { bg: '#e8f0fd', fg: '#1f5fd6', label: 'Upcoming' };
  if (s.includes('CANCEL') || s.includes('WITHDRAW')) return { bg: '#eef1f5', fg: '#44526a', label: 'Cancelled' };
  return { bg: '#eef1f5', fg: '#44526a', label: s ? s.charAt(0) + s.slice(1).toLowerCase() : 'Draft' };
};

export function AdminProductDetailScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.admin.product(params.id); setD(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this product.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !d) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const versions: any[] = d.versions ?? [];
  const variants: any[] = d.variants ?? d.currentVersion?.variants ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}><Text style={styles.navTitle} numberOfLines={1}>{d.name ?? params.name}</Text><Text style={styles.navSub} numberOfLines={1}>{d.insurer ?? ''}</Text></View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroChips}>
            {(() => { const c = chipFor(d.status); return <View style={[styles.chip, { backgroundColor: c.bg }]}><Text style={[styles.chipText, { color: c.fg }]}>{c.label}</Text></View>; })()}
            {d.verified ? <View style={[styles.chip, { backgroundColor: '#e7f4ee' }]}><Text style={[styles.chipText, { color: '#127650' }]}>Verified by SkyUp</Text></View> : null}
          </View>
          <Text style={styles.heroTitle}>{d.name ?? params.name}</Text>
          {d.type || d.insurer ? <Text style={styles.heroSub}>{[d.type, d.insurer].filter(Boolean).join(' · ')}</Text> : null}
        </View>

        {variants.length ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Variants</Text>
            <View style={styles.variantRow}>{variants.map((v: any, i: number) => <View key={v.id ?? i} style={styles.variantChip}><Text style={styles.variantText}>{v.name ?? v}</Text></View>)}</View>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>VERSIONS</Text>
        {versions.length ? versions.map((v, i) => {
          const chip = chipFor(v.status);
          return (
            <Pressable key={v.id ?? i} style={styles.item} onPress={() => navigation.navigate('ComingSoon', { title: `Version v${v.version}` })}>
              <View style={[styles.avatar, { backgroundColor: AV[i % AV.length] }]}><Text style={styles.avatarText}>v{v.version ?? versions.length - i}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{v.label ?? `Version ${v.version}`}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>{[v.publishedAt ? `Published ${dayMonth(v.publishedAt)}` : v.createdAt ? `Created ${dayMonth(v.createdAt)}` : null].filter(Boolean).join(' · ') || '—'}</Text>
              </View>
              <View style={[styles.statusChip, { backgroundColor: chip.bg }]}><Text style={[styles.statusText, { color: chip.fg }]}>{chip.label}</Text></View>
            </Pressable>
          );
        }) : <EmptyState icon="box" title="No versions" subtitle="This product has no versions yet." />}

        <Pressable style={styles.row} onPress={() => (d?.typeId ? navigation.navigate('BrochureReading', { typeId: d.typeId, insurerId: d.insurerId, typeName: d.type, insurerName: d.insurer }) : navigation.navigate('ComingSoon', { title: 'New version from brochure' }))}>
          <View style={styles.rowIcon}><Icon name="zap" size={17} color={colors.blue} /></View>
          <View style={{ flex: 1 }}><Text style={styles.rowTitle}>New version from brochure</Text><Text style={styles.rowSub}>Read a brochure PDF to update values</Text></View>
          <Icon name="chevron-right" size={16} color={colors.grayBar} />
        </Pressable>
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
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  hero: { backgroundColor: '#e8f0fd', borderRadius: 22, padding: 16, gap: 8 },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  heroTitle: { fontSize: 18, lineHeight: 24, fontFamily: family.bold, color: colors.text },
  heroSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 14, gap: 10 },
  cardTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  variantChip: { backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  variantText: { fontSize: 12, fontFamily: family.semibold, color: colors.text },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6, marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontFamily: family.bold, color: colors.navy },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  statusText: { fontSize: 12, fontFamily: family.semibold },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, padding: 14, marginTop: 2 },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f0fd', alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  rowSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
});
