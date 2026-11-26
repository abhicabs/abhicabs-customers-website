import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'CampaignDetail'>;
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');
const channelLabel = (c: string) => ({ META: 'Meta Ads', GOOGLE: 'Google Ads', WEBSITE: 'Website', LINKEDIN: 'LinkedIn' } as Record<string, string>)[c] ?? c;
const statusChip = (s: string): { bg: string; fg: string; label: string } => {
  if (s === 'ACTIVE') return { bg: '#e7f4ee', fg: '#127650', label: 'Active' };
  if (s === 'PAUSED' || s === 'TURNED_OFF') return { bg: '#fbf1e1', fg: '#8a5a12', label: 'Paused' };
  if (s === 'IN_REVIEW') return { bg: '#e8f0fd', fg: '#1f5fd6', label: 'In review' };
  if (s === 'NOT_APPROVED') return { bg: '#fbebec', fg: '#b4323c', label: 'Not approved' };
  if (s === 'ENDED') return { bg: '#eef1f5', fg: '#44526a', label: 'Ended' };
  if (s === 'RECONNECT_NEEDED') return { bg: '#fbf1e1', fg: '#8a5a12', label: 'Reconnect' };
  return { bg: '#eef1f5', fg: '#44526a', label: 'Syncing' };
};

export function CampaignDetailScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.campaigns.get(params.id); setD(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this campaign.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !d) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const chip = statusChip(d.status);
  const byAd: any[] = Array.isArray(d.leadsByAd) ? d.leadsByAd : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle} numberOfLines={1}>{params.name ?? d.name}</Text>
          <Text style={styles.navSub} numberOfLines={1}>{channelLabel(d.channel)}</Text>
        </View>
        <Pressable style={[styles.iconBtn, shadow.iconBtn]} onPress={() => { const cid = (d as any)?.connectionId ?? params.id; Alert.alert('Sync now?', 'Pull the latest leads from this channel.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sync', onPress: async () => { try { await api.campaigns.syncNow(cid); load(); } catch (e) { Alert.alert('Sync failed', e instanceof ApiError ? e.message : 'Try again.'); } } }]); }}>
          <Icon name="refresh-cw" size={18} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroChips}>
            <View style={styles.metaChip}><Icon name="bar-chart-2" size={12} color={colors.blue} /><Text style={styles.metaChipText}>{channelLabel(d.channel)}</Text></View>
            <View style={[styles.statusChip, { backgroundColor: chip.bg }]}><Text style={[styles.statusText, { color: chip.fg }]}>{chip.label}</Text></View>
          </View>
          <Text style={styles.heroTitle}>{d.name}</Text>
          {d.category || d.platform ? <Text style={styles.heroSub}>{[d.category, d.platform].filter(Boolean).join(' · ')}</Text> : null}
        </View>

        <View style={styles.kpis}>
          <Kpi bg="#d9eafd" label="Leads" value={String(d.leads ?? 0)} />
          <Kpi bg="#e9e3fc" label="Today" value={String(d.today ?? 0)} />
          <Kpi bg="#fde8c9" label="Converted" value={String(d.converted ?? 0)} />
          <Kpi bg="#d4f1e7" label="Cost / lead" value={rupees(d.costPerLead)} />
        </View>

        {byAd.length ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>LEADS BY AD</Text>
            {byAd.map((a, i) => (
              <View key={a.adId ?? i} style={styles.adRow}>
                <Text style={styles.adName} numberOfLines={1}>{[a.name, a.adSetName].filter(Boolean).join(' · ') || 'Ad'}</Text>
                <Text style={styles.adLeads}>{a.leads}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.cta, shadow.button]} onPress={() => navigation.navigate('CampaignLeads', { id: d.id, name: d.name })}>
          <Icon name="arrow-right" size={18} color={colors.onPrimary} />
          <Text style={styles.ctaText}>See leads and answers</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}
function Kpi({ bg, label, value }: { bg: string; label: string; value: string }) {
  return <View style={[styles.kpi, { backgroundColor: bg }]}><Text style={styles.kpiLabel}>{label}</Text><Text style={styles.kpiValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 12 },
  hero: { backgroundColor: '#e8f0fd', borderRadius: 22, padding: 16, gap: 8 },
  heroChips: { flexDirection: 'row', gap: 6 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#d9eafd', paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  metaChipText: { fontSize: 12, fontFamily: family.semibold, color: colors.blue },
  statusChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  statusText: { fontSize: 12, fontFamily: family.semibold },
  heroTitle: { fontSize: 18, lineHeight: 24, fontFamily: family.bold, color: colors.text },
  heroSub: { fontSize: 12, lineHeight: 18, fontFamily: family.medium, color: colors.muted },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpi: { width: '48.5%', borderRadius: 16, padding: 12, gap: 2 },
  kpiLabel: { fontSize: 11, fontFamily: family.bold, color: '#44526a' },
  kpiValue: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 10 },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  adRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adName: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.text },
  adLeads: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
