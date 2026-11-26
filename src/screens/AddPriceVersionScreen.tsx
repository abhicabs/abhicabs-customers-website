import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { Icon } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'AddPriceVersion'>;
const toIso = (s: string) => { const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined; };

export function AddPriceVersionScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [start, setStart] = useState('');
  const [tax, setTax] = useState('18');
  const [csv, setCsv] = useState<{ name: string; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  const pickCsv = async () => {
    setError(null);
    try {
      const r = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'], copyToCacheDirectory: true });
      if (r.canceled || !r.assets?.[0]) return;
      const a = r.assets[0];
      const text = await (await fetch(a.uri)).text();
      setCsv({ name: a.name ?? 'rates.csv', text });
    } catch { setError('Could not read the CSV.'); }
  };

  const rowCount = csv ? Math.max(0, csv.text.trim().split('\n').length - 1) : 0;

  const save = async () => {
    const iso = toIso(start);
    if (!iso) { setError('Enter the start date as DD-MM-YYYY.'); return; }
    if (!Number(tax) && Number(tax) !== 0) { setError('Enter the tax %.'); return; }
    if (!csv) { setError('Upload the rate CSV.'); return; }
    setBusy(true); setError(null);
    try {
      await api.products.addPrice(params.id, { effectiveFrom: iso, taxPercent: Number(tax), csv: csv.text }, { idempotencyKey: idem.current });
      close();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not save the price version.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handleRow}><View style={styles.handle} /></View>
          <View style={styles.header}>
            <View style={{ flex: 1 }}><Text style={styles.title}>Add price version</Text>{params.name ? <Text style={styles.sub}>{params.name}</Text> : null}</View>
            <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
          </View>

          <View style={styles.row2}>
            <View style={{ flex: 1.4, gap: 8 }}><Text style={styles.label}>Start date *</Text><View style={[styles.input, styles.rowInput]}><TextInput value={start} onChangeText={setStart} placeholder="DD-MM-YYYY" placeholderTextColor={colors.muted} keyboardType="numbers-and-punctuation" style={styles.field} selectionColor={colors.blue} /><Icon name="calendar" size={18} color={colors.muted} /></View></View>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Tax %</Text><View style={styles.input}><TextInput value={tax} onChangeText={(t) => setTax(t.replace(/[^\d.]/g, ''))} keyboardType="decimal-pad" style={styles.field} selectionColor={colors.blue} /></View></View>
          </View>
          <Text style={styles.hint}>Future date = Scheduled</Text>

          <Pressable style={[styles.upload, csv ? styles.uploadDone : styles.uploadPending]} onPress={pickCsv}>
            <View style={styles.uploadIcon}><Icon name={csv ? 'check' : 'upload'} size={20} color={csv ? colors.green : colors.text} /></View>
            <Text style={[styles.uploadText, csv && { color: colors.green }]}>{csv ? `${csv.name} · ${rowCount} rows` : 'Upload rate CSV'}</Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
            <Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Saving…' : 'Save price version'}</Text>
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
  input: { minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, justifyContent: 'center' },
  rowInput: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  field: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 },
  hint: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: -4 },
  upload: { alignItems: 'center', gap: 8, borderRadius: 18, padding: 18 },
  uploadPending: { backgroundColor: '#f7f9ff', borderWidth: 1, borderColor: '#9db8ee', borderStyle: 'dashed' },
  uploadDone: { backgroundColor: '#f5fbf8', borderWidth: 1, borderColor: '#c7ebda' },
  uploadIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  uploadText: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
