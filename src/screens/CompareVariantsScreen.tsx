import React, { useCallback, useMemo, useState } from 'react';
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

type R = RouteProp<AppStackParamList, 'CompareVariants'>;
const humanize = (k: string) => k.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^\w/, (c) => c.toUpperCase());

function valueFor(prod: any, variant: any, key: string): string {
  const base = (prod?.publishedVersion?.data?.features ?? {}) as Record<string, any>;
  const raw = variant?.features?.[key]?.value ?? base[key]?.value ?? variant?.features?.[key] ?? base[key];
  if (raw === true) return '✓';
  if (raw === false) return '✗';
  if (raw === undefined || raw === null || raw === '') return '—';
  return String(raw);
}

export function CompareVariantsScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [prod, setProd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [highlight, setHighlight] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.products.get(params.id);
      setProd(data);
      const n = Array.isArray(data.variants) ? data.variants.length : 0;
      setSelected(Array.from({ length: Math.min(n, 3) }, (_, i) => i));
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this product.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const variants: any[] = useMemo(() => (Array.isArray(prod?.variants) ? prod.variants : []), [prod]);
  const chosen = selected.map((i) => variants[i]).filter(Boolean);

  const rows = useMemo(() => {
    if (!prod) return [] as { label: string; values: string[]; same: boolean }[];
    const tpl: any[] = Array.isArray(prod.features) ? prod.features : [];
    const base = (prod.publishedVersion?.data?.features ?? {}) as Record<string, any>;
    const keys = tpl.length ? tpl.map((f: any) => ({ key: f.key ?? f.name, label: f.label ?? f.name ?? humanize(String(f.key ?? f)) }))
      : Object.keys(base).map((k) => ({ key: k, label: humanize(k) }));
    return keys.map(({ key, label }) => {
      const values = chosen.map((v) => valueFor(prod, v, key));
      const same = values.every((x) => x === values[0]);
      return { label, values, same };
    }).filter((r) => r.values.some((v) => v !== '—'));
  }, [prod, chosen]);

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !prod) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const toggle = (i: number) => setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i].sort()));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Compare variants</Text>
          <Text style={styles.navSub}>{chosen.length} selected</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.chips}>
          {variants.map((v, i) => {
            const on = selected.includes(i);
            return (
              <Pressable key={v.name ?? i} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => toggle(i)}>
                <Text style={[styles.chipText, { color: on ? colors.onPrimary : colors.muted2 }]}>{v.name ?? `Variant ${i + 1}`}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.table}>
          <Text style={styles.sectionLabel}>SWIPE BETWEEN PLANS</Text>
          {rows.length ? rows.map((r, i) => {
            const dim = highlight && r.same;
            return (
              <View key={i} style={[styles.fRow, dim && { opacity: 0.45 }]}>
                <Text style={styles.fLabel} numberOfLines={2}>{r.label}</Text>
                <Text style={styles.fValue} numberOfLines={2}>{r.values.join(' · ')}</Text>
              </View>
            );
          }) : <Text style={styles.muted}>Select variants to compare.</Text>}
        </View>

        <Pressable style={styles.hlRow} onPress={() => setHighlight((h) => !h)}>
          <View style={[styles.check, highlight && styles.checkOn]}>{highlight ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
          <Text style={styles.hlText}>Highlight differences</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.cta, shadow.button]} onPress={() => navigation.navigate('ComparisonBuilder')}>
          <Icon name="git-pull-request" size={18} color={colors.onPrimary} />
          <Text style={styles.ctaText}>Create comparison quotation</Text>
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
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  table: { backgroundColor: '#f7f9ff', borderRadius: 22, padding: 16, gap: 10 },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  fRow: { flexDirection: 'row', gap: 10 },
  fLabel: { width: 150, fontSize: 12, lineHeight: 17, fontFamily: family.medium, color: colors.muted },
  fValue: { flex: 1, fontSize: 12, lineHeight: 17, fontFamily: family.bold, color: colors.text },
  muted: { fontSize: 13, fontFamily: family.medium, color: colors.muted },
  hlRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f3f7ff', borderRadius: 14, padding: 12 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  hlText: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
