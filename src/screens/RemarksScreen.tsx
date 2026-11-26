import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { relativeTime } from '../lib/format';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'Remarks'>;
const OUTCOME: Record<string, { label: string; bg: string; fg: string; icon: IconName }> = {
  SPOKE_TO_CUSTOMER: { label: 'Answered', bg: '#e7f4ee', fg: '#127650', icon: 'phone' },
  ASKED_TO_CALL_BACK: { label: 'Call back', bg: '#fbf1e1', fg: '#8a5a12', icon: 'clock' },
  NOT_REACHABLE: { label: 'Not answered', bg: '#fbebec', fg: '#b4323c', icon: 'phone' },
};

export function RemarksScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.leads.timeline(params.id, 'CONTACT');
      const list = Array.isArray(data) ? data : data.items ?? data.events ?? data.timeline ?? [];
      setRows(list.filter((e: any) => e.outcome || /contact|remark|call/i.test(e.type ?? e.kind ?? '')));
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load remarks.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}><Text style={styles.navTitle}>Remarks</Text>{params.name ? <Text style={styles.navSub} numberOfLines={1}>{params.name}</Text> : null}</View>
      </View>

      {error ? <ErrorState message={error} onRetry={load} /> : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {loading ? <EmptyState icon="loader" title="Loading…" /> : rows.length ? rows.map((r, i) => {
            const oc = OUTCOME[(r.outcome ?? '').toUpperCase()] ?? { label: r.outcome ?? 'Note', bg: '#eef1f5', fg: '#44526a', icon: 'message-circle' as IconName };
            return (
              <View key={r.id ?? i} style={styles.item}>
                <View style={[styles.icon, { backgroundColor: oc.bg }]}><Icon name={oc.icon} size={16} color={oc.fg} /></View>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemHead}>
                    <Text style={styles.itemOutcome}>{oc.label}{r.channel ? ` · ${String(r.channel).toLowerCase()}` : ''}</Text>
                    <Text style={styles.itemTime}>{relativeTime(r.at ?? r.createdAt ?? new Date().toISOString())}</Text>
                  </View>
                  {r.note ? <Text style={styles.itemNote}>{r.note}</Text> : null}
                  {r.by ? <Text style={styles.itemBy}>by {r.by}</Text> : null}
                </View>
              </View>
            );
          }) : <EmptyState icon="message-circle" title="No remarks yet" subtitle="Log a contact to add the first remark." />}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Pressable style={[styles.cta, shadow.button]} onPress={() => navigation.navigate('LogContact', { id: params.id, name: params.name })}>
          <Icon name="plus" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>Log contact</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg }, flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text }, navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100, gap: 10 },
  item: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, borderRadius: 18, padding: 14 },
  icon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemHead: { flexDirection: 'row', alignItems: 'center' },
  itemOutcome: { flex: 1, fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemTime: { fontSize: 11, fontFamily: family.medium, color: colors.muted },
  itemNote: { fontSize: 13, lineHeight: 19, fontFamily: family.medium, color: colors.text2, marginTop: 3 },
  itemBy: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 4 },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
