import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CatalogueType } from '../api/types';

type R = RouteProp<AppStackParamList, 'FeatureTable'>;
type Source = 'ALL' | 'VERIFIED' | 'OWN';
const fmt = (v: any) => (v === true ? '✓' : v === false ? '✗' : v === null || v === undefined || v === '' ? '—' : String(v));

export function FeatureTableScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [types, setTypes] = useState<CatalogueType[]>([]);
  const [typeId, setTypeId] = useState<string | null>(params?.typeId ?? null);
  const [source, setSource] = useState<Source>('ALL');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(true);

  useEffect(() => {
    api.dashboard.catalogueSummary().then((r) => {
      setTypes(r.data.types);
      if (!typeId && r.data.types[0]) setTypeId(r.data.types[0].typeId);
    }).catch(() => undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async (tid: string) => {
    setLoading(true); setError(null);
    try { const { data } = await api.products.featureTable({ typeId: tid, source: 'ALL' }); setData(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load the feature table.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (typeId) load(typeId); }, [typeId, load]);

  const cols: any[] = useMemo(() => (Array.isArray(data?.columns) ? data.columns : []), [data]);
  const counts = useMemo(() => ({
    ALL: cols.length,
    VERIFIED: cols.filter((c) => c.kind === 'VERIFIED').length,
    OWN: cols.filter((c) => c.kind === 'OWN').length,
  }), [cols]);
  const visibleIdx = useMemo(() => cols.map((_, i) => i).filter((i) => source === 'ALL' || (source === 'VERIFIED' ? cols[i].kind === 'VERIFIED' : cols[i].kind === 'OWN')), [cols, source]);
  const rows = useMemo(() => {
    const groups: any[] = Array.isArray(data?.groups) ? data.groups : [];
    const flat: { name: string; value: string; differs: boolean }[] = [];
    for (const g of groups) for (const r of g.rows ?? []) {
      const vals = visibleIdx.map((i) => r.values?.[i]);
      const differs = new Set(vals.map((x) => JSON.stringify(x))).size > 1;
      flat.push({ name: r.name, value: vals.map(fmt).join(' · '), differs });
    }
    return flat.filter((r) => r.value.replace(/[·\s—]/g, '').length);
  }, [data, visibleIdx]);

  const SEG = types;
  const SRC: { key: Source; label: string }[] = [{ key: 'ALL', label: 'All' }, { key: 'VERIFIED', label: 'Verified' }, { key: 'OWN', label: 'My products' }];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Feature table</Text>
          <Text style={styles.navSub}>{data?.typeName ?? ''}{cols.length ? ` · ${cols.length} products` : ''}</Text>
        </View>
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => typeId && load(typeId)} />
      ) : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {SEG.map((t) => {
              const on = t.typeId === typeId;
              return <Pressable key={t.typeId} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setTypeId(t.typeId)}><Text style={[styles.chipText, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.name}</Text></Pressable>;
            })}
          </ScrollView>

          <View style={styles.chipsRow}>
            {SRC.map((sc) => {
              const on = sc.key === source;
              return (
                <Pressable key={sc.key} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setSource(sc.key)}>
                  <Text style={[styles.chipText, { color: on ? colors.onPrimary : colors.muted2 }]}>{sc.label}</Text>
                  <Text style={[styles.chipCount, { color: on ? colors.onPrimary : colors.muted }]}>{counts[sc.key]}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>VARIANTS SIDE BY SIDE · SWIPE →</Text>
          <View style={styles.table}>
            {loading ? <EmptyState icon="loader" title="Loading…" /> : rows.length ? rows.map((r, i) => {
              const dim = highlight && !r.differs;
              return (
                <View key={i} style={[styles.fRow, dim && { opacity: 0.45 }]}>
                  <Text style={styles.fLabel} numberOfLines={2}>{r.name}</Text>
                  <Text style={styles.fValue} numberOfLines={3}>{r.value}</Text>
                </View>
              );
            }) : <Text style={styles.muted}>No features to compare.</Text>}
          </View>

          <Pressable style={styles.hlRow} onPress={() => setHighlight((h) => !h)}>
            <View style={[styles.check, highlight && styles.checkOn]}>{highlight ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
            <Text style={styles.hlText}>Highlight differences</Text>
          </Pressable>
        </ScrollView>
      )}
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
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  chipsRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  chipCount: { fontSize: 11, fontFamily: family.bold },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  table: { backgroundColor: '#f7f9ff', borderRadius: 22, padding: 16, gap: 10 },
  fRow: { flexDirection: 'row', gap: 10 },
  fLabel: { width: 150, fontSize: 12, lineHeight: 17, fontFamily: family.medium, color: colors.muted },
  fValue: { flex: 1, fontSize: 12, lineHeight: 17, fontFamily: family.bold, color: colors.text },
  muted: { fontSize: 13, fontFamily: family.medium, color: colors.muted },
  hlRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f3f7ff', borderRadius: 14, padding: 12 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  hlText: { fontSize: 13, fontFamily: family.bold, color: colors.text },
});
