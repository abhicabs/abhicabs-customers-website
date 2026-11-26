import React, { useCallback, useMemo, useState } from 'react';
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

type R = RouteProp<AppStackParamList, 'ProductDetail'>;
const humanize = (k: string) => k.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^\w/, (c) => c.toUpperCase());

function featureRows(prod: any, variant: any): { label: string; value: string }[] {
  const tpl: any[] = Array.isArray(prod?.features) ? prod.features : [];
  const base = (prod?.publishedVersion?.data?.features ?? {}) as Record<string, any>;
  const vFeat = (variant?.features ?? {}) as Record<string, any>;
  const val = (k: string) => {
    const x = vFeat[k]?.value ?? base[k]?.value ?? vFeat[k] ?? base[k];
    return x === undefined || x === null || x === '' ? null : String(x);
  };
  if (tpl.length) {
    return tpl.map((f: any) => ({ label: f.label ?? f.name ?? humanize(String(f.key ?? f)), value: val(f.key ?? f.name ?? '') ?? '' }))
      .filter((r) => r.value).slice(0, 10);
  }
  return Object.entries(base).map(([k, v]) => ({ label: humanize(k), value: String((v as any)?.value ?? v) })).slice(0, 10);
}
function heroRange(variant: any): string | null {
  const si = variant?.sumInsured ?? variant?.cover;
  const age = variant?.ageRange ?? (variant?.minAge != null && variant?.maxAge != null ? `ages ${variant.minAge} to ${variant.maxAge}` : null);
  const siText = typeof si === 'string' ? si : variant?.minSumInsured && variant?.maxSumInsured ? `₹${variant.minSumInsured} to ₹${variant.maxSumInsured}` : null;
  return [siText, age].filter(Boolean).join(' · ') || null;
}

