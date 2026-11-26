import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { ProductRow, CatalogueType } from '../api/types';

type Mode = 'ALL' | 'VERIFIED' | 'OWN';
const MODES: { key: Mode; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'VERIFIED', label: 'Verified by SkyUp' },
  { key: 'OWN', label: 'My products' },
];
const tileStyle = (type: string | null): { bg: string; icon: IconName } => {
  const n = (type ?? '').toLowerCase();
  if (n.includes('health')) return { bg: '#fde8ec', icon: 'heart' };
  if (n.includes('motor') || n.includes('car')) return { bg: '#d9eafd', icon: 'truck' };
  if (n.includes('life')) return { bg: '#e9e3fc', icon: 'users' };
  if (n.includes('term')) return { bg: '#e8f0fd', icon: 'shield' };
  if (n.includes('travel')) return { bg: '#d4f1e7', icon: 'navigation' };
  return { bg: '#d9eafd', icon: 'box' };
};
const quoteChip = (p: ProductRow): { bg: string; fg: string; label: string; icon?: IconName } => {
  if (p.canQuote) return { bg: '#e7f4ee', fg: '#127650', label: 'Can quote', icon: 'check' };
  if (p.agentCode === 'EXPIRED') return { bg: '#fbf1e1', fg: '#8a5a12', label: 'Code expired', icon: 'alert-circle' };
  if (p.renewalOnly) return { bg: '#eef1f5', fg: '#44526a', label: 'Renewal only' };
  return { bg: '#eef1f5', fg: '#44526a', label: 'Code missing' };
};

export function ProductsScreen() {
  const navigation = useNavigation<any>();
  const [types, setTypes] = useState<CatalogueType[]>([]);
  const [typeId, setTypeId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('ALL');
  const [all, setAll] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Segment tabs from the catalogue types
  useEffect(() => {
    api.dashboard.catalogueSummary().then((r) => {
      setTypes(r.data.types);
      if (r.data.types[0]) setTypeId(r.data.types[0].typeId);
    }).catch(() => setTypeId('ALL'));
  }, []);

  const load = useCallback(async (tid: string | null, mode?: 'refresh') => {
    if (mode !== 'refresh') setLoading(true);
    setError(null);
    try {
      const q: Record<string, string | undefined> = {};
      if (tid && tid !== 'ALL') q.typeId = tid;
      const { data } = await api.products.list(q);
      setAll(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load products.');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { if (typeId) load(typeId); }, [typeId, load]);

  const counts = useMemo(() => ({
    ALL: all.length,
    VERIFIED: all.filter((p) => p.kind === 'VERIFIED').length,
    OWN: all.filter((p) => p.kind === 'OWN').length,
  }), [all]);
  const items = useMemo(() => (mode === 'ALL' ? all : all.filter((p) => (mode === 'VERIFIED' ? p.kind === 'VERIFIED' : p.kind === 'OWN'))), [all, mode]);

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Products</Text>
        <Pressable style={[styles.iconBtn, shadow.iconBtn]} onPress={() => navigation.navigate('FeatureTable', { typeId: typeId ?? undefined })}>
          <Icon name="list" size={19} color={colors.text} />
        </Pressable>
      </View>

      {/* Segment tabs */}
      <View style={styles.segWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seg}>
          {types.map((t) => {
            const on = t.typeId === typeId;
            return (
              <Pressable key={t.typeId} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setTypeId(t.typeId)}>
                <Text style={[styles.chipLabel, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Mode chips */}
      <View style={styles.modeWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seg}>
          {MODES.map((m) => {
            const on = m.key === mode;
            return (
              <Pressable key={m.key} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setMode(m.key)}>
                <Text style={[styles.chipLabel, { color: on ? colors.onPrimary : colors.muted2 }]}>{m.label}</Text>
                <Text style={[styles.chipCount, { color: on ? colors.onPrimary : colors.muted }]}>{counts[m.key]}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.actGhost} onPress={() => navigation.navigate('FeatureTable', { typeId: typeId ?? undefined })}>
          <Icon name="list" size={16} color={colors.text} />
          <Text style={styles.actGhostText}>Feature table</Text>
        </Pressable>
        <Pressable style={styles.actGhost} onPress={() => navigate('ComparisonBuilder')}>
          <Icon name="git-pull-request" size={16} color={colors.text} />
          <Text style={styles.actGhostText}>Compare</Text>
        </Pressable>
        <Pressable style={styles.actAdd} onPress={() => navigation.navigate('AddProduct')}>
          <Icon name="plus" size={16} color={colors.navy} />
          <Text style={styles.actAddText}>Add</Text>
        </Pressable>
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => load(typeId)} />
      ) : (
        <FlatList
          data={loading ? [] : items}
          keyExtractor={(p) => p.id}
          style={styles.flex1}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={false}
          onRefresh={() => load(typeId, 'refresh')}
          renderItem={({ item }) => {
            const tile = tileStyle(item.type);
            const chip = quoteChip(item);
            return (
              <Pressable style={styles.card} onPress={() => navigation.navigate('ProductDetail', { id: item.id, name: item.name })}>
                <View style={styles.cardHead}>
                  <View style={[styles.tile, { backgroundColor: tile.bg }]}>
                    <Icon name={tile.icon} size={18} color={colors.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.insurer} numberOfLines={1}>{item.insurer ?? '—'}</Text>
                  </View>
                  <View style={[styles.chipTag, { backgroundColor: chip.bg, paddingLeft: chip.icon ? 8 : 12 }]}>
                    {chip.icon ? <Icon name={chip.icon} size={13} color={chip.fg} /> : null}
                    <Text style={[styles.chipTagText, { color: chip.fg }]}>{chip.label}</Text>
                  </View>
                </View>
                {item.defaultVariant || item.variantCount > 0 ? (
                  <View style={styles.variant}>
                    <Text style={styles.variantText} numberOfLines={1}>Variant: {item.defaultVariant ?? `${item.variantCount} options`}</Text>
                    <Icon name="chevron-down" size={15} color={colors.muted} />
                  </View>
                ) : null}
              </Pressable>
            );
          }}
          ListEmptyComponent={loading ? <EmptyState icon="loader" title="Loading…" /> : <EmptyState icon="box" title="No products" subtitle="Nothing in this segment." />}
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
  navTitle: { flex: 1, fontSize: 18, fontFamily: family.bold, color: colors.text },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  segWrap: { paddingTop: 12, paddingBottom: 10 },
  modeWrap: { paddingBottom: 10 },
  seg: { gap: 6, paddingHorizontal: 16, alignItems: 'flex-start' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipLabel: { fontSize: 12, fontFamily: family.semibold },
  chipCount: { fontSize: 11, fontFamily: family.bold },
  actions: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  actGhost: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 36, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingLeft: 12, paddingRight: 14 },
  actGhostText: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  actAdd: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 36, backgroundColor: colors.addTo, borderRadius: 18, paddingLeft: 12, paddingRight: 14 },
  actAddText: { fontSize: 13, fontFamily: family.semibold, color: colors.navy },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 14, gap: 10 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tile: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  insurer: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  chipTag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  chipTagText: { fontSize: 12, fontFamily: family.semibold },
  variant: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.bg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  variantText: { flex: 1, fontSize: 13, fontFamily: family.bold, color: colors.text },
});
