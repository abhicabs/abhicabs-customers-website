import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { ProfileHeader } from '../components/ProfileHeader';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerDetail, RenewalRow } from '../api/types';

type R = RouteProp<AppStackParamList, 'PolicyHolderRenewals'>;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayMonth = (iso: string | null) => { if (!iso) return '—'; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const daysChip = (d: number) => (d < 0 ? { bg: '#fbebec', fg: '#b4323c' } : d <= 7 ? { bg: '#fde8c9', fg: '#8a5a12' } : { bg: '#e8f0fd', fg: '#1f5fd6' });

export function PolicyHolderRenewalsScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [c, setC] = useState<CustomerDetail | null>(null);
  const [rows, setRows] = useState<RenewalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [cu, rn] = await Promise.all([api.customers.get(params.id), api.renewals.list({ customerId: params.id })]);
      setC(cu.data); setRows(rn.data);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load renewals.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !c) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ProfileHeader c={c} active="Renewals" />
        <View style={styles.list}>
          <Text style={styles.sectionLabel}>RENEWALS</Text>
          {rows.length ? rows.map((item) => {
            const dc = daysChip(item.daysLeft);
            return (
              <Pressable key={item.id} style={styles.item} onPress={() => navigation.navigate('RenewalDetail', { id: item.id })}>
                <View style={styles.tile}><Icon name="refresh-cw" size={17} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.policy?.product ?? item.policy?.insurer ?? 'Renewal'}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>due {dayMonth(item.dueDate)}</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: dc.bg }]}><Text style={[styles.chipText, { color: dc.fg }]}>{item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d late` : `${item.daysLeft}d`}</Text></View>
              </Pressable>
            );
          }) : <EmptyState icon="refresh-cw" title="No renewals" subtitle="Upcoming renewals will appear here." />}
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
  tile: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fde8c9', alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
});
