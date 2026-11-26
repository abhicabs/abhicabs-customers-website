import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { api } from '../api/endpoints';
import { pickAndUpload } from '../lib/upload';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'SuggestCorrection'>;

export function SuggestCorrectionScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [fields, setFields] = useState<any[]>([]);
  const [fieldLabel, setFieldLabel] = useState('');
  const [field, setField] = useState<string | null>(null);
  const [shownNow, setShownNow] = useState('');
  const [correct, setCorrect] = useState('');
  const [source, setSource] = useState('');
  const [attachment, setAttachment] = useState<{ id: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());

  useEffect(() => { api.products.correctableFields(params.id).then((r) => setFields(Array.isArray(r.data) ? r.data : r.data.fields ?? [])).catch(() => undefined); }, [params.id]);

  const onField = (o: any) => {
    setFieldLabel(o.label); setField(o.value);
    const f = fields.find((x) => (x.field ?? x.key) === o.value);
    setShownNow(f?.currentValue != null ? String(f.currentValue) : '');
  };

  const send = async () => {
    if (!field) { setError('Choose what’s wrong.'); return; }
    if (!correct.trim()) { setError('Enter the correct value.'); return; }
    if (!source.trim()) { setError('Add a source.'); return; }
    setBusy(true); setError(null);
    try { await api.products.suggestCorrection(params.id, { field, proposedValue: correct.trim(), reason: source.trim(), ...(attachment ? { attachmentFileId: attachment.id } : {}) } as any, { idempotencyKey: idem.current }); navigation.goBack(); }
    catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not send the suggestion.'); setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Suggest a correction</Text>
          {params.name ? <Text style={styles.navSub} numberOfLines={1}>{params.name} · verified by SkyUp</Text> : null}
        </View>
      </View>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={{ gap: 8 }}><Text style={styles.label}>What’s wrong? *</Text><Dropdown value={fieldLabel} placeholder="Choose a field" options={fields.map((f) => ({ label: f.label ?? f.field ?? f.key, value: f.field ?? f.key }))} onSelect={onField} /></View>
          <View style={styles.row2}>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Shown now</Text><View style={styles.readonly}><Text style={styles.readonlyText} numberOfLines={1}>{shownNow || '—'}</Text></View></View>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Correct value *</Text><View style={[styles.input, { borderWidth: 2, borderColor: colors.blue }]}><TextInput value={correct} onChangeText={(t) => { setCorrect(t); if (error) setError(null); }} placeholder="Value" placeholderTextColor={colors.muted} style={styles.field} selectionColor={colors.blue} /></View></View>
          </View>
          <View style={{ gap: 8 }}><Text style={styles.label}>Source *</Text><TextInput value={source} onChangeText={setSource} placeholder="e.g. Insurer website, 20 Oct" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></View>
          <Pressable style={styles.upload} onPress={async () => { try { const f = await pickAndUpload('CUSTOMER_DOCUMENT'); if (f) setAttachment(f); } catch { /* */ } }}>
            <Icon name="upload" size={16} color={colors.green} /><Text style={styles.uploadText}>{attachment ? attachment.name : 'Attach a screenshot (optional)'}</Text>
          </Pressable>
          <View style={styles.note}><Icon name="alert-circle" size={16} color={colors.blue} /><Text style={styles.noteText}>SkyUp reviews it. You’ll see Accepted or Rejected.</Text></View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.footer}>
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={send}>
            <Icon name="send" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Sending…' : 'Send suggestion'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
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
  row2: { flexDirection: 'row', gap: 10 },
  readonly: { height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, justifyContent: 'center' },
  readonlyText: { fontSize: 14, fontFamily: family.semibold, color: colors.muted2 },
  input: { minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text, justifyContent: 'center' },
  field: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 },
  upload: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f5fbf8', borderWidth: 1, borderColor: '#c7ebda', borderRadius: 16, paddingVertical: 14 },
  uploadText: { fontSize: 13, fontFamily: family.bold, color: colors.green },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
