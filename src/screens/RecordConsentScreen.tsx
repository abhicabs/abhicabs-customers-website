import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

type R = RouteProp<AppStackParamList, 'RecordConsent'>;
const CHANNELS = [{ key: 'WHATSAPP', label: 'WhatsApp' }, { key: 'EMAIL', label: 'Email' }, { key: 'SMS', label: 'SMS' }];
const HOW = [
  { value: 'Signed form', title: 'Signed consent form', sub: 'Photo of the signed page' },
  { value: 'Verbal on a call', title: 'Verbal, on a call', sub: 'Note date and time' },
  { value: 'Reply on WhatsApp or email', title: 'Reply on WhatsApp or email', sub: 'Screenshot' },
];
const pad = (n: number) => String(n).padStart(2, '0');
function datePresets() { const now = new Date(); const d = (a: number) => { const x = new Date(now); x.setDate(now.getDate() - a); return { label: `${pad(x.getDate())}-${pad(x.getMonth() + 1)}-${x.getFullYear()}`, value: x.toISOString() }; }; return [d(0), d(1), d(2)].map((x, i) => ({ label: i === 0 ? `Today · ${x.label}` : x.label, value: x.value })); }

export function RecordConsentScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const dates = datePresets();
  const [channel, setChannel] = useState(params.channel ?? 'WHATSAPP');
  const [how, setHow] = useState('Signed form');
  const [dateLabel, setDateLabel] = useState(dates[0].label);
  const [declared, setDeclared] = useState(true);
  const [proofFile, setProofFile] = useState<{ id: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());

  const save = async () => {
    if (!declared) { setError(`Confirm ${params.personName?.split(' ')[0] ?? 'they'} gave this consent.`); return; }
    setBusy(true); setError(null);
    try {
      await api.customers.recordConsent(params.customerId, { personType: params.personType, personId: params.personId, channel, action: 'GIVE', howGiven: how, declaration: true, ...(proofFile ? { evidenceFileId: proofFile.id } : {}) }, { idempotencyKey: idem.current });
      navigation.goBack();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not record consent.'); setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}><Text style={styles.navTitle}>Record consent</Text>{params.personName ? <Text style={styles.navSub}>{params.personName}</Text> : null}</View>
      </View>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.pills}>
            {CHANNELS.map((c) => { const on = c.key === channel; return (
              <Pressable key={c.key} style={[styles.pill, on ? styles.pillOn : styles.pillOff]} onPress={() => setChannel(c.key)}><Text style={[styles.pillText, { color: on ? colors.onPrimary : colors.muted3 }]}>{c.label}</Text></Pressable>
            ); })}
          </View>

          <Text style={styles.label}>How was it given? *</Text>
          {HOW.map((h) => { const on = h.value === how; return (
            <Pressable key={h.value} style={[styles.opt, on && styles.optOn]} onPress={() => setHow(h.value)}>
              <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
              <View style={{ flex: 1 }}><Text style={styles.optTitle}>{h.title}</Text><Text style={styles.optSub}>{h.sub}</Text></View>
            </Pressable>
          ); })}

          <Pressable style={styles.upload} onPress={async () => { try { const fl = await pickAndUpload('CUSTOMER_DOCUMENT'); if (fl) setProofFile(fl); } catch { /* */ } }}>
            <Icon name="upload" size={16} color={colors.green} /><Text style={styles.uploadText}>{proofFile ? proofFile.name : 'Add proof (optional)'}</Text>
          </Pressable>

          <View style={{ gap: 8 }}><Text style={styles.label}>Date given *</Text><Dropdown value={dateLabel} placeholder="Date" options={dates} onSelect={(o: any) => setDateLabel(o.label)} /></View>

          <Pressable style={styles.declRow} onPress={() => setDeclared((d) => !d)}>
            <View style={[styles.check, declared && styles.checkOn]}>{declared ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
            <Text style={styles.declText}>{params.personName?.split(' ')[0] ?? 'They'} gave this consent themselves</Text>
          </Pressable>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.footer}>
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
            <Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Saving…' : 'Save consent'}</Text>
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
  pills: { flexDirection: 'row', gap: 6 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  pillOn: { backgroundColor: colors.navy },
  pillOff: { backgroundColor: colors.bg },
  pillText: { fontSize: 13, fontFamily: family.semibold },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  optTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  optSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  upload: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f5fbf8', borderWidth: 1, borderColor: '#c7ebda', borderRadius: 16, paddingVertical: 14 },
  uploadText: { fontSize: 13, fontFamily: family.bold, color: colors.green },
  declRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  declText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
