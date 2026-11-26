import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'RecordPayment'>;
const MODES = ['Insurer link', 'UPI', 'Net banking', 'Card', 'Cheque'];
const pad = (n: number) => String(n).padStart(2, '0');
function datePresets() {
  const now = new Date();
  const d = (sub: number) => { const x = new Date(now); x.setDate(now.getDate() - sub); return { iso: `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`, label: `${pad(x.getDate())}-${pad(x.getMonth() + 1)}-${x.getFullYear()}` }; };
  return [d(0), d(1), d(2), d(3)].map((x, i) => ({ label: i === 0 ? `Today · ${x.label}` : x.label, value: x.iso }));
}

export function RecordPaymentScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const dates = datePresets();

  const [mode, setMode] = useState('UPI');
  const [amount, setAmount] = useState(params?.amount ? String(params.amount) : '');
  const [dateLabel, setDateLabel] = useState(dates[0].label);
  const [dateValue, setDateValue] = useState(dates[0].value);
  const [reference, setReference] = useState('');
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  const save = async () => {
    const amt = Number(amount);
    if (!amt) { setError('Enter the amount.'); return; }
    if (!reference.trim()) { setError('Enter the reference / UTR.'); return; }
    if (!checked) { setError('Confirm you have checked this payment.'); return; }
    setError(null); setSaving(true);
    try {
      await api.quotations.recordPayment(params.id, { mode, amount: amt, paymentDate: dateValue, reference: reference.trim(), declaration: true }, { idempotencyKey: idem.current });
      close();
    } catch (e) {
      idem.current = newIdempotencyKey();
      setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not record the payment.');
    } finally { setSaving(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handleRow}><View style={styles.handle} /></View>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Record payment</Text>
              <Text style={styles.sub}>{[params?.customerName, params?.insurerName && `paid ${params.insurerName} directly`].filter(Boolean).join(' ')}</Text>
            </View>
            <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
          </View>

          <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            <View style={styles.chips}>
              {MODES.map((m) => {
                const on = m === mode;
                return (
                  <Pressable key={m} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setMode(m)}>
                    <Text style={[styles.chipText, { color: on ? colors.onPrimary : colors.muted3 }]}>{m}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Field label="Amount *">
              <View style={styles.amountInput}>
                <Text style={styles.cur}>₹</Text>
                <TextInput value={amount} onChangeText={(t) => setAmount(t.replace(/[^\d]/g, ''))} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.muted} style={styles.amountField} selectionColor={colors.blue} />
              </View>
            </Field>

            <Field label="Payment date *">
              <Dropdown value={dateLabel} placeholder="Date" options={dates} onSelect={(o: any) => { setDateLabel(o.label); setDateValue(o.value); }} />
            </Field>

            <Field label="UTR / reference *">
              <TextInput value={reference} onChangeText={(t) => { setReference(t); if (error) setError(null); }} placeholder="Transaction reference" placeholderTextColor={colors.muted} style={styles.refInput} selectionColor={colors.blue} />
            </Field>

            <Pressable style={styles.declRow} onPress={() => setChecked((c) => !c)}>
              <View style={[styles.check, checked && styles.checkOn]}>{checked ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
              <Text style={styles.declText}>I have checked this payment.</Text>
            </Pressable>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <Pressable style={[styles.save, shadow.button, saving && { opacity: 0.6 }]} disabled={saving} onPress={save}>
            <Icon name="check" size={18} color={colors.onPrimary} />
            <Text style={styles.saveText}>{saving ? 'Recording…' : 'Record payment'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={{ gap: 8 }}><Text style={styles.label}>{label}</Text>{children}</View>;
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.bg },
  chipText: { fontSize: 13, fontFamily: family.semibold },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  amountInput: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16 },
  cur: { fontSize: 15, fontFamily: family.bold, color: colors.text },
  amountField: { flex: 1, fontSize: 15, fontFamily: family.bold, color: colors.text, padding: 0 },
  refInput: { height: 50, backgroundColor: colors.bg, borderRadius: 16, borderWidth: 2, borderColor: colors.blue, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  declRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  declText: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  save: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  saveText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
