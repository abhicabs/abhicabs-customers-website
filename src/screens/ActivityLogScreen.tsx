import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { relativeTime } from '../lib/format';
import { colors, family } from '../theme/theme';

const FILTERS = [
  { key: 'ALL', label: 'All' }, { key: 'LOGINS', label: 'Logins' }, { key: 'RECORDS', label: 'Records' }, { key: 'EXPORTS', label: 'Exports' },
];
const styleFor = (cat: string): { icon: IconName; bg: string } => {
  const c = (cat || '').toUpperCase();
  if (c.includes('LOGIN') || c.includes('AUTH') || c.includes('SESSION')) return { icon: 'lock', bg: '#fde8c9' };
  if (c.includes('EXPORT')) return { icon: 'download', bg: '#d4f1e7' };
  if (c.includes('VIEW') || c.includes('READ')) return { icon: 'eye', bg: '#d9eafd' };
  return { icon: 'user-plus', bg: '#e9e3fc' };
};
const bucket = (cat: string): string => {
  const c = (cat || '').toUpperCase();
  if (c.includes('LOGIN') || c.includes('AUTH') || c.includes('SESSION')) return 'LOGINS';
  if (c.includes('EXPORT')) return 'EXPORTS';
  return 'RECORDS';
};

export function ActivityLogScreen() {
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.audit.list(); setRows(Array.isArray(data) ? data : data.items ?? data.events ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load the activity log.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const items = useMemo(() => rows.filter((r) => filter === 'ALL' || bucket(r.category ?? r.type ?? r.action ?? '') === filter), [rows, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Activity log</Text>
      </View>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.chips}>
            {FILTERS.map((fl) => {
              const on = fl.key === filter;
              return <Pressable key={fl.key} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setFilter(fl.key)}><Text style={[styles.chipText, { color: on ? colors.onPrimary : colors.muted2 }]}>{fl.label}</Text></Pressable>;
            })}
          </View>

          <View style={styles.card}>
            {loading ? <EmptyState icon="loader" title="Loading…" /> : items.length ? items.map((r, i) => {
              const st = styleFor(r.category ?? r.type ?? r.action ?? '');
              const title = r.message ?? r.title ?? [r.actorName ?? r.actor, r.action].filter(Boolean).join(' ') ?? 'Activity';
              return (
                <View key={r.id ?? i} style={styles.row}>
                  <View style={[styles.tile, { backgroundColor: st.bg }]}><Icon name={st.icon} size={14} color={colors.text} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle} numberOfLines={2}>{title}</Text>
                    <Text style={styles.rowSub}>{relativeTime(r.at ?? r.createdAt ?? new Date().toISOString())}</Text>
                  </View>
                </View>
              );
            }) : <Text style={styles.empty}>No activity recorded.</Text>}
          </View>
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
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  chips: { flexDirection: 'row', gap: 6 },
  chip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tile: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 13, lineHeight: 18, fontFamily: family.bold, color: colors.text },
  rowSub: { fontSize: 11, fontFamily: family.medium, color: colors.muted },
  empty: { fontSize: 13, fontFamily: family.medium, color: colors.muted },
});
