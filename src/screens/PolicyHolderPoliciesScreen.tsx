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
import type { CustomerDetail, PolicyRow, PolicyStatus } from '../api/types';

type R = RouteProp<AppStackParamList, 'PolicyHolderPolicies'>;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const endsLabel = (iso: string | null) => { if (!iso) return 'no end date'; const d = new Date(iso); return `ends ${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const TILE = ['#d4f1e7', '#d9eafd', '#e9e3fc', '#fde8c9'];
const CHIP: Record<PolicyStatus, { bg: string; fg: string; label: string }> = {
  ISSUED: { bg: '#e7f4ee', fg: '#127650', label: 'Issued' }, AWAITING_ISSUANCE: { bg: '#f0ecfb', fg: '#5b3fb8', label: 'Awaiting' },
  EXPIRED: { bg: '#fbebec', fg: '#b4323c', label: 'Expired' }, CANCELLED: { bg: '#eef1f5', fg: '#44526a', label: 'Cancelled' }, RENEWED: { bg: '#e7f4ee', fg: '#127650', label: 'Renewed' },
};

export function PolicyHolderPoliciesScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [c, setC] = useState<CustomerDetail | null>(null);
  const [rows, setRows] = useState<PolicyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [cu, pr] = await Promise.all([api.customers.get(params.id), api.policies.list({ customerId: params.id })]);
      setC(cu.data); setRows(pr.data);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load policies.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !c) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ProfileHeader c={c} active="Policies" />
        <View style={styles.list}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={[styles.sectionLabel, { flex: 1 }]}>POLICIES</Text><Pressable onPress={() => navigation.navigate('RecordExistingPolicy', { customerId: params.id, customerName: c.name })}><Text style={{ fontSize: 13, fontFamily: family.bold, color: colors.blue }}>Record existing</Text></Pressable></View>
          {rows.length ? rows.map((item, i) => {
            const chip = CHIP[item.status] ?? CHIP.ISSUED;
            const sub = item.status === 'AWAITING_ISSUANCE' ? 'number pending' : endsLabel(item.endDate);
            return (
              <Pressable key={item.id} style={styles.item} onPress={() => navigation.navigate('PolicyDetail', { id: item.id })}>
                <View style={[styles.tile, { backgroundColor: TILE[i % TILE.length] }]}><Icon name="shield" size={18} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.productName || item.policyNumber || 'Policy'}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>{sub}</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: chip.bg }]}><Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text></View>
              </Pressable>
            );
          }) : <EmptyState icon="shield" title="No policies" subtitle="Issued policies appear here." />}
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
