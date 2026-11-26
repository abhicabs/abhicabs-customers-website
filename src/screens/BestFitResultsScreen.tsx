import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState } from '../components/ui';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'BestFitResults'>;
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : null);
const TILE = ['#d9eafd', '#e9e3fc', '#d4f1e7', '#fde8c9'];
const scoreChip = (n: number) => (n >= 80 ? { bg: '#e8f0fd', fg: '#1f5fd6' } : { bg: '#fbf1e1', fg: '#8a5a12' });

export function BestFitResultsScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const result = params?.result ?? {};
  const results: any[] = Array.isArray(result.results) ? result.results : Array.isArray(result?.ranking?.results) ? result.ranking.results : Array.isArray(result) ? result : [];
  const top = results[0];
  const rest = results.slice(1);
  const name = params?.customerName ?? 'customer';

  const subFor = (r: any) => {
    const parts = [`Score ${r.total}`];
    if (r.covers != null && r.of != null && r.covers < r.of) parts.push(`${r.covers}/${r.of} covered`);
    if (rupees(r.premium)) parts.push(rupees(r.premium)!);
    return parts.join(' · ');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Best fit results</Text>
          <Text style={styles.navSub}>{results.length} products ranked for {name}</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {top ? (
          <>
            <LinearGradient colors={['#d4f1e7', '#b9e8d7']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.hero}>
              <View style={styles.bestChip}>
                <Icon name="star" size={13} color="#127650" />
                <Text style={styles.bestChipText}>Best fit</Text>
              </View>
              <Text style={styles.heroTitle}>1 · {top.name}</Text>
              <Text style={styles.heroSub}>
                Score {top.total} · {top.covers != null && top.of != null && top.covers === top.of ? 'all must-haves' : `${top.covers ?? '—'}/${top.of ?? '—'} covered`}{rupees(top.premium) ? ` · ${rupees(top.premium)}` : ''}
              </Text>
            </LinearGradient>

            {rest.map((r, i) => {
              const chip = scoreChip(r.total);
              return (
                <Pressable key={r.productId + (r.variantId ?? '')} style={styles.item} onPress={() => navigation.navigate('ProductDetail', { id: r.productId, name: r.name })}>
                  <View style={[styles.tile, { backgroundColor: TILE[i % TILE.length] }]}><Icon name="file-text" size={17} color={colors.text} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{i + 2} · {r.name}</Text>
                    <Text style={styles.itemSub} numberOfLines={1}>{subFor(r)}</Text>
                  </View>
                  <View style={[styles.scoreChip, { backgroundColor: chip.bg }]}><Text style={[styles.scoreText, { color: chip.fg }]}>{r.total}</Text></View>
                </Pressable>
              );
            })}

            <Pressable style={[styles.quote, shadow.button]} onPress={() => navigation.navigate('QuoteBuilder', { customerId: params?.customerId })}>
              <Icon name="file-text" size={18} color={colors.onPrimary} />
              <Text style={styles.quoteText} numberOfLines={1}>Quote {top.name.split(' · ')[0]}</Text>
            </Pressable>
            {results.length > 1 ? (
              <Pressable style={styles.compare} onPress={() => navigation.navigate('ComparisonBuilder', params?.customerId ? { customerId: params.customerId, customerName: params?.customerName } : undefined)}>
                <Icon name="git-pull-request" size={18} color={colors.text} />
                <Text style={styles.compareText}>Compare top 3</Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <EmptyState icon="search" title="No products match" subtitle={result.message ?? 'Try a wider budget or sum insured.'} />
        )}
      </ScrollView>
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
  hero: { borderRadius: 22, padding: 16, gap: 10 },
  bestChip: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: '#e7f4ee', paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  bestChipText: { fontSize: 12, fontFamily: family.semibold, color: '#127650' },
  heroTitle: { fontSize: 18, lineHeight: 24, fontFamily: family.bold, color: colors.text },
  heroSub: { fontSize: 12, lineHeight: 18, fontFamily: family.medium, color: '#2f6b55' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  tile: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  scoreChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  scoreText: { fontSize: 12, fontFamily: family.semibold },
  quote: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  quoteText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
  compare: { height: 54, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  compareText: { fontSize: 15, fontFamily: family.semibold, color: colors.text },
});
