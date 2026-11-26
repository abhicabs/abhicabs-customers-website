import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';

const TILE = ['#fbebec', '#fde8c9', '#e9e3fc', '#d9eafd'];
const chipFor = (st: string) => { const s = (st || '').toUpperCase(); if (s.includes('RESOLV') || s.includes('CLEARED')) return { bg: '#e7f4ee', fg: '#127650', label: 'Resolved' }; if (s.includes('EXPIR')) return { bg: '#fbebec', fg: '#b4323c', label: 'Expired' }; return { bg: '#fbf1e1', fg: '#8a5a12', label: 'Open' }; };

export function AgentCodeFlagsScreen() {
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.admin.flags(); setRows(Array.isArray(data) ? data : data.items ?? data.flags ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load flags.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Agent-code flags</Text>
      </View>

      {error ? <ErrorState message={error} onRetry={load} /> : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {loading ? <EmptyState icon="loader" title="Loading…" /> : rows.length ? rows.map((r, i) => {
            const chip = chipFor(r.status ?? r.state ?? '');
            const title = [r.insurer, r.code ?? r.agentCode].filter(Boolean).join(' · ') || r.title || 'Flag';
            return (
              <Pressable key={r.id ?? i} style={styles.item} onPress={() => Alert.alert('Resolve flag?', 'Mark this agent-code flag resolved.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Resolve', onPress: async () => { try { await api.admin.resolveFlag(r.id, {}); load(); } catch (e) { Alert.alert('Failed', e instanceof ApiError ? e.message : 'Try again.'); } } }])}>
                <View style={[styles.tile, { backgroundColor: TILE[i % TILE.length] }]}><Icon name="flag" size={17} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{title}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>{[r.advisorName ?? r.account, r.reason].filter(Boolean).join(' · ') || '—'}</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: chip.bg }]}><Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text></View>
              </Pressable>
            );
          }) : <EmptyState icon="flag" title="No flags" subtitle="Agent-code issues will appear here." />}
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
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  tile: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
});
