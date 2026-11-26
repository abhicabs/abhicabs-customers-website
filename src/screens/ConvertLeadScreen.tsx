import React, { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { dobToIso } from '../lib/validate';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { LeadDetail } from '../api/types';

type R = RouteProp<AppStackParamList, 'ConvertLead'>;
const GENDERS = [{ label: 'Male', value: 'MALE' }, { label: 'Female', value: 'FEMALE' }, { label: 'Other', value: 'PREFER_NOT_TO_SAY' }];
const toIso = (s: string) => { const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined; };

export function ConvertLeadScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'CREATE' | 'LINK'>('CREATE');
  const [dob, setDob] = useState('');
  const [genderLabel, setGenderLabel] = useState('');
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [city, setCity] = useState('');
  const [busy, setBusy] = useState(false);
  const idem = useRef(newIdempotencyKey());

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.leads.get(params.id); setLead(data); if ((data as any).city) setCity((data as any).city); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this lead.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !lead) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const dup: any = (lead as any).duplicateCustomer ?? (lead as any).possibleCustomer ?? null;

  const save = async () => {
    setBusy(true); setError(null);
    try {
      const body: any = { version: lead.version, mode };
      if (mode === 'LINK') body.customerId = dup?.id;
      else { if (dob.trim() && dobToIso(dob).error) { setError(dobToIso(dob).error!); return; } body.customer = { dob: dob.trim() ? dobToIso(dob).iso : undefined, gender, city: city.trim() || undefined }; }
      const { data } = await api.leads.convert(params.id, body, { idempotencyKey: idem.current });
      const cid = data?.customer?.id ?? data?.customerId ?? data?.id;
      if (cid) navigation.replace('PolicyHolderDetail', { id: cid, name: lead.name });
      else navigation.goBack();
    } catch (e) {
      idem.current = newIdempotencyKey();
      setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not convert this lead.');
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Convert lead</Text>
          <Text style={styles.navSub} numberOfLines={1}>{lead.name}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {dup ? (
            <View style={styles.note}>
              <Icon name="alert-triangle" size={16} color="#8a5a12" />
              <Text style={styles.noteText}>{dup.name} ({dup.number}) uses this mobile.</Text>
            </View>
          ) : null}

          <Pressable style={[styles.opt, mode === 'CREATE' && styles.optOn]} onPress={() => setMode('CREATE')}>
            <View style={[styles.radio, mode === 'CREATE' && styles.radioOn]}>{mode === 'CREATE' ? <View style={styles.radioDot} /> : null}</View>
            <View style={{ flex: 1 }}><Text style={styles.optTitle}>Create a new policy holder</Text><Text style={styles.optSub}>{lead.name.split(' ')[0]} gets their own record</Text></View>
          </Pressable>
          {dup ? (
            <Pressable style={[styles.opt, mode === 'LINK' && styles.optOn]} onPress={() => setMode('LINK')}>
              <View style={[styles.radio, mode === 'LINK' && styles.radioOn]}>{mode === 'LINK' ? <View style={styles.radioDot} /> : null}</View>
              <View style={{ flex: 1 }}><Text style={styles.optTitle}>Link to {dup.name}</Text><Text style={styles.optSub}>If it’s their record</Text></View>
            </Pressable>
          ) : null}

          {mode === 'CREATE' ? (
            <>
              <Field label="Full name *"><View style={styles.readonly}><Text style={styles.readonlyText}>{lead.name}</Text></View></Field>
              <View style={styles.row2}>
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={styles.label}>Date of birth</Text>
                  <View style={styles.input}><TextInput value={dob} onChangeText={setDob} placeholder="DD-MM-YYYY" placeholderTextColor={colors.muted} keyboardType="numbers-and-punctuation" style={styles.inputField} selectionColor={colors.blue} /></View>
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={styles.label}>Gender</Text>
                  <Dropdown value={genderLabel} placeholder="Gender" options={GENDERS} onSelect={(o: any) => { setGenderLabel(o.label); setGender(o.value); }} />
                </View>
              </View>
              <Field label="City"><View style={styles.input}><TextInput value={city} onChangeText={setCity} placeholder="City" placeholderTextColor={colors.muted} style={styles.inputField} selectionColor={colors.blue} /></View></Field>
            </>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
            <Icon name="user-plus" size={18} color={colors.onPrimary} />
            <Text style={styles.ctaText}>{busy ? 'Converting…' : 'Save policy holder'}</Text>
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
  body: { padding: 16, gap: 12, paddingBottom: 24 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fbf1e1', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: '#8a5a12' },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  optTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  optSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  readonly: { height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, justifyContent: 'center' },
  readonlyText: { fontSize: 14, fontFamily: family.semibold, color: colors.text },
  input: { height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, justifyContent: 'center' },
  inputField: { fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 },
  row2: { flexDirection: 'row', gap: 10 },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
