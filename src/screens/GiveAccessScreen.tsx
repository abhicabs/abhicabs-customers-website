import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';

export function GiveAccessScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [staff, setStaff] = useState<{ id: string; name: string }[]>([]);
  const [granteeUserId, setGrantee] = useState<string | null>(null);
  const [granteeLabel, setGranteeLabel] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  useEffect(() => { api.supportAccess.staff().then((r) => { const list = Array.isArray(r.data) ? r.data : r.data.items ?? r.data.staff ?? []; setStaff(list.map((x: any) => ({ id: x.id ?? x.userId ?? x.value, name: x.name ?? x.label }))); }).catch(() => undefined); }, []);

  const save = async () => {
    if (!granteeUserId) { setError('Choose a SkyUp person.'); return; }
    if (!reason.trim()) { setError('Add a reason.'); return; }
    setBusy(true); setError(null);
    try { await api.supportAccess.give({ granteeUserId, reason: reason.trim() }, { idempotencyKey: idem.current }); close(); }
    catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not give access.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handleRow}><View style={styles.handle} /></View>
          <View style={styles.header}><View style={{ flex: 1 }}><Text style={styles.title}>Give support access</Text><Text style={styles.sub}>SkyUp staff can see your account to help.</Text></View><Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable></View>
          <View style={{ gap: 8 }}><Text style={styles.label}>SkyUp person *</Text><Dropdown value={granteeLabel} placeholder="Choose" options={staff.map((x) => ({ label: x.name, id: x.id }))} onSelect={(o: any) => { setGranteeLabel(o.label); setGrantee(o.id); }} /></View>
          <View style={{ gap: 8 }}><Text style={styles.label}>Reason *</Text><TextInput value={reason} onChangeText={setReason} placeholder="e.g. Help fixing a quotation" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}><Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Granting…' : 'Give access'}</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,31,59,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 18, gap: 12 },
  handleRow: { alignItems: 'center' }, handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#d5dbe5' },
  header: { flexDirection: 'row', alignItems: 'flex-start' }, title: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text, justifyContent: 'center' },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
