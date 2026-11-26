import React, { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/form';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { dobToIso } from '../lib/validate';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerDetail } from '../api/types';

type R = RouteProp<AppStackParamList, 'EditPolicyHolder'>;
const PREF = [{ label: 'WhatsApp', value: 'WHATSAPP' }, { label: 'Call', value: 'PHONE_CALL' }, { label: 'Email', value: 'EMAIL' }];
const toIso = (s: string) => { const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined; };
const fromIso = (s?: string | null) => { if (!s) return ''; const d = new Date(s); return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`; };

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

export function EditPolicyHolderScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [c, setC] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const idem = useRef(newIdempotencyKey());

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [prefLabel, setPrefLabel] = useState('');
  const [pref, setPref] = useState<string | undefined>(undefined);
  const [address, setAddress] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.customers.get(params.id);
      setC(data); setName(data.name); setMobile((data.mobile ?? '').replace('+91', '').replace(/\D/g, ''));
      setEmail(data.email ?? ''); setDob(fromIso((data as any).dob)); setAddress((data as any).address ?? (data as any).city ?? '');
      const pr = (data as any).preferredContact; if (pr) { setPref(pr); setPrefLabel(PREF.find((x) => x.value === pr)?.label ?? ''); }
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this policy holder.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !c) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const save = async () => {
    if (!name.trim()) { setSaveErr('Enter the full name.'); return; }
    if (mobile.length !== 10) { setSaveErr('Enter a 10-digit mobile.'); return; }
    if (!/^[6-9]/.test(mobile)) { setSaveErr('Mobile should start with 6-9.'); return; }
    if (email.trim() && !isEmail(email)) { setSaveErr('Enter a valid email.'); return; }
    if (dob.trim() && dobToIso(dob).error) { setSaveErr(dobToIso(dob).error!); return; }
    setBusy(true); setSaveErr(null);
    try {
      await api.customers.update(params.id, {
        version: (c as any).version, name: name.trim(), mobile: `+91${mobile}`,
        email: email.trim() || undefined, dob: dob.trim() ? dobToIso(dob).iso : undefined, preferredContact: pref, addressLine1: address.trim() || undefined,
      }, { idempotencyKey: idem.current });
      navigation.goBack();
    } catch (e) { idem.current = newIdempotencyKey(); setSaveErr(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not save changes.'); setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.navTitle}>Edit details</Text>
      </View>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label="Full name *"><TextInput value={name} onChangeText={setName} style={styles.input} selectionColor={colors.blue} placeholderTextColor={colors.muted} /></Field>
          <Field label="Primary mobile *">
            <View style={[styles.input, styles.rowInput, { borderWidth: 2, borderColor: colors.blue }]}><Text style={styles.cur}>+91</Text><TextInput value={mobile} onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))} keyboardType="number-pad" style={styles.field} selectionColor={colors.blue} /></View>
          </Field>
          <View style={styles.note}><Icon name="alert-circle" size={16} color="#8a5a12" /><Text style={styles.noteText}>Changing mobile or email resets message consent for that channel.</Text></View>
          <Field label="Email"><View style={[styles.input, styles.rowInput]}><Icon name="mail" size={18} color={colors.muted} /><TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="name@email" placeholderTextColor={colors.muted} style={styles.field} selectionColor={colors.blue} /></View></Field>
          <View style={styles.row2}>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Date of birth</Text><DateField value={dob} onChange={setDob} /></View>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Preferred</Text><Dropdown value={prefLabel} placeholder="Channel" options={PREF} onSelect={(o: any) => { setPrefLabel(o.label); setPref(o.value); }} /></View>
          </View>
          <Field label="Address"><TextInput value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor={colors.muted} style={[styles.input, { height: 96, textAlignVertical: 'top', paddingTop: 14 }]} multiline selectionColor={colors.blue} /></Field>
          {(saveErr ?? error) ? <Text style={styles.error}>{saveErr ?? error}</Text> : null}
        </ScrollView>
        <View style={styles.footer}>
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
            <Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Saving…' : 'Save changes'}</Text>
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
  body: { padding: 16, gap: 12, paddingBottom: 24 },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text, justifyContent: 'center' },
  rowInput: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  field: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 },
  cur: { fontSize: 14, fontFamily: family.semibold, color: colors.muted },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fbf1e1', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: '#8a5a12' },
  row2: { flexDirection: 'row', gap: 10 },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
