import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { StaffTabBar } from '../components/StaffTabBar';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { colors, family } from '../theme/theme';

const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayMonth = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const humanize = (t: string) => (t || '').replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export function AdminHomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.admin.dashboard(); setD(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load the admin home.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  const k = d?.kpis ?? {};
  const tiles: { label: string; value: string; bg: string; route: string }[] = [
    { label: 'Advisors', value: String(k.advisors?.total ?? 0), bg: '#d9eafd', route: 'AdminAdvisors' },
    { label: 'KYC to review', value: String(k.kycToReview?.count ?? 0), bg: '#e9e3fc', route: 'AdminKyc' },
    { label: 'Corrections waiting', value: String(k.correctionsWaiting ?? 0), bg: '#fde8c9', route: 'AdminCorrections' },
    { label: 'Agent-code flags', value: String(k.openAgentCodeFlags ?? 0), bg: '#d4f1e7', route: 'AgentCodeFlags' },
  ];
  const needs: any[] = Array.isArray(d?.needsAttention) ? d.needsAttention : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Text style={styles.title}>SkyUp Admin</Text>
        <Text style={styles.sub}>Accounts, KYC, catalogue and configuration</Text>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.tiles}>
          {tiles.map((t) => (
            <Pressable key={t.label} style={[styles.tile, { backgroundColor: t.bg }]} onPress={() => navigation.navigate(t.route)}>
              <Text style={styles.tileLabel}>{t.label}</Text>
              <Text style={styles.tileValue}>{t.value}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>NEEDS ATTENTION</Text>
        {needs.length ? needs.map((n, i) => {
          const isKyc = /KYC/i.test(n.type ?? '');
          return (
            <Pressable key={i} style={styles.item} onPress={() => (n.accountId ? navigation.navigate('AdminAccountDetail', { id: n.accountId }) : navigation.navigate('AdminApprovals'))}>
              <View style={[styles.itemIcon, { backgroundColor: isKyc ? '#fde8c9' : '#e9e3fc' }]}><Icon name={(isKyc ? 'shield' : 'alert-circle') as IconName} size={17} color={colors.text} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{n.label ?? humanize(n.type)}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>{humanize(n.type)}{n.since ? ` · ${dayMonth(n.since)}` : ''}</Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.grayBar} />
            </Pressable>
          );
        }) : <EmptyState icon="check-circle" title="All clear" subtitle="Nothing needs attention." />}

        {d?.planMix ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Plan mix</Text>
            {Object.entries(d.planMix).map(([plan, n]) => (
              <View key={plan} style={styles.planRow}><Text style={styles.planLabel}>{humanize(plan)}</Text><Text style={styles.planValue}>{String(n)}</Text></View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <StaffTabBar active="Home" />
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { paddingLeft: 20, paddingRight: 16, paddingTop: 8, paddingBottom: 10, gap: 1 },
  title: { fontSize: 26, fontFamily: family.bold, color: colors.text, letterSpacing: -0.26 },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100, gap: 12 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '48.5%', borderRadius: 16, padding: 12, gap: 2 },
  tileLabel: { fontSize: 11, fontFamily: family.bold, color: '#44526a' },
  tileValue: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6, marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  itemIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 10, marginTop: 2 },
  cardTitle: { fontSize: 16, fontFamily: family.bold, color: colors.text },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  planLabel: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.text },
  planValue: { fontSize: 13, fontFamily: family.bold, color: colors.text },
});
