import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { isMobile10 } from '../lib/validate';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'PersonForm'>;

export function PersonFormScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  const save = async () => {
    if (!name.trim()) { setError('Enter a name.'); return; }
    if (!isMobile10(mobile)) { setError('Enter a valid 10-digit mobile (starts 6-9).'); return; }
    setBusy(true); setError(null);
    const body: any = { name: name.trim(), mobile: `+91${mobile}` };
    if (params.withNote && note.trim()) body.note = note.trim();
    try {
      if (params.kind === 'assistant') await api.assistants.create(body, { idempotencyKey: idem.current });
      else await api.referrers.create(body, { idempotencyKey: idem.current });
      close();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not add.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handleRow}><View style={styles.handle} /></View>
          <View style={styles.header}>
            <View style={{ flex: 1 }}><Text style={styles.title}>{params.title}</Text><Text style={styles.sub}>{params.body}</Text></View>
            <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
          </View>
          <View style={{ gap: 8 }}><Text style={styles.label}>Full name *</Text><TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} autoFocus /></View>
          <View style={{ gap: 8 }}><Text style={styles.label}>Mobile *</Text><View style={[styles.input, styles.rowInput]}><Text style={styles.cur}>+91</Text><TextInput value={mobile} onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))} keyboardType="number-pad" placeholder="98450 00000" placeholderTextColor={colors.muted} style={styles.field} selectionColor={colors.blue} /></View></View>
          {params.withNote ? <View style={{ gap: 8 }}><Text style={styles.label}>Note</Text><TextInput value={note} onChangeText={setNote} placeholder="Optional" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></View> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
            <Icon name="user-plus" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Adding…' : 'Add'}</Text>
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
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 12, lineHeight: 17, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text, justifyContent: 'center' },
  rowInput: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  field: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 },
  cur: { fontSize: 14, fontFamily: family.semibold, color: colors.muted },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
