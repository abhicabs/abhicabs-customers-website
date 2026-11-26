import React, { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { DateField } from '../components/DateField';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'CorrectPolicy'>;
const toIso = (s: string) => { const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined; };
const fromIso = (s?: string | null) => { if (!s) return ''; const d = new Date(s); return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`; };

export function CorrectPolicyScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [pol, setPol] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const idem = useRef(newIdempotencyKey());

  const [reason, setReason] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [premium, setPremium] = useState('');
  const [sumInsured, setSumInsured] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.policies.get(params.id); setPol(data);
      setPolicyNumber(data.policyNumber ?? ''); setStartDate(fromIso(data.startDate)); setEndDate(fromIso(data.endDate));
      setPremium(data.premium != null ? String(data.premium) : ''); setSumInsured(data.sumInsured != null ? String(data.sumInsured) : '');
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load the policy.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !pol) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const save = async () => {
    if (!reason.trim()) { setError('Add a reason for the correction.'); return; }
    const changes: any = {};
    if (policyNumber.trim() && policyNumber.trim() !== pol.policyNumber) changes.policyNumber = policyNumber.trim();
    if (startDate && toIso(startDate) !== pol.startDate) changes.startDate = toIso(startDate);
    if (endDate && toIso(endDate) !== pol.endDate) changes.endDate = toIso(endDate);
    if (premium && Number(premium) !== pol.premium) changes.premium = Number(premium);
    if (sumInsured && Number(sumInsured) !== pol.sumInsured) changes.sumInsured = Number(sumInsured);
    if (!Object.keys(changes).length) { setError('Change at least one value.'); return; }
    setBusy(true); setError(null);
    try { await api.policies.correct(params.id, { version: pol.version, reason: reason.trim(), changes }, { idempotencyKey: idem.current }); navigation.goBack(); }
    catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not save the correction.'); setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}><Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable><Text style={styles.navTitle}>Correct policy details</Text></View>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.note}><Icon name="alert-circle" size={16} color={colors.blue} /><Text style={styles.noteText}>Corrections are logged. Change only what the insurer confirmed.</Text></View>
          <Field label="Reason *"><TextInput value={reason} onChangeText={setReason} placeholder="e.g. Insurer corrected the end date" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></Field>
          <Field label="Policy number"><TextInput value={policyNumber} onChangeText={setPolicyNumber} autoCapitalize="characters" style={styles.input} selectionColor={colors.blue} /></Field>
          <View style={styles.row2}>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Start date</Text><DateField value={startDate} onChange={setStartDate} /></View>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>End date</Text><DateField value={endDate} onChange={setEndDate} /></View>
          </View>
          <View style={styles.row2}>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Premium</Text><View style={[styles.input, styles.rowInput]}><Text style={styles.cur}>₹</Text><TextInput value={premium} onChangeText={(t) => setPremium(t.replace(/[^\d]/g, ''))} keyboardType="number-pad" style={styles.field} selectionColor={colors.blue} /></View></View>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Sum insured</Text><View style={[styles.input, styles.rowInput]}><Text style={styles.cur}>₹</Text><TextInput value={sumInsured} onChangeText={(t) => setSumInsured(t.replace(/[^\d]/g, ''))} keyboardType="number-pad" style={styles.field} selectionColor={colors.blue} /></View></View>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.footer}><Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}><Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Saving…' : 'Save correction'}</Text></Pressable></View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) { return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <View style={{ gap: 8 }}><Text style={styles.label}>{label}</Text>{children}</View>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface }, flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }, navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  body: { padding: 16, gap: 12, paddingBottom: 24 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }, noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text, justifyContent: 'center' },
  rowInput: { flexDirection: 'row', alignItems: 'center', gap: 6 }, field: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 }, cur: { fontSize: 14, fontFamily: family.semibold, color: colors.muted },
  row2: { flexDirection: 'row', gap: 10 },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
