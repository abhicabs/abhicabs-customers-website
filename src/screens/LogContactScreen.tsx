import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { DateField } from '../components/DateField';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

let BlurView: any = null;
try { BlurView = require('expo-blur').BlurView; } catch { BlurView = null; }

type R = RouteProp<AppStackParamList, 'LogContact'>;
const CHANNELS = ['Call', 'WhatsApp', 'Email', 'Meeting'];
const CH_CODE: Record<string, string> = { Call: 'CALL', WhatsApp: 'WHATSAPP', Email: 'EMAIL', Meeting: 'MEETING' };
const ANSWERED = [
  { key: 'INTERESTED', label: 'Interested', outcome: 'SPOKE_TO_CUSTOMER' },
  { key: 'NOT_INTERESTED', label: 'Not interested', outcome: 'SPOKE_TO_CUSTOMER' },
  { key: 'CALL_BACK', label: 'Call back', outcome: 'ASKED_TO_CALL_BACK', followUp: true },
  { key: 'READY', label: 'Ready to buy', outcome: 'SPOKE_TO_CUSTOMER' },
  { key: 'OTHER', label: 'Other', outcome: 'SPOKE_TO_CUSTOMER' },
];
const NOT_ANSWERED = [
  { key: 'INVALID', label: 'Invalid number', outcome: 'NOT_REACHABLE' },
  { key: 'BUSY', label: 'Busy', outcome: 'NOT_REACHABLE' },
  { key: 'SWITCHED_OFF', label: 'Switched off', outcome: 'NOT_REACHABLE' },
  { key: 'NO_ANSWER', label: 'No answer', outcome: 'NOT_REACHABLE' },
];
const toIso = (s: string) => { const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined; };

export function LogContactScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [channel, setChannel] = useState('Call');
  const [section, setSection] = useState<'ANSWERED' | 'NOT_ANSWERED'>('ANSWERED');
  const [subKey, setSubKey] = useState('INTERESTED');
  const [note, setNote] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  const options = section === 'ANSWERED' ? ANSWERED : NOT_ANSWERED;
  const selected = options.find((o) => o.key === subKey) ?? options[0];
  const showFollowUp = !!(selected as any).followUp || !!followUp;

  const pickSection = (sec: 'ANSWERED' | 'NOT_ANSWERED') => { setSection(sec); setSubKey(sec === 'ANSWERED' ? 'INTERESTED' : 'INVALID'); };

  const save = async () => {
    setBusy(true); setError(null);
    const fullNote = [selected.label, note.trim()].filter(Boolean).join(' · ');
    try {
      await api.leads.contact(params.id, { outcome: selected.outcome, channel: CH_CODE[channel], note: fullNote || undefined }, { idempotencyKey: idem.current });
      const iso = followUp ? toIso(followUp) : undefined;
      if (iso) { try { const { data } = await api.leads.get(params.id); await api.leads.update(params.id, { version: (data as any).version, nextFollowUpAt: `${iso}T10:00:00.000Z` } as any); } catch { /* follow-up best-effort */ } }
      close();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not log the contact.'); setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      {BlurView ? <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} /> : null}
      <Pressable style={styles.scrim} onPress={close} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handleRow}><View style={styles.handle} /></View>
          <View style={styles.header}>
            <View style={{ flex: 1 }}><Text style={styles.title}>Log contact</Text>{params?.name ? <Text style={styles.sub}>{params.name}</Text> : null}</View>
            <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
          </View>

          <ScrollView style={{ maxHeight: 460 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            <View style={styles.pills}>
              {CHANNELS.map((c) => { const on = c === channel; return (
                <Pressable key={c} style={[styles.pill, on ? styles.pillOn : styles.pillOff]} onPress={() => setChannel(c)}><Text style={[styles.pillText, { color: on ? colors.onPrimary : colors.muted3 }]}>{c}</Text></Pressable>
              ); })}
            </View>

            <View style={styles.seg}>
              {(['ANSWERED', 'NOT_ANSWERED'] as const).map((sec) => { const on = sec === section; return (
                <Pressable key={sec} style={[styles.segBtn, on && styles.segBtnOn]} onPress={() => pickSection(sec)}><Text style={[styles.segText, { color: on ? colors.onPrimary : colors.muted2 }]}>{sec === 'ANSWERED' ? 'Answered' : 'Not answered'}</Text></Pressable>
              ); })}
            </View>

            {options.map((o) => { const on = o.key === subKey; return (
              <Pressable key={o.key} style={[styles.opt, on && styles.optOn]} onPress={() => setSubKey(o.key)}>
                <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                <Text style={styles.optTitle}>{o.label}</Text>
              </Pressable>
            ); })}

            <View style={{ gap: 8 }}><Text style={styles.label}>Remark</Text><TextInput value={note} onChangeText={setNote} placeholder="Add a remark" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></View>

            {!showFollowUp ? (
              <Pressable style={styles.fuToggle} onPress={() => setFollowUp(' ')}><Icon name="calendar" size={16} color={colors.blue} /><Text style={styles.fuToggleText}>Add a follow-up</Text></Pressable>
            ) : (
              <View style={{ gap: 8 }}><Text style={styles.label}>Follow-up date</Text><DateField value={followUp.trim()} onChange={setFollowUp} /></View>
            )}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
            <Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Saving…' : 'Save contact'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,31,59,0.55)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 18, gap: 12 },
  handleRow: { alignItems: 'center' }, handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#d5dbe5' },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 18, fontFamily: family.bold, color: colors.text }, sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  pillOn: { backgroundColor: colors.navy }, pillOff: { backgroundColor: colors.bg },
  pillText: { fontSize: 13, fontFamily: family.semibold },
  seg: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 14, padding: 4, gap: 4 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segBtnOn: { backgroundColor: colors.navy },
  segText: { fontSize: 14, fontFamily: family.semibold },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  optTitle: { flex: 1, fontSize: 14, fontFamily: family.bold, color: colors.text },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  fuToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  fuToggleText: { fontSize: 14, fontFamily: family.semibold, color: colors.blue },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
