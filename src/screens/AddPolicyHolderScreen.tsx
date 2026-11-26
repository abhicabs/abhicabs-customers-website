import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/form';
import { api } from '../api/endpoints';
import { dobToIso } from '../lib/validate';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';

const GENDERS = [{ label: 'Male', value: 'MALE' }, { label: 'Female', value: 'FEMALE' }, { label: 'Other', value: 'PREFER_NOT_TO_SAY' }];
const toIso = (s: string) => { const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined; };

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

export function AddPolicyHolderScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [genderLabel, setGenderLabel] = useState('');
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [consent, setConsent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());

  const save = async () => {
    if (!name.trim()) { setError('Enter the full name.'); return; }
    if (mobile.length !== 10) { setError('Enter a 10-digit mobile.'); return; }
    if (!/^[6-9]/.test(mobile)) { setError('Mobile should start with 6-9.'); return; }
    if (email.trim() && !isEmail(email)) { setError('Enter a valid email.'); return; }
    const { iso, error: dobErr } = dobToIso(dob);
    if (dobErr) { setError(dobErr); return; }
    setBusy(true); setError(null);
    try {
      const { data } = await api.customers.create({
        name: name.trim(), mobile: `+91${mobile}`, dob: iso, gender, email: email.trim() || undefined, city: city.trim() || undefined, personalDataConsent: consent,
      }, { idempotencyKey: idem.current });
      const cid = data?.id ?? data?.customer?.id;
      if (cid) navigation.replace('PolicyHolderDetail', { id: cid, name: name.trim() });
      else navigation.goBack();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not save the policy holder.'); setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.navTitle}>New policy holder</Text>
      </View>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label="Full name *"><TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} autoFocus /></Field>
          <Field label="Primary mobile *">
            <View style={[styles.input, styles.rowInput]}><Text style={styles.cur}>+91</Text><TextInput value={mobile} onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))} keyboardType="number-pad" placeholder="98450 00000" placeholderTextColor={colors.muted} style={styles.field} selectionColor={colors.blue} /></View>
          </Field>
          <View style={styles.row2}>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={styles.label}>Date of birth *</Text>
              <DateField value={dob} onChange={setDob} />
            </View>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Gender</Text><Dropdown value={genderLabel} placeholder="Gender" options={GENDERS} onSelect={(o: any) => { setGenderLabel(o.label); setGender(o.value); }} /></View>
          </View>
          <Field label="Email"><View style={[styles.input, styles.rowInput]}><Icon name="mail" size={18} color={colors.muted} /><TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="name@email.in" placeholderTextColor={colors.muted} style={styles.field} selectionColor={colors.blue} /></View></Field>
          <Field label="City"><TextInput value={city} onChangeText={setCity} placeholder="City" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></Field>

          <Pressable style={styles.consentRow} onPress={() => setConsent((c) => !c)}>
            <View style={[styles.check, consent && styles.checkOn]}>{consent ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
            <View style={{ flex: 1 }}><Text style={styles.consentTitle}>Personal-data consent given</Text><Text style={styles.consentSub}>Proof can be added later</Text></View>
          </Pressable>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.footer}>
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
            <Icon name="user-plus" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Saving…' : 'Save policy holder'}</Text>
          </Pressable>
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
  body: { padding: 16, gap: 12, paddingBottom: 24 },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text, justifyContent: 'center' },
  rowInput: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  field: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 },
  cur: { fontSize: 14, fontFamily: family.semibold, color: colors.muted },
  row2: { flexDirection: 'row', gap: 10 },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f3f7ff', borderRadius: 14, padding: 12 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  consentTitle: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  consentSub: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
