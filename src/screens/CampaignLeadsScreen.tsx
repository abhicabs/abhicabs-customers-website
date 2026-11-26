import React, { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { StatusChip, Avatar } from '../components/leads';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { relativeTime } from '../lib/format';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CampaignLead, LeadStatus } from '../api/types';

type R = RouteProp<AppStackParamList, 'CampaignLeads'>;

function answerRows(a: any): { label: string; value: string }[] {
  if (!a) return [];
  const src = Array.isArray(a) ? a : Array.isArray(a.answers) ? a.answers : Array.isArray(a.fields) ? a.fields : a.answers ?? a;
  if (Array.isArray(src)) return src.map((x: any) => ({ label: String(x.label ?? x.question ?? x.key ?? ''), value: String(x.value ?? x.answer ?? '') })).filter((x) => x.label);
  if (src && typeof src === 'object') return Object.entries(src).map(([k, v]) => ({ label: k, value: String(v) }));
  return [];
}

export function CampaignLeadsScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [leads, setLeads] = useState<CampaignLead[]>([]);
  const [answers, setAnswers] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.campaigns.leads(params.id);
      setLeads(data);
      if (data[0]?.leadId) {
        api.campaigns.leadAnswers(data[0].leadId).then((r) => setAnswers(answerRows(r.data))).catch(() => setAnswers([]));
      }
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load campaign leads.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const contact = (mobile: string, wa?: boolean) => {
    const num = mobile.replace(/[^\d+]/g, '');
    Linking.openURL(wa ? `https://wa.me/${num.replace('+', '')}` : `tel:${num}`).catch(() => undefined);
  };

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  const first = leads[0];
  const rest = leads.slice(1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle} numberOfLines={1}>{params.name ?? 'Campaign'}</Text>
          <Text style={styles.navSub}>{leads.length} lead{leads.length === 1 ? '' : 's'}</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {first ? (
          <View style={styles.card}>
            <View style={styles.firstHead}>
              <Avatar name={first.name} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{first.name}</Text>
                <Text style={styles.sub}>{relativeTime(first.at)}</Text>
              </View>
              <StatusChip status={first.leadStatus as LeadStatus} />
            </View>
            {answers.length ? (
              <View style={styles.answers}>
                <Text style={styles.answersLabel}>FORM ANSWERS</Text>
                {answers.slice(0, 8).map((a, i) => (
                  <View key={i} style={styles.ansRow}>
                    <Text style={styles.ansKey} numberOfLines={1}>{a.label}</Text>
                    <Text style={styles.ansVal} numberOfLines={1}>{a.value}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <View style={styles.actions}>
              <Pressable style={styles.actGhost} onPress={() => contact(first.mobile)}><Icon name="phone" size={16} color={colors.text} /><Text style={styles.actGhostText}>Call</Text></Pressable>
              <Pressable style={styles.actGhost} onPress={() => contact(first.mobile, true)}><Icon name="message-circle" size={16} color={colors.text} /><Text style={styles.actGhostText}>WhatsApp</Text></Pressable>
              <Pressable style={[styles.actNavy, shadow.button]} onPress={() => navigation.navigate('LeadDetail', { id: first.leadId, name: first.name })}><Icon name="arrow-right" size={16} color={colors.onPrimary} /><Text style={styles.actNavyText}>Open lead</Text></Pressable>
            </View>
          </View>
        ) : <EmptyState icon="inbox" title="No leads yet" subtitle="Leads from this campaign appear here." />}

        {rest.length ? (
          <>
            <Text style={styles.sectionLabel}>OTHER LEADS</Text>
            {rest.map((l) => (
              <Pressable key={l.submissionId} style={styles.row} onPress={() => navigation.navigate('LeadDetail', { id: l.leadId, name: l.name })}>
                <Avatar name={l.name} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName} numberOfLines={1}>{l.name}</Text>
                  <Text style={styles.rowSub}>{relativeTime(l.at)}</Text>
                </View>
                {l.linkedToExisting ? (
                  <View style={styles.linked}><Text style={styles.linkedText}>Linked to existing</Text></View>
                ) : (
                  <StatusChip status={l.leadStatus as LeadStatus} />
                )}
              </Pressable>
            ))}
          </>
        ) : null}
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
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 14 },
  firstHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontSize: 15, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  answers: { gap: 8 },
  answersLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  ansRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ansKey: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.muted },
  ansVal: { flex: 1.2, textAlign: 'right', fontSize: 13, fontFamily: family.bold, color: colors.text },
  actions: { flexDirection: 'row', gap: 8 },
  actGhost: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, backgroundColor: colors.bg, borderRadius: 18 },
  actGhostText: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  actNavy: { flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, backgroundColor: colors.navy, borderRadius: 18 },
  actNavyText: { fontSize: 13, fontFamily: family.semibold, color: colors.onPrimary },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: 18, padding: 12 },
  rowName: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  rowSub: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  linked: { backgroundColor: '#fbf1e1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 },
  linkedText: { fontSize: 11, fontFamily: family.semibold, color: '#8a5a12' },
});
