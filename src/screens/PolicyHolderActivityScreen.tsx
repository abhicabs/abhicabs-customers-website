import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { ProfileHeader } from '../components/ProfileHeader';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { relativeTime } from '../lib/format';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerDetail } from '../api/types';

type R = RouteProp<AppStackParamList, 'PolicyHolderActivity'>;
const styleFor = (t: string): { icon: IconName; bg: string } => {
  const c = (t || '').toUpperCase();
  if (c.includes('CALL') || c.includes('CONTACT')) return { icon: 'phone', bg: '#d9eafd' };
  if (c.includes('MESSAGE') || c.includes('WHATSAPP')) return { icon: 'message-circle', bg: '#d4f1e7' };
  if (c.includes('QUOT')) return { icon: 'file-text', bg: '#e8f0fd' };
  if (c.includes('POLIC')) return { icon: 'shield', bg: '#d4f1e7' };
  if (c.includes('RENEW')) return { icon: 'refresh-cw', bg: '#fde8c9' };
  if (c.includes('DOC')) return { icon: 'folder', bg: '#fde8ec' };
  if (c.includes('PAY')) return { icon: 'credit-card', bg: '#e9e3fc' };
  return { icon: 'activity', bg: '#eef1f5' };
};

export function PolicyHolderActivityScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [c, setC] = useState<CustomerDetail | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [cu, act] = await Promise.all([api.customers.get(params.id), api.customers.activity(params.id)]);
      setC(cu.data);
      const a = act.data;
      setRows(Array.isArray(a) ? a : a.items ?? a.events ?? a.activity ?? []);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load activity.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !c) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ProfileHeader c={c} active="Activity" />
        <View style={styles.list}>
          <Text style={styles.sectionLabel}>ACTIVITY</Text>
          <View style={styles.card}>
            {rows.length ? rows.map((r, i) => {
              const st = styleFor(r.type ?? r.kind ?? r.category ?? '');
              const title = r.title ?? r.message ?? r.action ?? 'Activity';
              return (
                <View key={r.id ?? i} style={styles.row}>
                  <View style={[styles.tile, { backgroundColor: st.bg }]}><Icon name={st.icon} size={14} color={colors.text} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle} numberOfLines={2}>{title}</Text>
                    <Text style={styles.rowSub}>{[r.detail, relativeTime(r.at ?? r.createdAt ?? new Date().toISOString())].filter(Boolean).join(' · ')}</Text>
                  </View>
                </View>
              );
            }) : <Text style={styles.empty}>No activity yet.</Text>}
          </View>
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
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  tile: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 13, lineHeight: 18, fontFamily: family.bold, color: colors.text },
  rowSub: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  empty: { fontSize: 13, fontFamily: family.medium, color: colors.muted },
});
