import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'SuspendAccount'>;

export function SuspendAccountScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  const submit = async () => {
    if (!reason.trim()) { setError('Enter a reason.'); return; }
    setBusy(true); setError(null);
    try { await api.admin.suspend(params.id, { reason: reason.trim() }, { idempotencyKey: idem.current }); close(); }
    catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? e.message : 'Could not suspend the account.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}><Text style={styles.title}>Suspend account</Text><Text style={styles.sub} numberOfLines={1}>{params.name ?? 'Account'}</Text></View>
          <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
        </View>
        <View style={styles.note}><Icon name="alert-triangle" size={16} color="#8a5a12" /><Text style={styles.noteText}>The advisor loses access until reinstated. Step-up verified.</Text></View>
        <Text style={styles.label}>Reason</Text>
        <TextInput value={reason} onChangeText={(t) => { setReason(t); if (error) setError(null); }} placeholder="Why is this account suspended?" placeholderTextColor={colors.muted} style={styles.input} multiline selectionColor={colors.blue} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={[styles.cta, busy && { opacity: 0.6 }]} disabled={busy} onPress={submit}>
          <Icon name="slash" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Suspending…' : 'Suspend account'}</Text>
        </Pressable>
      </View>
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
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fbf1e1', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: '#8a5a12' },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { height: 90, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, paddingTop: 12, fontSize: 14, fontFamily: family.semibold, color: colors.text, textAlignVertical: 'top' },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.red, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
