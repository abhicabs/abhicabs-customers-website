import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { ProfileHeader } from '../components/ProfileHeader';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerDetail, QuotationRow, QuotationStatus } from '../api/types';

type R = RouteProp<AppStackParamList, 'PolicyHolderQuotes'>;
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : null);
const TILE = ['#d9eafd', '#e9e3fc', '#fde8c9', '#d4f1e7'];
const CHIP: Record<string, { bg: string; fg: string; label: string }> = {
  DRAFT: { bg: '#eef1f5', fg: '#44526a', label: 'Draft' }, READY: { bg: '#e8f0fd', fg: '#1f5fd6', label: 'Ready' },
  SHARED: { bg: '#e8f0fd', fg: '#1f5fd6', label: 'Shared' }, ACCEPTED: { bg: '#e7f4ee', fg: '#127650', label: 'Accepted' },
  REJECTED: { bg: '#fbebec', fg: '#b4323c', label: 'Rejected' }, EXPIRED: { bg: '#fbebec', fg: '#b4323c', label: 'Expired' },
  CANCELLED: { bg: '#eef1f5', fg: '#44526a', label: 'Cancelled' },
};

export function PolicyHolderQuotesScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [c, setC] = useState<CustomerDetail | null>(null);
  const [rows, setRows] = useState<QuotationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [cu, q] = await Promise.all([api.customers.get(params.id), api.quotations.list({ customerId: params.id })]);
      setC(cu.data); setRows(q.data);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load quotes.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !c) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ProfileHeader c={c} active="Quotes" />
        <View style={styles.list}>
          <Text style={styles.sectionLabel}>QUOTATIONS</Text>
          {rows.length ? rows.map((item, i) => {
            const isComparison = (item.number ?? '').startsWith('CQ');
            const chip = CHIP[item.status] ?? CHIP.DRAFT;
            const sub = [item.product, rupees(item.premium)].filter(Boolean).join(' · ') || '—';
            return (
              <Pressable key={item.id} style={styles.item} onPress={() => navigation.navigate('QuoteDetail', { id: item.id, number: item.number ?? undefined, customerName: c.name })}>
                <View style={[styles.tile, { backgroundColor: TILE[i % TILE.length] }]}><Icon name={(isComparison ? 'git-pull-request' : 'file-text') as IconName} size={17} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.number ?? 'Quotation'}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>{sub}</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: chip.bg }]}><Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text></View>
              </Pressable>
            );
          }) : <EmptyState icon="file-text" title="No quotations" subtitle="Start a quote from the Quote action." />}
        </View>
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
  body: { paddingBottom: 40 },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  tile: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
});
