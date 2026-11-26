import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'MessageDetail'>;
const timeOf = (iso?: string | null) => { if (!iso) return '—'; const d = new Date(iso); let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${String(h).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')} ${ap}`; };
const stepStyle = (st: string): { icon: IconName; bg: string } => {
  const s = (st || '').toUpperCase();
  if (s.includes('QUEUE')) return { icon: 'check', bg: '#d9eafd' };
  if (s.includes('SENT') || s.includes('ACCEPT')) return { icon: 'send', bg: '#e9e3fc' };
  if (s.includes('DELIVER')) return { icon: 'mail', bg: '#fde8c9' };
  if (s.includes('READ') || s.includes('OPEN')) return { icon: 'eye', bg: '#d4f1e7' };
  if (s.includes('FAIL') || s.includes('BOUNCE')) return { icon: 'x', bg: '#fbebec' };
  if (s.includes('SKIP')) return { icon: 'alert-circle', bg: '#fbf1e1' };
  return { icon: 'clock', bg: '#eef1f5' };
};

export function MessageDetailScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [m, setM] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.communications.get(params.id); setM(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this message.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !m) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const events: any[] = Array.isArray(m.events) ? m.events : Array.isArray(m.timeline) ? m.timeline : (m.status ? [{ status: m.status, at: m.sentAt ?? m.at }] : []);
  const subtitle = [m.customerName ?? m.name, m.channel ? (m.channel === 'EMAIL' ? 'Email' : m.channel === 'SMS' ? 'SMS' : 'WhatsApp') : null, m.purposeLabel ?? m.purpose].filter(Boolean).join(' · ');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Message detail</Text>
          {subtitle ? <Text style={styles.navSub} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status</Text>
          {events.length ? events.map((e, i) => {
            const st = stepStyle(e.status ?? e.type ?? '');
            return (
              <View key={i} style={styles.step}>
                <View style={[styles.stepIcon, { backgroundColor: st.bg }]}><Icon name={st.icon} size={14} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle} numberOfLines={2}>{e.label ?? (e.status ? e.status.charAt(0) + e.status.slice(1).toLowerCase() : 'Status')}</Text>
                  <Text style={styles.stepTime}>{e.at ? timeOf(e.at) : '—'}</Text>
                </View>
              </View>
            );
          }) : <Text style={styles.muted}>No status events.</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Message</Text>
          {m.subject ? (
            <View style={styles.kv}><Text style={styles.kvLabel}>Subject</Text><Text style={styles.kvValue} numberOfLines={3}>{m.subject}</Text></View>
          ) : null}
          {m.body || m.preview || m.content ? <Text style={styles.bodyText}>{m.body ?? m.preview ?? m.content}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 10 },
  cardTitle: { fontSize: 16, fontFamily: family.bold, color: colors.text },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  stepTitle: { fontSize: 13, lineHeight: 18, fontFamily: family.bold, color: colors.text },
  stepTime: { fontSize: 11, fontFamily: family.medium, color: colors.muted },
  muted: { fontSize: 13, fontFamily: family.medium, color: colors.muted },
  kv: { flexDirection: 'row', gap: 8 },
  kvLabel: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.muted },
  kvValue: { flex: 2, textAlign: 'right', fontSize: 13, fontFamily: family.bold, color: colors.text },
  bodyText: { fontSize: 13, lineHeight: 20, fontFamily: family.medium, color: colors.muted },
});
