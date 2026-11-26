import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';

const MODES = [{ key: 'OFF', label: 'Off' }, { key: 'DEFAULT', label: 'Bimayantra' }, { key: 'OWN', label: 'My template' }];
const CH: { key: 'whatsapp' | 'email'; label: string; icon: IconName; conn: string }[] = [
  { key: 'whatsapp', label: 'WhatsApp', icon: 'message-circle', conn: 'MSG91' },
  { key: 'email', label: 'Email', icon: 'mail', conn: 'BREVO' },
];

export function MessageRulesScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.messageRules.list(); setData(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load message templates.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error && !data) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  const connections = data?.connections ?? {};
  const triggers: any[] = data?.triggers ?? [];

  const setMode = async (t: any, ch: 'whatsapp' | 'email', mode: string) => {
    const key = `${t.trigger}:${ch}`;
    setSavingKey(key);
    const next = { ...(t.channels ?? {}), [ch]: { ...(t.channels?.[ch] ?? {}), mode } };
    setData((d: any) => ({ ...d, triggers: d.triggers.map((x: any) => (x.trigger === t.trigger ? { ...x, channels: next } : x)) }));
    try { await api.messageRules.save(t.trigger, { whatsapp: next.whatsapp, email: next.email }); }
    catch (e) { await load(); }
    finally { setSavingKey(null); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.navTitle}>Message templates</Text>
      </View>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Choose what goes out for each moment, and on which channel.</Text>
        <View style={styles.connRow}>
          {CH.map((c) => { const on = connections[c.conn] === 'CONNECTED' || connections[c.conn]?.connected; return (
            <View key={c.key} style={styles.connChip}><Icon name={c.icon} size={13} color={on ? '#127650' : colors.muted} /><Text style={[styles.connText, { color: on ? '#127650' : colors.muted }]}>{c.label} {on ? 'own' : 'Bimayantra'}</Text></View>
          ); })}
        </View>

        {triggers.length ? triggers.map((t) => (
          <View key={t.trigger} style={styles.card}>
            <Text style={styles.triggerTitle}>{t.label ?? t.trigger}</Text>
            {CH.map((c) => {
              const mode = t.channels?.[c.key]?.mode ?? 'OFF';
              const key = `${t.trigger}:${c.key}`;
              return (
                <View key={c.key} style={styles.chRow}>
                  <Icon name={c.icon} size={16} color={colors.muted2} />
                  <Text style={styles.chLabel}>{c.label}</Text>
                  <View style={styles.seg}>
                    {MODES.map((m) => { const sel = m.key === mode; return (
                      <Pressable key={m.key} style={[styles.segBtn, sel && styles.segBtnOn]} disabled={savingKey === key} onPress={() => setMode(t, c.key, m.key)}><Text style={[styles.segText, { color: sel ? colors.onPrimary : colors.muted3 }]}>{m.label}</Text></Pressable>
                    ); })}
                  </View>
                </View>
              );
            })}
          </View>
        )) : <EmptyState icon="mail" title="No triggers" subtitle="Message moments will appear here." />}
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
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  intro: { fontSize: 13, lineHeight: 19, fontFamily: family.medium, color: colors.muted },
  connRow: { flexDirection: 'row', gap: 8 },
  connChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  connText: { fontSize: 12, fontFamily: family.semibold },
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 14, gap: 12 },
  triggerTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  chRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chLabel: { width: 72, fontSize: 13, fontFamily: family.semibold, color: colors.text },
  seg: { flex: 1, flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 12, padding: 3, gap: 2 },
  segBtn: { flex: 1, paddingVertical: 7, borderRadius: 9, alignItems: 'center' },
  segBtnOn: { backgroundColor: colors.navy },
  segText: { fontSize: 11, fontFamily: family.semibold },
});
