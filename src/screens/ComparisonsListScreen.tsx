import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';

const chipFor = (st: string) => {
  const s = (st || '').toUpperCase();
  if (s === 'SHARED') return { bg: '#e8f0fd', fg: '#1f5fd6', label: 'Shared' };
  if (s === 'CHOSEN') return { bg: '#e7f4ee', fg: '#127650', label: 'Chosen' };
  if (s === 'EXPIRED') return { bg: '#fbebec', fg: '#b4323c', label: 'Expired' };
  return { bg: '#eef1f5', fg: '#44526a', label: 'Draft' };
};

export function ComparisonsListScreen() {
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.comparisons.list(); setRows(Array.isArray(data) ? data : data.items ?? data.comparisons ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load comparisons.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.navTitle}>Comparisons</Text>
      </View>

      {error ? <ErrorState message={error} onRetry={load} /> : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {loading ? <EmptyState icon="loader" title="Loading…" /> : rows.length ? rows.map((r, i) => {
            const chip = chipFor(r.status);
            return (
              <Pressable key={r.id ?? i} style={styles.item} onPress={() => navigation.navigate('ComparisonDetail', { id: r.id, customerName: r.customer?.name ?? r.customerName })}>
                <View style={styles.tile}><Icon name="git-pull-request" size={17} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{r.number ?? 'Draft'}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>{[r.customer?.name ?? r.customerName, `${(r.options ?? []).length} products`].filter(Boolean).join(' · ')}</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: chip.bg }]}><Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text></View>
              </Pressable>
            );
          }) : <EmptyState icon="git-pull-request" title="No comparisons yet" subtitle="Compare products side by side for a customer." />}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Pressable onPress={() => navigation.navigate('ComparisonBuilder')}>
          <LinearGradient colors={[colors.addFrom, colors.addTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.add}>
            <Icon name="plus" size={18} color={colors.navy} /><Text style={styles.addText}>New comparison</Text>
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
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  tile: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e9e3fc', alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  add: { height: 46, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addText: { fontSize: 14, fontFamily: family.semibold, color: colors.navy },
});
