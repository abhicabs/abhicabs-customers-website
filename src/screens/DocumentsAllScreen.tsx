import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';

const TABS = [{ key: 'ALL', label: 'All' }, { key: 'UNCONFIRMED', label: 'Unconfirmed' }, { key: 'CONFIRMED', label: 'Confirmed' }];
const tileFor = (type: string): { icon: IconName; bg: string } => {
  const t = (type || '').toLowerCase();
  if (t.includes('vehicle') || t.includes('rc')) return { icon: 'truck', bg: '#d9eafd' };
  if (t.includes('medical') || t.includes('health')) return { icon: 'heart', bg: '#fde8ec' };
  if (t.includes('pan') || t.includes('aadhaar') || t.includes('passport')) return { icon: 'credit-card', bg: '#e9e3fc' };
  return { icon: 'folder', bg: '#fde8ec' };
};
const chipFor = (st?: string) => (st === 'CONFIRMED' ? { bg: '#e7f4ee', fg: '#127650', label: 'Confirmed' } : { bg: '#fbf1e1', fg: '#8a5a12', label: 'Unconfirmed' });

export function DocumentsAllScreen() {
  const navigation = useNavigation<any>();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('ALL');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const query: Record<string, string | undefined> = {};
        if (tab !== 'ALL') query.status = tab;
        if (q.trim()) query.search = q.trim();
        const { data } = await api.documents.list(query);
        setRows(Array.isArray(data) ? data : data.items ?? data.documents ?? []);
        setError(null);
      } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load documents.'); }
      finally { setLoading(false); }
    }, q ? 300 : 0);
    return () => timer.current && clearTimeout(timer.current);
  }, [q, tab]);

  const groups = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const d of rows) { const k = d.customerName ?? d.household ?? d.personName ?? 'Documents'; if (!map.has(k)) map.set(k, []); map.get(k)!.push(d); }
    return [...map.entries()];
  }, [rows]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.navTitle}>Documents</Text>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.search}>
          <Icon name="search" size={18} color={colors.grayBar} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search documents" placeholderTextColor={colors.grayBar} style={styles.searchInput} selectionColor={colors.blue} autoCapitalize="none" />
        </View>
      </View>
      <View style={styles.chips}>
        {TABS.map((t) => { const on = t.key === tab; return (
          <Pressable key={t.key} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setTab(t.key)}><Text style={[styles.chipLabel, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.label}</Text></Pressable>
        ); })}
      </View>

      {error ? <ErrorState message={error} onRetry={() => setQ((x) => x)} /> : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {loading ? <View style={styles.loader}><ActivityIndicator color={colors.blue} /></View>
            : groups.length ? groups.map(([house, docs]) => (
              <View key={house} style={{ gap: 10 }}>
                <Text style={styles.sectionLabel}>{String(house).toUpperCase()}</Text>
                {docs.map((d, i) => {
                  const tile = tileFor(d.type ?? d.label ?? '');
                  const chip = chipFor(d.status);
                  return (
                    <Pressable key={d.id ?? i} style={styles.item} onPress={() => navigation.navigate('CheckValues', { docId: d.id })}>
                      <View style={[styles.tile, { backgroundColor: tile.bg }]}><Icon name={tile.icon} size={17} color={colors.text} /></View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{d.label ?? d.type ?? 'Document'}{d.personName ? ` · ${d.personName}` : ''}</Text>
                        <Text style={styles.itemSub} numberOfLines={1}>v{d.version ?? 1}</Text>
                      </View>
                      <View style={[styles.statusChip, { backgroundColor: chip.bg }]}><Text style={[styles.statusText, { color: chip.fg }]}>{chip.label}</Text></View>
                    </Pressable>
                  );
                })}
              </View>
            )) : <EmptyState icon="folder" title="No documents" subtitle={q ? `Nothing matches “${q.trim()}”.` : 'Documents will appear here.'} />}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 6 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 10 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, backgroundColor: colors.surface, borderRadius: 24, paddingHorizontal: 16 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: family.medium, color: colors.text, padding: 0 },
  chips: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingBottom: 12 },
  chip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipLabel: { fontSize: 12, fontFamily: family.semibold },
  body: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },
  loader: { paddingVertical: 40, alignItems: 'center' },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  tile: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  statusText: { fontSize: 12, fontFamily: family.semibold },
});
