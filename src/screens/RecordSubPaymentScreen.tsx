import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'RecordSubPayment'>;
const PLANS = [{ label: 'Normal', value: 'NORMAL' }, { label: 'Premium', value: 'PREMIUM' }];
const CYCLES = [{ label: 'Monthly', value: 'MONTHLY' }, { label: 'Yearly', value: 'YEARLY' }];

export function RecordSubPaymentScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [planLabel, setPlanLabel] = useState('Normal');
  const [plan, setPlan] = useState('NORMAL');
  const [cycleLabel, setCycleLabel] = useState('Yearly');
  const [cycle, setCycle] = useState('YEARLY');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  const submit = async () => {
    const amt = Number(amount);
    if (!amt) { setError('Enter the amount.'); return; }
    if (!reference.trim()) { setError('Enter the payment reference.'); return; }
    setBusy(true); setError(null);
    try { await api.admin.offlinePayment(params.id, { plan, cycle, amount: amt, reference: reference.trim() }, { idempotencyKey: idem.current }); close(); }
    catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not record the payment.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handleRow}><View style={styles.handle} /></View>
          <View style={styles.header}>
            <View style={{ flex: 1 }}><Text style={styles.title}>Record subscription payment</Text><Text style={styles.sub} numberOfLines={1}>{params.name ?? 'Account'}</Text></View>
            <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
          </View>
          <ScrollView style={{ maxHeight: 400 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            <View style={styles.row2}>
              <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Plan</Text><Dropdown value={planLabel} placeholder="Plan" options={PLANS} onSelect={(o: any) => { setPlanLabel(o.label); setPlan(o.value); }} /></View>
              <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Cycle</Text><Dropdown value={cycleLabel} placeholder="Cycle" options={CYCLES} onSelect={(o: any) => { setCycleLabel(o.label); setCycle(o.value); }} /></View>
            </View>
            <View style={{ gap: 8 }}><Text style={styles.label}>Amount *</Text>
              <View style={styles.amountInput}><Text style={styles.cur}>₹</Text><TextInput value={amount} onChangeText={(t) => setAmount(t.replace(/[^\d]/g, ''))} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.muted} style={styles.amountField} selectionColor={colors.blue} /></View>
            </View>
            <View style={{ gap: 8 }}><Text style={styles.label}>Payment reference *</Text>
              <TextInput value={reference} onChangeText={(t) => { setReference(t); if (error) setError(null); }} placeholder="UTR / receipt no." placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={submit}>
            <Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Recording…' : 'Record payment'}</Text>
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
  row2: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  amountInput: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16 },
  cur: { fontSize: 15, fontFamily: family.bold, color: colors.text },
  amountField: { flex: 1, fontSize: 15, fontFamily: family.bold, color: colors.text, padding: 0 },
  input: { height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
