import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'WithdrawConsent'>;
const CHAN_LABEL: Record<string, string> = { WHATSAPP: 'WhatsApp', EMAIL: 'Email', SMS: 'SMS', PERSONAL_DATA: 'personal data' };

export function WithdrawConsentScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const first = params.personName?.split(' ')[0] ?? 'They';
  const REASONS = [
    { value: 'ASKED_TO_STOP', label: `${first} asked to stop` },
    { value: 'REPLIED_STOP', label: 'Replied STOP' },
    { value: 'OTHER', label: 'Other' },
  ];
  const [reason, setReason] = useState('ASKED_TO_STOP');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  const save = async () => {
    setBusy(true); setError(null);
    try {
      await api.customers.recordConsent(params.customerId, { personType: params.personType, personId: params.personId, channel: params.channel, action: 'WITHDRAW', reason }, { idempotencyKey: idem.current });
      close();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not withdraw consent.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Withdraw {CHAN_LABEL[params.channel] ?? params.channel} consent?</Text>
            <Text style={styles.sub}>Messages to {params.personName ?? 'them'} stop now</Text>
          </View>
          <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
        </View>

        <Text style={styles.label}>Reason *</Text>
        {REASONS.map((r) => { const on = r.value === reason; return (
          <Pressable key={r.value} style={[styles.opt, on && styles.optOn]} onPress={() => setReason(r.value)}>
            <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
            <Text style={styles.optTitle}>{r.label}</Text>
          </Pressable>
        ); })}

        <View style={styles.note}><Icon name="alert-triangle" size={15} color="#8a5a12" /><Text style={styles.noteText}>Scheduled messages are cancelled. You can record consent again later.</Text></View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.cta, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
          <Icon name="x" size={18} color={colors.red} /><Text style={styles.ctaText}>{busy ? 'Working…' : 'Withdraw consent'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,31,59,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 18, gap: 10 },
  handleRow: { alignItems: 'center' },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#d5dbe5' },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text, marginTop: 2 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  optTitle: { flex: 1, fontSize: 14, fontFamily: family.bold, color: colors.text },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fbf1e1', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  noteText: { flex: 1, fontSize: 12, fontFamily: family.semibold, color: '#8a5a12' },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#f2c4c8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.red },
});
