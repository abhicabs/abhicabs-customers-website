import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { ProposalDetail } from '../api/types';

type R = RouteProp<AppStackParamList, 'ProposalDetail'>;
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');

export function ProposalDetailScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [pr, setPr] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.proposals.get(params.id); setPr(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this proposal.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !pr) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const rd = pr.readiness;
  const has = (field: string) => rd.problems.some((p) => p.field === field);
  const nominee = pr.nominees?.[0];
  const items = [
    { key: 'members', title: 'Members', sub: `${pr.members?.length ?? 0} from the quotation`, done: true },
    { key: 'declarations', title: 'Declarations', sub: has('declarations') ? 'Answers required' : `${pr.questions?.length ?? 0} questions answered`, done: !has('declarations') },
    { key: 'nominees', title: 'Nominees', sub: has('nominees') ? 'Add a nominee' : (nominee ? `${nominee.name} · ${nominee.share ?? 100}%` : 'Not set'), done: !has('nominees') },
    { key: 'kyc', title: 'KYC check', sub: rd.kyc ? 'Aadhaar and PAN confirmed' : 'Aadhaar and PAN needed', done: rd.kyc },
    { key: 'payment', title: 'Premium', sub: rd.paid ? `Paid · ${rd.paid.mode} · ${rupees(rd.paid.amount)}` : 'Payment pending', done: !!rd.paid },
  ];
  const ready = rd.problems.length === 0 && pr.status === 'DRAFT';

  const submit = async () => {
    if (!ready) { Alert.alert('Not ready', 'Complete every part before submitting.'); return; }
    setSubmitting(true);
    try {
      await api.proposals.submit(pr.id, pr.version, { idempotencyKey: newIdempotencyKey() });
      await load();
      Alert.alert('Submitted', 'Proposal marked submitted.');
    } catch (e) { Alert.alert('Could not submit', e instanceof ApiError ? e.message : 'Please try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle} numberOfLines={1}>{pr.number ?? 'Proposal'}</Text>
          <Text style={styles.navSub} numberOfLines={1}>{params.customerName ? `${params.customerName} · ` : ''}{pr.status.charAt(0) + pr.status.slice(1).toLowerCase()}</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Complete each part, then submit on the insurer portal.</Text>
        {items.map((it) => (
          <Pressable key={it.key} style={styles.row} onPress={() => soon(it.title)}>
            <View style={[styles.circle, it.done ? styles.circleDone : styles.circlePending]}>
              {it.done ? <Icon name="check" size={15} color={colors.onPrimary} /> : <Icon name="alert-circle" size={15} color={colors.amber} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{it.title}</Text>
              <Text style={styles.rowSub} numberOfLines={1}>{it.sub}</Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.grayBar} />
          </Pressable>
        ))}
        <View style={[styles.row, styles.rowCurrent]}>
          <View style={styles.circleNum}><Text style={styles.circleNumText}>6</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Review and submit</Text>
            <Text style={styles.rowSub}>Advisor only</Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.grayBar} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.submit, shadow.button, (!ready || submitting) && { opacity: 0.5 }]} disabled={!ready || submitting} onPress={submit}>
          <Icon name="send" size={18} color={colors.onPrimary} />
          <Text style={styles.submitText}>{submitting ? 'Submitting…' : pr.status !== 'DRAFT' ? 'Submitted' : 'Submit proposal'}</Text>
        </Pressable>
      </View>
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
  body: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24, gap: 10 },
  intro: { fontSize: 13, fontFamily: family.medium, color: colors.muted, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'transparent' },
  rowCurrent: { borderColor: colors.blue, backgroundColor: '#f3f7ff' },
  circle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  circleDone: { backgroundColor: colors.green },
  circlePending: { backgroundColor: '#fbf1e1' },
  circleNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  circleNumText: { fontSize: 13, fontFamily: family.bold, color: colors.muted2 },
  rowTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  rowSub: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  submit: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
