import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/form';
import { api } from '../api/endpoints';
import { dobToIso } from '../lib/validate';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'FamilyMemberForm'>;
const GENDERS = [{ label: 'Male', value: 'MALE' }, { label: 'Female', value: 'FEMALE' }, { label: 'Other', value: 'PREFER_NOT_TO_SAY' }];
const FALLBACK_REL = ['Son', 'Daughter', 'Spouse', 'Father', 'Mother', 'Other'];
const toIso = (s: string) => { const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined; };
const fromIso = (s?: string | null) => { if (!s) return ''; const d = new Date(s); return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`; };

export function FamilyMemberFormScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const editing = !!params.memberId;
  const [name, setName] = useState(params.member?.name ?? '');
  const [rel, setRel] = useState(params.member?.relationship ?? '');
  const [genderLabel, setGenderLabel] = useState(GENDERS.find((g) => g.value === params.member?.gender)?.label ?? '');
  const [gender, setGender] = useState<string | undefined>(params.member?.gender);
  const [dob, setDob] = useState(fromIso(params.member?.dob));
  const [mobile, setMobile] = useState((params.member?.mobile ?? '').replace('+91', '').replace(/\D/g, ''));
  const [nominee, setNominee] = useState(false);
  const [rels, setRels] = useState<string[]>(FALLBACK_REL);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());

  useEffect(() => { api.reference.get().then((r) => { const rl = (r.data as any).relationships; if (Array.isArray(rl) && rl.length) setRels(rl); }).catch(() => undefined); }, []);

  const save = async () => {
    if (!name.trim()) { setError('Enter the name.'); return; }
    if (!rel) { setError('Choose a relationship.'); return; }
    const { iso, error: dobErr } = dobToIso(dob);
    if (dobErr) { setError(dobErr); return; }
    setBusy(true); setError(null);
    const body = { name: name.trim(), relationship: rel, dob: iso, gender, mobile: mobile ? `+91${mobile}` : undefined };
    try {
      if (editing) await api.customers.updateFamily(params.customerId, params.memberId!, { version: params.member!.version, ...body });
      else await api.customers.addFamily(params.customerId, body, { idempotencyKey: idem.current });
      if (nominee) {
        try { const { data } = await api.customers.get(params.customerId); await api.customers.setDefaultNominee(params.customerId, { version: (data as any).version, nominee: { name: name.trim(), relationship: rel, dob: iso } }); } catch { /* best-effort */ }
      }
      navigation.goBack();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not save the member.'); setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.navTitle}>{editing ? 'Edit member' : 'Add family member'}</Text>
      </View>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label="Full name *"><View style={[styles.input, styles.inputActive]}><TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={colors.muted} style={styles.inputField} selectionColor={colors.blue} autoFocus={!editing} /></View></Field>
          <View style={styles.row2}>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Relationship *</Text><Dropdown value={rel} placeholder="Relationship" options={rels.map((r) => ({ label: r }))} onSelect={(o: any) => setRel(o.label)} /></View>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Gender</Text><Dropdown value={genderLabel} placeholder="Gender" options={GENDERS} onSelect={(o: any) => { setGenderLabel(o.label); setGender(o.value); }} /></View>
          </View>
          <View style={{ gap: 8 }}>
            <Text style={styles.label}>Date of birth *</Text>
            <DateField value={dob} onChange={setDob} />
            <Text style={styles.hint}>Needed for quotations</Text>
          </View>
          <Field label="Mobile">
            <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}><Text style={styles.cur}>+91</Text><TextInput value={mobile} onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))} keyboardType="number-pad" placeholder="Optional" placeholderTextColor={colors.muted} style={styles.inputField} selectionColor={colors.blue} /></View>
          </Field>

          <Pressable style={styles.nomRow} onPress={() => setNominee((n) => !n)}>
            <View style={[styles.check, nominee && styles.checkOn]}>{nominee ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nomTitle}>Make default nominee</Text>
              <Text style={styles.nomSub}>Replaces the current default</Text>
            </View>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.footer}>
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
            <Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Saving…' : 'Save member'}</Text>
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
  input: { minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, borderWidth: 2, borderColor: 'transparent', paddingHorizontal: 16, justifyContent: 'center' },
  inputActive: { borderColor: colors.blue },
  inputField: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 },
  cur: { fontSize: 14, fontFamily: family.semibold, color: colors.muted },
  hint: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  row2: { flexDirection: 'row', gap: 10 },
  nomRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 14, padding: 12 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  nomTitle: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  nomSub: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
