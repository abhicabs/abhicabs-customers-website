import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { LeadDetail } from '../api/types';

type R = RouteProp<AppStackParamList, 'EditLead'>;

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

export function EditLeadScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const idem = useRef(newIdempotencyKey());

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('');
  const [campaign, setCampaign] = useState('');
  const [pipelineLabel, setPipelineLabel] = useState('');
  const [pipelineId, setPipelineId] = useState<string | undefined>(undefined);
  const [sources, setSources] = useState<string[]>([]);
  const [pipelines, setPipelines] = useState<{ id: string; name: string }[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.leads.get(params.id);
      setLead(data); setName(data.name); setMobile(data.mobile.replace('+91', '').replace(/\D/g, ''));
      setEmail(data.email ?? ''); setSource(data.source ?? ''); setCampaign(data.campaign ?? '');
      setPipelineLabel((data as any).pipeline ?? ''); setPipelineId((data as any).pipelineId);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this lead.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    api.reference.get().then((r) => setSources(r.data.leadSources ?? [])).catch(() => undefined);
    api.pipelines.list().then((r) => setPipelines(r.data)).catch(() => undefined);
  }, []);

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !lead) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const save = async () => {
    if (!name.trim()) { setSaveErr('Enter the lead name.'); return; }
    if (mobile.length !== 10) { setSaveErr('Enter a 10-digit mobile.'); return; }
    if (!/^[6-9]/.test(mobile)) { setSaveErr('Mobile should start with 6-9.'); return; }
    if (email.trim() && !isEmail(email)) { setSaveErr('Enter a valid email.'); return; }
    setBusy(true); setSaveErr(null);
    try {
      await api.leads.update(params.id, {
        version: lead.version, name: name.trim(), mobile: `+91${mobile}`, email: email.trim() || undefined,
        source: source || undefined, campaign: campaign.trim() || undefined,
      }, { idempotencyKey: idem.current });
      navigation.goBack();
    } catch (e) { idem.current = newIdempotencyKey(); setSaveErr(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not save changes.'); setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.navTitle}>Edit lead</Text>
      </View>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label="Lead name *"><TextInput value={name} onChangeText={setName} style={styles.input} selectionColor={colors.blue} placeholderTextColor={colors.muted} /></Field>
          <Field label="Primary mobile *">
            <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}><Text style={styles.cur}>+91</Text>
              <TextInput value={mobile} onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))} keyboardType="number-pad" style={{ flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text }} selectionColor={colors.blue} /></View>
          </Field>
          <Field label="Email">
            <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}><Icon name="mail" size={18} color={colors.muted} />
              <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="name@email" placeholderTextColor={colors.muted} style={{ flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text }} selectionColor={colors.blue} /></View>
          </Field>
          <Field label="Lead source *"><Dropdown value={source} placeholder="Source" options={sources.map((s) => ({ label: s }))} onSelect={(o: any) => setSource(o.label)} /></Field>
          <Field label="Ad or campaign"><TextInput value={campaign} onChangeText={setCampaign} placeholder="Campaign" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></Field>
          <Field label="Pipeline"><Dropdown value={pipelineLabel} placeholder="Pipeline" options={pipelines.map((pp) => ({ label: pp.name, id: pp.id }))} onSelect={(o: any) => { setPipelineLabel(o.label); setPipelineId(o.id); }} /></Field>

          <View style={styles.note}><Icon name="alert-circle" size={16} color={colors.blue} /><Text style={styles.noteText}>Changing the source keeps the earlier value in history.</Text></View>
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
  cur: { fontSize: 14, fontFamily: family.semibold, color: colors.muted },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
