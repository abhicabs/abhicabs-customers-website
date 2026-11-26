import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';

const TABS = [{ key: 'PENDING', label: 'Pending' }, { key: 'ACCEPTED', label: 'Accepted' }, { key: 'REJECTED', label: 'Rejected' }];
const chipFor = (st: string) => { const s = (st || '').toUpperCase(); if (s === 'ACCEPTED') return { bg: '#e7f4ee', fg: '#127650', label: 'Accepted' }; if (s === 'REJECTED') return { bg: '#fbebec', fg: '#b4323c', label: 'Rejected' }; return { bg: '#f0ecfb', fg: '#5b3fb8', label: 'Pending' }; };
const TILE = ['#e9e3fc', '#d9eafd', '#fde8c9', '#d4f1e7'];

export function AdminCorrectionsScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState('PENDING');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (t: string) => {
    setLoading(true); setError(null);
    try { const { data } = await api.admin.corrections({ status: t }); setRows(Array.isArray(data) ? data : data.items ?? data.corrections ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load corrections.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(tab); }, [tab, load]);

  const items = useMemo(() => rows.filter((r) => !r.status || r.status === tab), [rows, tab]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Product corrections</Text>
      </View>
      <View style={styles.chips}>
        {TABS.map((t) => { const on = t.key === tab; return (
          <Pressable key={t.key} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setTab(t.key)}><Text style={[styles.chipLabel, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.label}</Text></Pressable>
        ); })}
      </View>

      {error ? <ErrorState message={error} onRetry={() => load(tab)} /> : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {loading ? <EmptyState icon="loader" title="Loading…" /> : items.length ? items.map((r, i) => {
            const chip = chipFor(r.status ?? tab);
            return (
              <Pressable key={r.id ?? i} style={styles.item} onPress={() => navigation.Alert.alert('Review correction', r.field ? `${r.field}: ${r.proposedValue ?? ''}` : 'Accept or reject this correction.', [{ text: 'Reject', style: 'destructive', onPress: async () => { try { await api.admin.rejectCorrection(r.id, { reason: 'Not accepted' }); load(); } catch (e) { Alert.alert('Failed', e instanceof ApiError ? e.message : 'Try again.'); } } }, { text: 'Accept', onPress: async () => { try { await api.admin.acceptCorrection(r.id); load(); } catch (e) { Alert.alert('Failed', e instanceof ApiError ? e.message : 'Try again.'); } } }, { text: 'Cancel', style: 'cancel' }])}>
                <View style={[styles.tile, { backgroundColor: TILE[i % TILE.length] }]}><Icon name="edit-3" size={17} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{[r.productName ?? r.product, r.field].filter(Boolean).join(' · ') || r.title || 'Correction'}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>{[r.suggestion ?? r.message, r.by ? `by ${r.by}` : null].filter(Boolean).join(' · ') || '—'}</Text>
                </View>
                <View style={[styles.chip2, { backgroundColor: chip.bg }]}><Text style={[styles.chip2Text, { color: chip.fg }]}>{chip.label}</Text></View>
              </Pressable>
            );
          }) : <EmptyState icon="edit-3" title="No corrections" subtitle={`No ${tab.toLowerCase()} suggestions.`} />}
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
  chips: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingBottom: 12 },
  chip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipLabel: { fontSize: 12, fontFamily: family.semibold },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  tile: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip2: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chip2Text: { fontSize: 12, fontFamily: family.semibold },
});
