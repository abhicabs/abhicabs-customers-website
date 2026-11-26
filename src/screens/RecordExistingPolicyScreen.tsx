import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'RecordExistingPolicy'>;
const FREQ = [{ label: 'Single', value: 'Single' }, { label: 'Yearly', value: 'Yearly' }, { label: 'Half-yearly', value: 'Half-yearly' }, { label: 'Quarterly', value: 'Quarterly' }, { label: 'Monthly', value: 'Monthly' }];
const SI = [{ label: '₹5 lakh', value: 500000 }, { label: '₹10 lakh', value: 1000000 }, { label: '₹25 lakh', value: 2500000 }, { label: '₹50 lakh', value: 5000000 }, { label: '₹1 crore', value: 10000000 }];
const toIso = (s: string) => { const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined; };

export function RecordExistingPolicyScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
  const [insurers, setInsurers] = useState<{ id: string; name: string }[]>([]);
  const [typeId, setTypeId] = useState<string | null>(null);
  const [typeLabel, setTypeLabel] = useState('');
  const [insurerId, setInsurerId] = useState<string | null>(null);
  const [insurerLabel, setInsurerLabel] = useState('');
  const [productName, setProductName] = useState('');
  const [number, setNumber] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [premium, setPremium] = useState('');
  const [siLabel, setSiLabel] = useState('');
  const [sumInsured, setSumInsured] = useState<number | null>(null);
  const [freqLabel, setFreqLabel] = useState('Yearly');
  const [frequency, setFrequency] = useState('Yearly');
  const [soldByMe, setSoldByMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());

  useEffect(() => { api.quotations.choices().then((r) => setTypes(r.data.types)).catch(() => undefined); }, []);
  useEffect(() => { if (typeId) api.quotations.choices({ typeId }).then((r) => setInsurers(r.data.insurers)).catch(() => undefined); }, [typeId]);

  const save = async () => {
    if (!typeId) { setError('Choose the type.'); return; }
    if (!insurerId) { setError('Choose the insurer.'); return; }
    if (!number.trim()) { setError('Enter the policy number.'); return; }
    const si = toIso(start), ei = toIso(end);
    if (!si || !ei) { setError('Enter start and end dates as DD-MM-YYYY.'); return; }
    setBusy(true); setError(null);
    try {
      await api.policies.recordExisting({
        customerId: params.customerId, typeId, insurerId, productName: productName.trim() || undefined,
        policyNumber: number.trim(), startDate: si, endDate: ei, premium: Number(premium) || undefined, sumInsured: sumInsured ?? undefined,
        frequency, soldByMe, insured: [`C:${params.customerId}`],
      }, { idempotencyKey: idem.current });
      navigation.goBack();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not record the policy.'); setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}><Text style={styles.navTitle}>Record existing policy</Text>{params.customerName ? <Text style={styles.navSub} numberOfLines={1}>{params.customerName}</Text> : null}</View>
      </View>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label="Type *"><Dropdown value={typeLabel} placeholder="Insurance type" options={types.map((t) => ({ label: t.name, id: t.id }))} onSelect={(o: any) => { setTypeLabel(o.label); setTypeId(o.id); setInsurerId(null); setInsurerLabel(''); }} /></Field>
          <Field label="Insurer *"><Dropdown value={insurerLabel} placeholder="Insurer" options={insurers.map((i) => ({ label: i.name, id: i.id }))} onSelect={(o: any) => { setInsurerLabel(o.label); setInsurerId(o.id); }} /></Field>
          <Field label="Product"><TextInput value={productName} onChangeText={setProductName} placeholder="Product name (optional)" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></Field>
          <Field label="Policy number *"><TextInput value={number} onChangeText={setNumber} autoCapitalize="characters" placeholder="2245/88/26/0001842" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></Field>
          <View style={styles.row2}>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Start *</Text><View style={[styles.input, styles.rowInput]}><TextInput value={start} onChangeText={setStart} placeholder="DD-MM-YYYY" placeholderTextColor={colors.muted} keyboardType="numbers-and-punctuation" style={styles.field} selectionColor={colors.blue} /></View></View>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>End *</Text><View style={[styles.input, styles.rowInput]}><TextInput value={end} onChangeText={setEnd} placeholder="DD-MM-YYYY" placeholderTextColor={colors.muted} keyboardType="numbers-and-punctuation" style={styles.field} selectionColor={colors.blue} /></View></View>
          </View>
          <View style={styles.row2}>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Premium</Text><View style={[styles.input, styles.rowInput]}><Text style={styles.cur}>₹</Text><TextInput value={premium} onChangeText={(t) => setPremium(t.replace(/[^\d]/g, ''))} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.muted} style={styles.field} selectionColor={colors.blue} /></View></View>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Frequency</Text><Dropdown value={freqLabel} placeholder="Frequency" options={FREQ} onSelect={(o: any) => { setFreqLabel(o.label); setFrequency(o.value); }} /></View>
          </View>
          <Field label="Sum insured"><Dropdown value={siLabel} placeholder="Cover" options={SI} onSelect={(o: any) => { setSiLabel(o.label); setSumInsured(o.value); }} /></Field>
          <Pressable style={styles.soldRow} onPress={() => setSoldByMe((v) => !v)}>
            <View style={[styles.check, soldByMe && styles.checkOn]}>{soldByMe ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
            <Text style={styles.soldText}>I sold this policy</Text>
          </Pressable>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.footer}>
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}><Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Saving…' : 'Record policy'}</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={{ gap: 8 }}><Text style={styles.label}>{label}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { padding: 16, gap: 12, paddingBottom: 24 },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text, justifyContent: 'center' },
  rowInput: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  field: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 },
  cur: { fontSize: 14, fontFamily: family.semibold, color: colors.muted },
  row2: { flexDirection: 'row', gap: 10 },
  soldRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f3f7ff', borderRadius: 14, padding: 12 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  soldText: { flex: 1, fontSize: 13, fontFamily: family.bold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
