import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Pressable } from 'react-native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { relativeTime } from '../lib/format';
import { colors, family } from '../theme/theme';

const styleFor = (cat: string): { icon: IconName; bg: string } => {
  const c = (cat || '').toUpperCase();
  if (c.includes('LOGIN') || c.includes('AUTH')) return { icon: 'lock', bg: '#fde8c9' };
  if (c.includes('APPROV')) return { icon: 'check', bg: '#d4f1e7' };
  if (c.includes('KYC')) return { icon: 'shield', bg: '#e9e3fc' };
  if (c.includes('EXPORT')) return { icon: 'download', bg: '#d4f1e7' };
  return { icon: 'activity', bg: '#d9eafd' };
};

export function AdminAuditScreen() {
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.audit.list(); setRows(Array.isArray(data) ? data : data.items ?? data.events ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load the audit log.'); }
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
        <Text style={styles.navTitle}>Audit log</Text>
      </View>

      {error ? <ErrorState message={error} onRetry={load} /> : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {loading ? <EmptyState icon="loader" title="Loading…" /> : rows.length ? rows.map((r, i) => {
              const st = styleFor(r.category ?? r.type ?? r.action ?? '');
              const title = r.message ?? r.title ?? [r.actorName ?? r.actor, r.action].filter(Boolean).join(' ') ?? 'Event';
              return (
                <View key={r.id ?? i} style={styles.row}>
                  <View style={[styles.tile, { backgroundColor: st.bg }]}><Icon name={st.icon} size={14} color={colors.text} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle} numberOfLines={2}>{title}</Text>
                    <Text style={styles.rowSub}>{[r.account ?? r.accountName, relativeTime(r.at ?? r.createdAt ?? new Date().toISOString())].filter(Boolean).join(' · ')}</Text>
                  </View>
                </View>
              );
            }) : <Text style={styles.empty}>No audit entries.</Text>}
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
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tile: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 13, lineHeight: 18, fontFamily: family.bold, color: colors.text },
  rowSub: { fontSize: 11, fontFamily: family.medium, color: colors.muted },
  empty: { fontSize: 13, fontFamily: family.medium, color: colors.muted },
});
