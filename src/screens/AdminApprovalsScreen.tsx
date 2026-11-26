import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { StaffTabBar } from '../components/StaffTabBar';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';

const TABS = [{ key: 'PENDING', label: 'Pending' }, { key: 'APPROVED', label: 'Approved' }, { key: 'REJECTED', label: 'Rejected' }];
const styleFor = (t: string): { icon: IconName; bg: string } => {
  const c = (t || '').toUpperCase();
  if (c.includes('CONFIG')) return { icon: 'edit-3', bg: '#e9e3fc' };
  if (c.includes('TEMPLATE')) return { icon: 'mail', bg: '#fde8c9' };
  return { icon: 'check', bg: '#d9eafd' };
};
const chipFor = (st: string) => (st === 'APPROVED' ? { bg: '#e7f4ee', fg: '#127650', label: 'Approved' } : st === 'REJECTED' ? { bg: '#fbebec', fg: '#b4323c', label: 'Rejected' } : { bg: '#f0ecfb', fg: '#5b3fb8', label: 'Pending' });

export function AdminApprovalsScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState('PENDING');
  const [rows, setRows] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (t: string) => {
    setLoading(true); setError(null);
    try { const { data } = await api.admin.approvals({ status: t }); const items = Array.isArray(data) ? data : data.items ?? data.approvals ?? []; setRows(items); setCounts((c) => ({ ...c, [t]: items.length })); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load approvals.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(tab); }, [tab, load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Text style={styles.title}>Approvals</Text>
        <Text style={styles.sub}>Maker-checker · second admin</Text>
      </View>
      <View style={styles.chips}>
        {TABS.map((t) => { const on = t.key === tab; const c = counts[t.key]; return (
          <Pressable key={t.key} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setTab(t.key)}>
            <Text style={[styles.chipLabel, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.label}</Text>
            {typeof c === 'number' ? <Text style={[styles.chipCount, { color: on ? colors.onPrimary : colors.muted }]}>{c}</Text> : null}
          </Pressable>
        ); })}
      </View>

      {error ? <ErrorState message={error} onRetry={() => load(tab)} /> : (
        <View style={styles.flex1}>
          {loading ? <EmptyState icon="loader" title="Loading…" /> : rows.length ? (
            <View style={styles.list}>
              {rows.map((r, i) => {
                const st = styleFor(r.kind ?? r.type ?? r.entity ?? '');
                const chip = chipFor(r.status ?? tab);
                return (
                  <Pressable key={r.id ?? i} style={styles.item} onPress={() => (tab === 'PENDING' ? navigation.navigate('ApproveOtp', { id: r.id, title: r.title ?? r.name, version: r.version ?? 0 }) : undefined)}>
                    <View style={[styles.itemIcon, { backgroundColor: st.bg }]}><Icon name={st.icon} size={17} color={colors.text} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle} numberOfLines={1}>{r.title ?? r.name ?? 'Approval'}</Text>
                      <Text style={styles.itemSub} numberOfLines={1}>{[r.kind ?? r.type, r.by ?? r.submittedBy ? `${r.by ?? r.submittedBy}` : null].filter(Boolean).join(' · ')}</Text>
                    </View>
                    <View style={[styles.chip2, { backgroundColor: chip.bg }]}><Text style={[styles.chip2Text, { color: chip.fg }]}>{chip.label}</Text></View>
                  </Pressable>
                );
              })}
            </View>
          ) : <EmptyState icon="check-circle" title="Nothing here" subtitle={`No ${tab.toLowerCase()} approvals.`} />}
        </View>
      )}

      <StaffTabBar active="Approvals" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { paddingLeft: 20, paddingRight: 16, paddingTop: 8, paddingBottom: 10, gap: 1 },
  title: { fontSize: 26, fontFamily: family.bold, color: colors.text, letterSpacing: -0.26 },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  chips: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingBottom: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipLabel: { fontSize: 12, fontFamily: family.semibold },
  chipCount: { fontSize: 11, fontFamily: family.bold },
  list: { paddingHorizontal: 16, gap: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  itemIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip2: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chip2Text: { fontSize: 12, fontFamily: family.semibold },
});
