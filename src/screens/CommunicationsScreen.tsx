import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';

const TABS = [
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'sent', label: 'Sent' },
  { key: 'failed', label: 'Not sent' },
];
const TILE = ['#d9eafd', '#e9e3fc', '#fde8c9', '#d4f1e7'];
const chipFor = (st?: string) => {
  const s = (st || '').toUpperCase();
  if (s === 'SENT' || s === 'DELIVERED') return { bg: '#e7f4ee', fg: '#127650', label: 'Sent' };
  if (s === 'SCHEDULED' || s === 'QUEUED') return { bg: '#e8f0fd', fg: '#1f5fd6', label: 'Scheduled' };
  if (s === 'FAILED' || s === 'BOUNCED') return { bg: '#fbebec', fg: '#b4323c', label: 'Failed' };
  if (s === 'SKIPPED') return { bg: '#fbf1e1', fg: '#8a5a12', label: 'Skipped' };
  if (s === 'CANCELLED') return { bg: '#eef1f5', fg: '#44526a', label: 'Cancelled' };
  return { bg: '#fbf1e1', fg: '#8a5a12', label: st ? st.charAt(0) + st.slice(1).toLowerCase() : 'Unknown' };
};

export function CommunicationsScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState('failed');
  const [rows, setRows] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);

  const load = useCallback(async (t: string) => {
    setLoading(true); setError(null);
    try { const { data } = await api.communications.list({ tab: t }); const items = Array.isArray(data) ? data : data.items ?? data.messages ?? []; setRows(items); setCounts((c) => ({ ...c, [t]: items.length })); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load communications.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(tab); }, [tab, load]);
  useEffect(() => { api.wallet.get().then((r) => setWallet(r.data)).catch(() => undefined); }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Communications</Text>
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => load(tab)} />
      ) : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.chips}>
            {TABS.map((t) => {
              const on = t.key === tab;
              const c = counts[t.key];
              return (
                <Pressable key={t.key} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setTab(t.key)}>
                  <Text style={[styles.chipLabel, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.label}</Text>
                  {typeof c === 'number' ? <Text style={[styles.chipCount, { color: on ? colors.onPrimary : colors.muted }]}>{c}</Text> : null}
                </Pressable>
              );
            })}
            <Pressable style={[styles.chip, styles.chipOff]} onPress={() => navigation.navigate('Greetings')}>
              <Text style={[styles.chipLabel, { color: colors.muted2 }]}>Greetings</Text>
            </Pressable>
          </View>

          {loading ? <EmptyState icon="loader" title="Loading…" /> : rows.length ? rows.map((r, i) => {
            const chip = chipFor(r.status);
            const isEmail = /EMAIL/i.test(r.channel ?? '');
            const icon: IconName = isEmail ? 'mail' : 'message-circle';
            const title = [r.customerName ?? r.name ?? r.to, r.purposeLabel ?? r.purpose].filter(Boolean).join(' · ') || 'Message';
            return (
              <Pressable key={r.id ?? i} style={styles.item} onPress={() => navigation.navigate('MessageDetail', { id: r.id })}>
                <View style={[styles.tile, { backgroundColor: TILE[i % TILE.length] }]}><Icon name={icon} size={17} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{title}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>{r.reason ?? r.detail ?? r.preview ?? '—'}</Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: chip.bg }]}><Text style={[styles.statusText, { color: chip.fg }]}>{chip.label}</Text></View>
              </Pressable>
            );
          }) : <EmptyState icon="message-circle" title="Nothing here" subtitle="No messages in this tab." />}

          {wallet ? (
            <View style={styles.note}>
              <Icon name="credit-card" size={16} color={colors.blue} />
              <Text style={styles.noteText}>Wallet ₹{(wallet.balance ?? 0).toLocaleString('en-IN')} · about {Math.floor((wallet.balance ?? 0) / (wallet.pricePerMessage ?? 1))} WhatsApp messages left</Text>
            </View>
          ) : null}
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipLabel: { fontSize: 12, fontFamily: family.semibold },
  chipCount: { fontSize: 11, fontFamily: family.bold },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  tile: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  statusText: { fontSize: 12, fontFamily: family.semibold },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
});
