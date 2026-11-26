import React, { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { pickAndUpload } from '../lib/upload';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { PolicyDetail } from '../api/types';

type R = RouteProp<AppStackParamList, 'RecordIssued'>;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmt = (s: string) => { const d = new Date(s); return `${pad(d.getDate())} ${MO[d.getMonth()]} ${d.getFullYear()}`; };
function issueDates() { const now = new Date(); return [0, 1, 2, 3].map((sub) => { const x = new Date(now); x.setDate(now.getDate() - sub); return { label: sub === 0 ? `Today · ${fmt(iso(x))}` : fmt(iso(x)), value: iso(x) }; }); }
function startDates() { const now = new Date(); return [0, 1, 7].map((add) => { const x = new Date(now); x.setDate(now.getDate() + add); return { label: add === 0 ? `Today · ${fmt(iso(x))}` : fmt(iso(x)), value: iso(x) }; }); }
function termOptions(startISO: string) { const s = new Date(startISO); return [1, 2, 3].map((y) => { const e = new Date(s); e.setFullYear(s.getFullYear() + y); e.setDate(e.getDate() - 1); return { label: `${y} year${y > 1 ? 's' : ''} · ends ${fmt(iso(e))}`, value: iso(e) }; }); }

export function RecordIssuedScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [pol, setPol] = useState<PolicyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [docFile, setDocFile] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const idem = useRef(newIdempotencyKey());

  const [policyNumber, setPolicyNumber] = useState('');
  const [issueLabel, setIssueLabel] = useState(issueDates()[0].label);
  const [issueValue, setIssueValue] = useState(issueDates()[0].value);
  const [startLabel, setStartLabel] = useState(startDates()[0].label);
  const [startValue, setStartValue] = useState(startDates()[0].value);
  const [endLabel, setEndLabel] = useState('');
  const [endValue, setEndValue] = useState('');
  const [premium, setPremium] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.policies.get(params.id);
      setPol(data);
      if (data.premium) setPremium(String(data.premium));
      if (data.startDate) { setStartValue(data.startDate); setStartLabel(fmt(data.startDate)); }
      if (data.endDate) { setEndValue(data.endDate); setEndLabel(fmt(data.endDate)); }
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this policy.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });

  const save = async () => {
    if (!pol) return;
    if (!policyNumber.trim()) { setError('Enter the insurer policy number.'); return; }
    if (!endValue) { setError('Choose the policy end date.'); return; }
    const prem = Number(premium);
    if (!prem) { setError('Enter the premium.'); return; }
    setError(null); setSaving(true);
    try {
      const { data } = await api.policies.issue(pol.id, {
        documentFileId: docFile?.id,
        version: (pol as any).version ?? 0,
        policyNumber: policyNumber.trim(),
        issueDate: issueValue,
        startDate: startValue,
        endDate: endValue,
        frequency: pol.frequency || 'Yearly',
        sumInsured: pol.sumInsured ?? 0,
        premium: prem,
      }, { idempotencyKey: idem.current });
      navigation.replace('PolicyDetail', { id: data.id });
    } catch (e) {
      idem.current = newIdempotencyKey();
      setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not record the policy.');
    } finally { setSaving(false); }
  };

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error && !pol) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Record issued policy</Text>
          <Text style={styles.navSub} numberOfLines={1}>{[pol?.policyNumber, pol?.productName].filter(Boolean).join(' · ')}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label="Insurer policy number *">
            <TextInput value={policyNumber} onChangeText={(t) => { setPolicyNumber(t); if (error) setError(null); }} placeholder="Policy number" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} autoFocus />
          </Field>
          <Field label="Issue date *">
            <Dropdown value={issueLabel} placeholder="Issue date" options={issueDates()} onSelect={(o: any) => { setIssueLabel(o.label); setIssueValue(o.value); }} />
          </Field>
          <View style={styles.row2}>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={styles.label}>Start *</Text>
              <Dropdown value={startLabel} placeholder="Start" options={startDates()} onSelect={(o: any) => { setStartLabel(o.label); setStartValue(o.value); setEndLabel(''); setEndValue(''); }} />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={styles.label}>End *</Text>
              <Dropdown value={endLabel ? endLabel.split(' · ')[0] : ''} placeholder="Term" options={termOptions(startValue)} onSelect={(o: any) => { setEndLabel(o.label); setEndValue(o.value); }} />
            </View>
          </View>
          <Field label="Premium *">
            <View style={styles.amountInput}>
              <Text style={styles.cur}>₹</Text>
              <TextInput value={premium} onChangeText={(t) => setPremium(t.replace(/[^\d]/g, ''))} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.muted} style={styles.amountField} selectionColor={colors.blue} />
            </View>
          </Field>
          <Pressable style={styles.upload} onPress={async () => { try { const f = await pickAndUpload('POLICY_DOCUMENT'); if (f) setDocFile(f); } catch { /* */ } }}>
            <Icon name="upload" size={16} color={colors.blue} />
            <Text style={styles.uploadText}>{docFile ? docFile.name : 'Upload policy document'}</Text>
          </Pressable>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={[styles.save, shadow.button, saving && { opacity: 0.6 }]} disabled={saving} onPress={save}>
            <Icon name="check" size={18} color={colors.onPrimary} />
            <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save policy'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
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
  body: { padding: 16, gap: 16, paddingBottom: 24 },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { height: 50, backgroundColor: colors.bg, borderRadius: 16, borderWidth: 2, borderColor: colors.blue, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  row2: { flexDirection: 'row', gap: 10 },
  amountInput: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16 },
  cur: { fontSize: 15, fontFamily: family.bold, color: colors.text },
  amountField: { flex: 1, fontSize: 15, fontFamily: family.bold, color: colors.text, padding: 0 },
  upload: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, borderColor: colors.blue, borderStyle: 'dashed', paddingVertical: 14 },
  uploadText: { fontSize: 13, fontFamily: family.bold, color: colors.blue },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  save: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
