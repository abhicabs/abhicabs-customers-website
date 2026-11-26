import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { LeadStatus } from '../api/types';

type R = RouteProp<AppStackParamList, 'MarkLost'>;

export function MarkLostScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [reasons, setReasons] = useState<string[]>([]);
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  useEffect(() => { api.reference.get().then((r) => { const ls = r.data.lostReasons ?? []; setReasons(ls); }).catch(() => setReasons(['Not interested', 'Bought elsewhere', 'Price too high', 'Not reachable', 'Duplicate', 'Other'])); }, []);

  const save = async () => {
    if (!reason) { setError('Choose a reason.'); return; }
    if (reason === 'Other' && !note.trim()) { setError('Add a note for “Other”.'); return; }
    setBusy(true); setError(null);
    try {
      await api.leads.changeStatus(params.id, { version: params.version, status: 'LOST' as Exclude<LeadStatus, 'CONVERTED'>, lostReason: reason, note: note.trim() || undefined }, { idempotencyKey: idem.current });
      close();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not mark as lost.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handleRow}><View style={styles.handle} /></View>
          <View style={styles.header}>
            <View style={{ flex: 1 }}><Text style={styles.title}>Mark as lost?</Text><Text style={styles.sub}>Open follow-up tasks are cancelled</Text></View>
            <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
          </View>

          <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            <Text style={styles.label}>Reason *</Text>
            {reasons.map((rz) => { const on = rz === reason; return (
              <Pressable key={rz} style={[styles.opt, on && styles.optOn]} onPress={() => { setReason(rz); if (error) setError(null); }}>
                <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                <Text style={styles.optTitle}>{rz}</Text>
              </Pressable>
            ); })}
            <View style={{ gap: 8, marginTop: 2 }}>
              <Text style={styles.label}>Note (optional)</Text>
              <TextInput value={note} onChangeText={setNote} placeholder="Add a note" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <Pressable style={[styles.cta, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
            <Icon name="x" size={18} color={colors.red} /><Text style={styles.ctaText}>{busy ? 'Working…' : 'Mark lost'}</Text>
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
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  optTitle: { flex: 1, fontSize: 14, fontFamily: family.bold, color: colors.text },
  input: { height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#f2c4c8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.red },
});
