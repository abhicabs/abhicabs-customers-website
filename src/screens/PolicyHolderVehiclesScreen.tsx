import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { ProfileHeader } from '../components/ProfileHeader';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerDetail } from '../api/types';

type R = RouteProp<AppStackParamList, 'PolicyHolderVehicles'>;
const TILE = ['#d9eafd', '#e9e3fc', '#d4f1e7', '#fde8c9'];

export function PolicyHolderVehiclesScreen() {
  const { params } = useRoute<R>();
  const [c, setC] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.customers.get(params.id); setC(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load vehicles.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !c) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const vehicles: any[] = (c as any).vehicles ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ProfileHeader c={c} active="Vehicles" />
        <View style={styles.list}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={[styles.sectionLabel, { flex: 1 }]}>VEHICLES</Text><Pressable onPress={() => navigation.navigate('AddVehicle', { customerId: params.id })}><Text style={{ fontSize: 13, fontFamily: family.bold, color: colors.blue }}>Add</Text></Pressable></View>
          {vehicles.length ? vehicles.map((v, i) => (
            <View key={v.id ?? v.registration ?? i} style={styles.item}>
              <View style={[styles.tile, { backgroundColor: TILE[i % TILE.length] }]}><Icon name="truck" size={17} color={colors.text} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{v.registration ?? v.regNumber ?? v.number ?? 'Vehicle'}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>{[v.make, v.model, v.year].filter(Boolean).join(' · ') || v.type || '—'}</Text>
              </View>
              {v.type ? <View style={styles.chip}><Text style={styles.chipText}>{v.type}</Text></View> : null}
            </View>
          )) : <EmptyState icon="truck" title="No vehicles" subtitle="Vehicles from motor policies will appear here." />}
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
  chip: { backgroundColor: '#eef1f5', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold, color: colors.muted2 },
});
