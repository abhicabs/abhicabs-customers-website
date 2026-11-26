import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CatalogueType, ProductRow } from '../api/types';

type R = RouteProp<AppStackParamList, 'NewFromSkyUp'>;
const TILE = ['#fde8ec', '#fde8c9', '#d4f1e7', '#d9eafd', '#e9e3fc'];
const tileIcon = (type: string | null): IconName => {
  const n = (type ?? '').toLowerCase();
  if (n.includes('motor') || n.includes('car')) return 'truck';
  if (n.includes('life')) return 'users';
  if (n.includes('term')) return 'shield';
  if (n.includes('travel')) return 'navigation';
  return 'heart';
};
const quoteChip = (p: ProductRow) => {
  if (p.canQuote) return { bg: '#e7f4ee', fg: '#127650', label: 'Can quote', icon: 'check' as IconName };
  if (p.agentCode === 'EXPIRED') return { bg: '#fbf1e1', fg: '#8a5a12', label: 'Code expired', icon: 'alert-circle' as IconName };
  if (p.renewalOnly) return { bg: '#eef1f5', fg: '#44526a', label: 'Renewal only', icon: undefined };
  return { bg: '#eef1f5', fg: '#44526a', label: 'Code missing', icon: undefined };
};

export function NewFromSkyUpScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [types, setTypes] = useState<CatalogueType[]>([]);
  const [typeId, setTypeId] = useState<string | null>(params?.typeId ?? null);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.dashboard.catalogueSummary().then((r) => {
      setTypes(r.data.types);
      if (!typeId && r.data.types[0]) setTypeId(r.data.types[0].typeId);
    }).catch(() => undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async (tid: string) => {
    setLoading(true); setError(null);
    try { const { data } = await api.products.list({ typeId: tid }); setRows(data.filter((p) => p.kind === 'VERIFIED')); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load products.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (typeId) load(typeId); }, [typeId, load]);

  const newCount = useMemo(() => types.find((t) => t.typeId === typeId)?.newLast30Days ?? 0, [types, typeId]);

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

      {error ? (
        <ErrorState message={error} onRetry={() => typeId && load(typeId)} />
      ) : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.chips}>
            {types.map((t) => {
              const on = t.typeId === typeId;
              return <Pressable key={t.typeId} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setTypeId(t.typeId)}><Text style={[styles.chipText, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.name}</Text></Pressable>;
            })}
          </View>

          {newCount > 0 ? (
            <View style={styles.note}>
              <Icon name="star" size={16} color={colors.purple} />
              <Text style={styles.noteText}>{newCount} new {newCount === 1 ? 'product' : 'products'} from SkyUp this month. Add your agent code to quote.</Text>
            </View>
          ) : null}

          {loading ? <EmptyState icon="loader" title="Loading…" /> : rows.length ? rows.map((p, i) => {
            const chip = quoteChip(p);
            return (
              <Pressable key={p.id} style={styles.card} onPress={() => navigation.navigate('ProductDetail', { id: p.id, name: p.name })}>
                <View style={styles.cardHead}>
                  <View style={[styles.tile, { backgroundColor: TILE[i % TILE.length] }]}><Icon name={tileIcon(p.type)} size={18} color={colors.text} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.insurer} numberOfLines={1}>{p.insurer ?? '—'}</Text>
                  </View>
                  <View style={[styles.chipTag, { backgroundColor: chip.bg, paddingLeft: chip.icon ? 8 : 12 }]}>
                    {chip.icon ? <Icon name={chip.icon} size={13} color={chip.fg} /> : null}
                    <Text style={[styles.chipTagText, { color: chip.fg }]}>{chip.label}</Text>
                  </View>
                </View>
                {p.defaultVariant || p.variantCount > 0 ? (
                  <View style={styles.variant}>
                    <Text style={styles.variantText} numberOfLines={1}>Variant: {p.defaultVariant ?? `${p.variantCount} options`}</Text>
                    <Icon name="chevron-down" size={15} color={colors.muted} />
                  </View>
                ) : null}
              </Pressable>
            );
          }) : <EmptyState icon="box" title="No products" subtitle="Nothing in this segment." />}
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
  navTitle: { flex: 1, fontSize: 18, fontFamily: family.bold, color: colors.text },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f0ecfb', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.purple },
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
