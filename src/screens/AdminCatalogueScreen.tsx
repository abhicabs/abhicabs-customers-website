import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { StaffTabBar } from '../components/StaffTabBar';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { CatalogueType } from '../api/types';

const TILE = ['#d9eafd', '#e9e3fc', '#fde8c9', '#d4f1e7'];
const chipFor = (st: string) => {
  const s = (st || '').toUpperCase();
  if (s.includes('PENDING') || s.includes('DRAFT') || s.includes('REVIEW')) return { bg: '#f0ecfb', fg: '#5b3fb8', label: 'Pending' };
  if (s.includes('UPCOMING') || s.includes('SCHEDULED')) return { bg: '#e8f0fd', fg: '#1f5fd6', label: 'Upcoming' };
  return { bg: '#e7f4ee', fg: '#127650', label: 'Live' };
};

export function AdminCatalogueScreen() {
  const navigation = useNavigation<any>();
  const [types, setTypes] = useState<CatalogueType[]>([]);
  const [typeId, setTypeId] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { api.dashboard.catalogueSummary().then((r) => { setTypes(r.data.types); if (r.data.types[0]) setTypeId(r.data.types[0].typeId); }).catch(() => undefined); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const { data } = await api.admin.products({}); setRows(Array.isArray(data) ? data : data.items ?? data.products ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load the catalogue.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const items = useMemo(() => rows.filter((r) => !typeId || !r.typeId || r.typeId === typeId), [rows, typeId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Text style={styles.title}>Catalogue</Text>
        <Text style={styles.sub}>Verified products</Text>
      </View>
      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {types.map((t) => { const on = t.typeId === typeId; return (
            <Pressable key={t.typeId} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setTypeId(t.typeId)}><Text style={[styles.chipText, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.name}</Text></Pressable>
          ); })}
        </ScrollView>
      </View>

      {error ? <ErrorState message={error} onRetry={load} /> : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {loading ? <EmptyState icon="loader" title="Loading…" /> : items.length ? items.map((p, i) => {
            const chip = chipFor(p.status ?? p.state ?? '');
            const v = p.version ? `v${p.version}` : null;
            const sub = [p.insurer, [v, (p.status ?? '').toLowerCase().includes('pend') ? 'pending' : p.publishedAt ? 'published' : null].filter(Boolean).join(' ')].filter(Boolean).join(' · ');
            return (
              <Pressable key={p.id ?? i} style={styles.item} onPress={() => navigation.navigate('AdminProductDetail', { id: p.id, name: p.name })}>
                <View style={[styles.tile, { backgroundColor: TILE[i % TILE.length] }]}><Icon name="shield" size={17} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{p.name ?? 'Product'}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>{sub || '—'}</Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: chip.bg }]}><Text style={[styles.statusText, { color: chip.fg }]}>{chip.label}</Text></View>
              </Pressable>
            );
          }) : <EmptyState icon="box" title="No products" subtitle="Nothing in this segment." />}

          <Pressable onPress={() => navigation.navigate('AddProduct')}>
            <LinearGradient colors={[colors.addFrom, colors.addTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.add}>
              <Icon name="plus" size={18} color={colors.navy} /><Text style={styles.addText}>Add product</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      )}

      <StaffTabBar active="Products" />
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
  chip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  tile: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  statusText: { fontSize: 12, fontFamily: family.semibold },
  add: { height: 46, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  addText: { fontSize: 14, fontFamily: family.semibold, color: colors.navy },
});