export function ProductDetailScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [prod, setProd] = useState<any>(null);
  const [vIndex, setVIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.products.get(params.id);
      setProd(data);
      const vs = Array.isArray(data.variants) ? data.variants : [];
      const def = vs.findIndex((v: any) => v.name && data.publishedVersion?.data?.defaultVariant === v.name);
      if (def > 0) setVIndex(def);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this product.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });
  const variants: any[] = useMemo(() => (Array.isArray(prod?.variants) ? prod.variants : []), [prod]);
  const variant = variants[vIndex];
  const rows = useMemo(() => (prod ? featureRows(prod, variant) : []), [prod, variant]);

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !prod) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const verified = prod.kind === 'VERIFIED';
  const canQuote = variant?.canQuote ?? prod.canQuote ?? false;
  const name = params.name ?? prod.code ?? 'Product';
  const vName = variant?.name ?? prod.publishedVersion?.data?.defaultVariant ?? 'Default';
  const range = heroRange(variant);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle} numberOfLines={1}>{name}</Text>
          <Text style={styles.navSub} numberOfLines={1}>{prod.insurer ?? ''}{verified ? ' · verified by SkyUp' : ''}</Text>
        </View>
        <Pressable style={[styles.moreBtn, shadow.iconBtn]} hitSlop={10} onPress={() => navigation.navigate('CompareVariants', { id: prod.id, name })}>
          <Icon name="more-horizontal" size={19} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {variants.length > 1 ? (
          <View style={styles.vChips}>
            {variants.map((v, i) => {
              const on = i === vIndex;
              return (
                <Pressable key={v.name ?? i} style={[styles.vChip, on ? styles.vChipOn : styles.vChipOff]} onPress={() => setVIndex(i)}>
                  <Text style={[styles.vChipText, { color: on ? colors.onPrimary : colors.muted2 }]}>{v.name ?? `Variant ${i + 1}`}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {/* Hero */}
        <LinearGradient colors={['#fbd3dc', '#f6b3c3']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.hero}>
          <View style={[styles.canQuote, { backgroundColor: canQuote ? '#e7f4ee' : '#eef1f5' }]}>
            <Icon name={canQuote ? 'check' : 'alert-circle'} size={13} color={canQuote ? '#127650' : '#44526a'} />
            <Text style={[styles.canQuoteText, { color: canQuote ? '#127650' : '#44526a' }]}>{canQuote ? 'Can quote' : 'Code needed'}</Text>
          </View>
          <Text style={styles.heroTitle}>{vName}{prod.type ? ` · ${prod.type}` : ''}</Text>
          {range ? <Text style={styles.heroSub}>{range}</Text> : null}
        </LinearGradient>

        {/* Features — bg #f7f9ff */}
        <View style={styles.features}>
          <Text style={styles.sectionLabel}>FEATURES</Text>
          {rows.length ? rows.map((r, i) => (
            <View key={i} style={styles.fRow}>
              <Text style={styles.fLabel} numberOfLines={2}>{r.label}</Text>
              <Text style={styles.fValue} numberOfLines={2}>{r.value}</Text>
            </View>
          )) : <Text style={styles.muted}>No feature details recorded.</Text>}
        </View>

        {/* My commercials */}
        <View style={styles.card}>
          <View style={styles.commHead}>
            <Text style={styles.cardTitle}>My commercials</Text>
            <Pressable onPress={() => navigate('EditCommercials', { id: prod?.id ?? params.id })}><Text style={styles.editLink}>Edit</Text></Pressable>
          </View>
          <View style={styles.kvRow}><Text style={styles.kvLabel}>Agent code</Text><Text style={styles.kvValue}>{prod.agentCode ?? '—'}</Text></View>
          <View style={styles.kvRow}><Text style={styles.kvLabel}>Commission</Text><Text style={styles.kvValue}>{prod.commission != null ? `${prod.commission}%` : '—'}</Text></View>
        </View>

        <Pressable style={styles.priceBtn} onPress={() => navigation.navigate('ProductPriceVersions', { id: prod?.id ?? params.id, name: prod?.name ?? params.name })}>
          <Icon name="list" size={18} color={colors.text} /><Text style={styles.priceBtnText}>My price versions</Text>
        </Pressable>
        <Pressable style={styles.suggestBtn} onPress={() => navigation.navigate('SuggestCorrection', { id: prod?.id ?? params.id, name: prod?.name ?? params.name })}>
          <Icon name="edit-3" size={18} color={colors.text} /><Text style={styles.suggestBtnText}>Suggest a correction</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.cta, shadow.button]} onPress={() => navigation.navigate('QuoteBuilder')}>
          <Icon name="file-text" size={18} color={colors.onPrimary} />
          <Text style={styles.ctaText}>New quotation</Text>
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
  moreBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 12 },
  vChips: { flexDirection: 'row', gap: 6 },
  vChip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  vChipOn: { backgroundColor: colors.navy },
  vChipOff: { backgroundColor: colors.surface },
  vChipText: { fontSize: 12, fontFamily: family.semibold },
  hero: { borderRadius: 22, padding: 16, gap: 10 },
  canQuote: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  canQuoteText: { fontSize: 12, fontFamily: family.semibold },
  heroTitle: { fontSize: 18, lineHeight: 24, fontFamily: family.bold, color: colors.text },
  heroSub: { fontSize: 12, lineHeight: 18, fontFamily: family.medium, color: '#8b3a4c' },
  features: { backgroundColor: '#f7f9ff', borderRadius: 22, padding: 16, gap: 10 },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  fRow: { flexDirection: 'row', gap: 10 },
  fLabel: { width: 150, fontSize: 12, lineHeight: 17, fontFamily: family.medium, color: colors.muted },
  fValue: { flex: 1, fontSize: 12, lineHeight: 17, fontFamily: family.bold, color: colors.text },
  muted: { fontSize: 13, fontFamily: family.medium, color: colors.muted },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 10 },
  commHead: { flexDirection: 'row', alignItems: 'center', paddingTop: 4, paddingHorizontal: 2 },
  cardTitle: { flex: 1, fontSize: 16, fontFamily: family.bold, color: colors.text },
  editLink: { fontSize: 13, fontFamily: family.bold, color: colors.blue },
  kvRow: { flexDirection: 'row', gap: 8 },
  kvLabel: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.muted },
  kvValue: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  priceBtn: { height: 54, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  priceBtnText: { fontSize: 15, fontFamily: family.semibold, color: colors.text },
  suggestBtn: { height: 54, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  suggestBtnText: { fontSize: 15, fontFamily: family.semibold, color: colors.text },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
