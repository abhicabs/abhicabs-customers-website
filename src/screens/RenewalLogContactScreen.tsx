import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'RenewalLogContact'>;
const CHANNELS = ['Call', 'WhatsApp', 'Email', 'Meeting'];
const INTENTS = [
  { key: 'WILL_RENEW', label: 'Will renew', outcome: 'Spoke to customer' },
  { key: 'COMPARE', label: 'Wants to compare', outcome: 'Spoke to customer' },
  { key: 'NOT_RENEWING', label: 'Not renewing', outcome: null },
  { key: 'NOT_REACHABLE', label: 'Not reachable', outcome: 'Not reachable' },
];

export function RenewalLogContactScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [channel, setChannel] = useState('Call');
  const [intent, setIntent] = useState('COMPARE');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  const save = async () => {
    const chosen = INTENTS.find((i) => i.key === intent)!;
    if (!chosen.outcome) {
      // "Not renewing" routes to the dedicated flow
      close();
      setTimeout(() => navigation.navigate('RenewalNotRenewing', { id: params.id, name: params.name, version: params.version }), 50);
      return;
    }
    setBusy(true); setError(null);
    const fullNote = [chosen.label, note.trim()].filter(Boolean).join(' · ');
    try {
      await api.renewals.contact(params.id, { version: params.version, outcome: chosen.outcome, note: fullNote || undefined }, { idempotencyKey: idem.current });
      close();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not log the contact.'); setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handleRow}><View style={styles.handle} /></View>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Log contact</Text>
              <Text style={styles.sub}>{params.name ? `${params.name} · renewal` : 'renewal'}</Text>
            </View>
            <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
          </View>

          <ScrollView style={{ maxHeight: 430 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            <View style={styles.pills}>
              {CHANNELS.map((c) => { const on = c === channel; return (
                <Pressable key={c} style={[styles.pill, on ? styles.pillOn : styles.pillOff]} onPress={() => setChannel(c)}><Text style={[styles.pillText, { color: on ? colors.onPrimary : colors.muted3 }]}>{c}</Text></Pressable>
              ); })}
            </View>
            {INTENTS.map((i) => { const on = i.key === intent; return (
              <Pressable key={i.key} style={[styles.opt, on ? styles.optOn : styles.optOff]} onPress={() => setIntent(i.key)}>
                <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                <Text style={styles.optTitle}>{i.label}</Text>
              </Pressable>
            ); })}
            <View style={{ gap: 8 }}><Text style={styles.label}>Note</Text><TextInput value={note} onChangeText={setNote} placeholder="Add a note" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></View>
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
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,31,59,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 18, gap: 12 },
  handleRow: { alignItems: 'center' },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#d5dbe5' },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  pillOn: { backgroundColor: colors.navy },
  pillOff: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pillText: { fontSize: 12, fontFamily: family.semibold },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  optOff: {},
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  optTitle: { flex: 1, fontSize: 14, fontFamily: family.bold, color: colors.text },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
