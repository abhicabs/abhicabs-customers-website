import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'ProductPriceVersions'>;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const d2 = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]} ${d.getFullYear()}`; };
const AV = ['#d9eafd', '#e9e3fc', '#fde8c9', '#d4f1e7'];
const chipFor = (st: string) => {
  const s = (st || '').toUpperCase();
  if (s.includes('SCHEDUL') || s.includes('UPCOMING')) return { bg: '#e8f0fd', fg: '#1f5fd6', label: 'Scheduled' };
  if (s.includes('CURRENT') || s.includes('ACTIVE')) return { bg: '#e7f4ee', fg: '#127650', label: 'Current' };
  if (s.includes('CANCEL')) return { bg: '#eef1f5', fg: '#44526a', label: 'Cancelled' };
  return { bg: '#eef1f5', fg: '#44526a', label: 'Closed' };
};
const subFor = (st: string) => {
  const s = (st || '').toUpperCase();
  if (s.includes('SCHEDUL')) return 'Starts automatically';
  if (s.includes('CURRENT') || s.includes('ACTIVE')) return 'Used for new quotes';
  if (s.includes('CANCEL')) return 'Cancelled before start';
  return 'Kept on old quotes';
};

export function ProductPriceVersionsScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.products.prices(params.id); setRows(Array.isArray(data) ? data : data.items ?? data.versions ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load price versions.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>My price versions</Text>
          {params.name ? <Text style={styles.navSub} numberOfLines={1}>{params.name} · private</Text> : null}
        </View>
      </View>

      {error ? <ErrorState message={error} onRetry={load} /> : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {loading ? <EmptyState icon="loader" title="Loading…" /> : rows.length ? rows.map((r, i) => {
            const chip = chipFor(r.status);
            const range = r.startDate ? (r.endDate ? `${d2(r.startDate)} – ${d2(r.endDate)}` : `From ${d2(r.startDate)}`) : (r.createdAt ? `Created ${d2(r.createdAt)}` : 'Version');
            return (
              <View key={r.id ?? i} style={styles.item}>
                <View style={[styles.avatar, { backgroundColor: AV[i % AV.length] }]}><Text style={styles.avatarText}>V{r.version ?? rows.length - i}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{range}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>{subFor(r.status)}</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: chip.bg }]}><Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text></View>
              </View>
            );
          }) : <EmptyState icon="credit-card" title="No price versions" subtitle="Add your own price to quote this product." />}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Pressable onPress={() => navigation.navigate('AddPriceVersion', { id: params.id, name: params.name })}>
          <LinearGradient colors={[colors.addFrom, colors.addTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.add}>
            <Icon name="plus" size={18} color={colors.navy} /><Text style={styles.addText}>Add price version</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontFamily: family.bold, color: colors.navy },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  add: { height: 46, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addText: { fontSize: 14, fontFamily: family.semibold, color: colors.navy },
});
