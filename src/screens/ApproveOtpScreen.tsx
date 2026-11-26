import React, { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'ApproveOtp'>;

export function ApproveOtpScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState<'approve' | 'reject' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  const doApprove = async () => {
    setBusy(true); setError(null);
    try { await api.admin.approve(params.id, { version: params.version }, { idempotencyKey: idem.current }); close(); }
    catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? e.message : 'Could not approve.'); }
    finally { setBusy(false); }
  };
  const doReject = async () => {
    if (!reason.trim()) { setError('Enter a reason.'); return; }
    setBusy(true); setError(null);
    try { await api.admin.reject(params.id, { version: params.version, reason: reason.trim() }, { idempotencyKey: idem.current }); close(); }
    catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? e.message : 'Could not reject.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Review approval</Text>
            <Text style={styles.sub} numberOfLines={1}>{params.title ?? 'Approval'}</Text>
          </View>
          <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
        </View>

        <View style={styles.note}>
          <Icon name="lock" size={16} color={colors.blue} />
          <Text style={styles.noteText}>Approving needs a second admin and is step-up verified.</Text>
        </View>

        {mode === 'reject' ? (
          <View style={{ gap: 8 }}>
            <Text style={styles.label}>Reason</Text>
            <TextInput value={reason} onChangeText={(t) => { setReason(t); if (error) setError(null); }} placeholder="Why is this rejected?" placeholderTextColor={colors.muted} style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]} multiline selectionColor={colors.blue} />
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Pressable style={[styles.rejectBtn, busy && { opacity: 0.6 }]} disabled={busy} onPress={() => (mode === 'reject' ? doReject() : setMode('reject'))}>
            <Icon name="x" size={18} color={colors.red} />
            <Text style={styles.rejectText}>{mode === 'reject' ? 'Confirm reject' : 'Reject'}</Text>
          </Pressable>
          <Pressable style={[styles.approveBtn, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={doApprove}>
            <Icon name="check" size={18} color={colors.onPrimary} />
            <Text style={styles.approveText}>{busy ? 'Working…' : 'Approve'}</Text>
          </Pressable>
        </View>
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
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  actions: { flexDirection: 'row', gap: 10, marginTop: 2 },
  rejectBtn: { flex: 1, height: 50, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#f2c4c8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  rejectText: { fontSize: 14, fontFamily: family.semibold, color: colors.red },
  approveBtn: { flex: 1.3, height: 50, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  approveText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
