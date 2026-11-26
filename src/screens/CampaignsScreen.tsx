import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { CampaignConnection, CampaignRow } from '../api/types';

const CONN_META: { channel: string; label: string; icon: IconName; bg: string }[] = [
  { channel: 'META', label: 'Meta', icon: 'bar-chart-2', bg: '#1f5fd6' },
  { channel: 'GOOGLE', label: 'Google', icon: 'search', bg: '#e8899c' },
  { channel: 'WEBSITE', label: 'Website', icon: 'grid', bg: '#5b3fb8' },
];
const FILTERS = [
  { key: 'ACTIVE', label: 'Active' },
  { key: 'IN_REVIEW', label: 'In review' },
  { key: 'PAUSED', label: 'Paused' },
  { key: 'NOT_APPROVED', label: 'Not approved' },
  { key: 'ENDED', label: 'Ended' },
];
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
const bucket = (s: string) => (s === 'TURNED_OFF' ? 'PAUSED' : s);
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');

export function CampaignsScreen() {
  const navigation = useNavigation<any>();
  const [conns, setConns] = useState<CampaignConnection[]>([]);
  const [rows, setRows] = useState<CampaignRow[]>([]);
  const [filter, setFilter] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode?: 'refresh') => {
    if (mode !== 'refresh') setLoading(true);
    setError(null);
    try {
      const [c, r] = await Promise.all([api.campaigns.connections(), api.campaigns.list({})]);
      setConns(c.data); setRows(r.data);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load campaigns.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const kpis = useMemo(() => {
    const leads = rows.reduce((s, r) => s + (r.leads || 0), 0);
    const converted = rows.reduce((s, r) => s + (r.converted || 0), 0);
    const spendVals = rows.map((r) => r.spend).filter((x): x is number => typeof x === 'number');
    const spend = spendVals.length ? spendVals.reduce((a, b) => a + b, 0) : null;
    const cpl = spend !== null && leads ? Math.round(spend / leads) : null;
    return { leads, converted, spend, cpl };
  }, [rows]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rows) c[bucket(r.status)] = (c[bucket(r.status)] ?? 0) + 1;
    return c;
  }, [rows]);
  const list = useMemo(() => rows.filter((r) => bucket(r.status) === filter), [rows, filter]);
  const connStatus = (channel: string) => conns.find((c) => c.channel === channel)?.status;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Campaigns</Text>
        <Pressable style={[styles.iconBtn, shadow.iconBtn]} onPress={() => navigation.navigate('CampaignConnect')}>
          <Icon name="link" size={19} color={colors.text} />
        </Pressable>
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => load()} />
      ) : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} refreshControl={undefined}>
          {/* Connections */}
          <View style={styles.connRow}>
            {CONN_META.map((cm) => {
              const st = connStatus(cm.channel);
              const connected = st === 'CONNECTED';
              const reconnect = st === 'RECONNECT_NEEDED';
              return (
                <Pressable key={cm.channel} style={styles.conn} onPress={() => { const conn = (conns as any[]).find((x) => x.channel === cm.channel); if (conn && (conn.connected || conn.status === 'CONNECTED')) navigation.navigate('CampaignSetup', { id: conn.id, name: cm.label, channel: cm.channel }); else navigation.navigate('CampaignConnect'); }}>
                  <View style={[styles.connIcon, { backgroundColor: cm.bg }]}><Icon name={cm.icon} size={16} color="#fff" /></View>
                  <Text style={styles.connName}>{cm.label}</Text>
                  <View style={[styles.connChip, { backgroundColor: connected ? '#e7f4ee' : reconnect ? '#fbf1e1' : '#eef1f5' }]}>
                    <Text style={[styles.connChipText, { color: connected ? '#127650' : reconnect ? '#8a5a12' : '#44526a' }]}>{connected ? 'Connected' : reconnect ? 'Reconnect' : 'Connect'}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* KPIs */}
          <View style={styles.kpis}>
            <Kpi bg="#d9eafd" label="Ad and website leads" value={String(kpis.leads)} />
            <Kpi bg="#d4f1e7" label="Converted" value={String(kpis.converted)} />
            <Kpi bg="#fde8c9" label="Ad spend" value={rupees(kpis.spend)} />
            <Kpi bg="#e9e3fc" label="Cost per lead" value={rupees(kpis.cpl)} />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.actGhost} onPress={() => { const last = conns.map((c: any) => `${c.name ?? c.channel}: ${c.lastSyncedAt ? new Date(c.lastSyncedAt).toLocaleString() : 'not synced yet'}`).join('\n'); Alert.alert('Sync status', last || 'No connected channels yet.'); }}>
              <Icon name="list" size={16} color={colors.text} /><Text style={styles.actGhostText}>Sync log</Text>
            </Pressable>
            <Pressable style={styles.actText} onPress={() => navigation.navigate('HowBadgesWork')}>
              <Icon name="alert-circle" size={16} color={colors.text} /><Text style={styles.actGhostText}>How badges work</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>CAMPAIGNS</Text>
          <View style={styles.chips}>
            {FILTERS.map((fl) => {
              const on = fl.key === filter;
              const c = counts[fl.key] ?? 0;
              return (
                <Pressable key={fl.key} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setFilter(fl.key)}>
                  <Text style={[styles.chipLabel, { color: on ? colors.onPrimary : colors.muted2 }]}>{fl.label}</Text>
                  <Text style={[styles.chipCount, { color: on ? colors.onPrimary : colors.muted }]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>

          {loading ? <EmptyState icon="loader" title="Loading…" /> : list.length ? list.map((r) => {
            const chip = statusChip(r.status);
            const unit = r.kind === 'FORM' ? 'enquiries' : 'leads';
            const sub = `${channelLabel(r.channel)} · ${r.leads} ${unit}${r.today ? ` · ${r.today} today` : ''}`;
            return (
              <Pressable key={r.id} style={styles.row} onPress={() => navigation.navigate('CampaignDetail', { id: r.id, name: r.name })}>
                <View style={styles.rowIcon}><Icon name="bar-chart-2" size={18} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{r.name}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>{sub}</Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: chip.bg }]}><Text style={[styles.statusText, { color: chip.fg }]}>{chip.label}</Text></View>
              </Pressable>
            );
          }) : <EmptyState icon="bar-chart-2" title="No campaigns" subtitle="Nothing in this tab." />}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Kpi({ bg, label, value }: { bg: string; label: string; value: string }) {
  return (
    <View style={[styles.kpi, { backgroundColor: bg }]}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, fontSize: 18, fontFamily: family.bold, color: colors.text },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 10 },
  connRow: { flexDirection: 'row', gap: 8 },
  conn: { flex: 1, backgroundColor: colors.surface, borderRadius: 18, padding: 12, alignItems: 'center', gap: 6 },
  connIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  connName: { fontSize: 12, fontFamily: family.bold, color: colors.text },
  connChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  connChipText: { fontSize: 12, fontFamily: family.semibold },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpi: { width: '48.5%', borderRadius: 16, padding: 12, gap: 2 },
  kpiLabel: { fontSize: 11, fontFamily: family.bold, color: '#44526a' },
  kpiValue: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  actions: { flexDirection: 'row', gap: 8 },
  actGhost: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 36, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingLeft: 12, paddingRight: 14 },
  actText: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 36, paddingLeft: 12, paddingRight: 14 },
  actGhostText: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipLabel: { fontSize: 12, fontFamily: family.semibold },
  chipCount: { fontSize: 11, fontFamily: family.bold },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f0fd', alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  rowSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  statusText: { fontSize: 12, fontFamily: family.semibold },
});
