import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { LeadRow, LeadStatus } from '../api/types';

const COLUMNS: { key: LeadStatus; label: string }[] = [
  { key: 'NEW', label: 'NEW' }, { key: 'CONTACTED', label: 'CONTACTED' }, { key: 'QUALIFIED', label: 'QUALIFIED' }, { key: 'FOLLOW_UP', label: 'FOLLOW-UP' },
];
const CHIP: Record<string, { bg: string; fg: string; label: string }> = {
  NEW: { bg: '#d9eafd', fg: '#1f5fd6', label: 'New' }, CONTACTED: { bg: '#f0ecfb', fg: '#5b3fb8', label: 'Contacted' },
  QUALIFIED: { bg: '#d4f1e7', fg: '#127650', label: 'Qualified' }, FOLLOW_UP: { bg: '#fbf1e1', fg: '#8a5a12', label: 'Follow-up' },
};
const AV = ['#d9eafd', '#e9e3fc', '#fde8c9', '#d4f1e7', '#fbd5dd'];
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

export function LeadsBoardScreen() {
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.leads.list({ tab: 'ALL' } as any); setRows(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load leads.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const grouped = useMemo(() => COLUMNS.map((c) => ({ ...c, items: rows.filter((r) => r.status === c.key) })).filter((c) => c.items.length), [rows]);

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Text style={styles.navTitle}>Leads</Text>
        <Pressable style={styles.toggle} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="list" size={20} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {grouped.length ? grouped.map((col) => (
          <View key={col.key} style={{ gap: 10 }}>
            <Text style={styles.colLabel}>{col.label} · {col.items.length}</Text>
            {col.items.map((r, i) => {
              const chip = CHIP[r.status] ?? CHIP.NEW;
              return (
                <Pressable key={r.id} style={styles.card} onPress={() => navigation.navigate('LeadDetail', { id: r.id, name: r.name })}>
                  <View style={[styles.avatar, { backgroundColor: AV[i % AV.length] }]}><Text style={styles.avatarText}>{initials(r.name)}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName} numberOfLines={1}>{r.name}</Text>
                    <Text style={styles.cardSub} numberOfLines={1}>{r.source ?? r.number ?? ''}</Text>
                  </View>
                  <View style={[styles.chip, { backgroundColor: chip.bg }]}><Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text></View>
                </Pressable>
              );
            })}
          </View>
        )) : <EmptyState icon="users" title="No active leads" subtitle="New leads will show up here by stage." />}

        <Text style={styles.hint}>Tap a card to open the lead and change its stage.</Text>
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
  appbar: { flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  navTitle: { flex: 1, fontSize: 26, fontFamily: family.bold, color: colors.text, letterSpacing: -0.26 },
  toggle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 14 },
  colLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontFamily: family.bold, color: colors.navy },
  cardName: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  cardSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  hint: { fontSize: 12, fontFamily: family.medium, color: colors.muted, textAlign: 'center', paddingTop: 4 },
});
