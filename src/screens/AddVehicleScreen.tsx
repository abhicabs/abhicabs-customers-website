import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { Icon } from '../components/Icon';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/form';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { API_BASE, CLIENT_HEADER } from '../config/env';
import { tokenStore } from '../auth/tokenStore';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'AddVehicle'>;
const TYPES = [{ label: 'Private car', value: 'Private car' }, { label: 'Two-wheeler', value: 'Two-wheeler' }, { label: 'Commercial vehicle', value: 'Commercial vehicle' }];
const FUELS = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'].map((f) => ({ label: f, value: f }));
const YEARS = Array.from({ length: 25 }, (_, i) => { const y = new Date().getFullYear() - i; return { label: String(y), value: y }; });
const SLOTS = [{ key: 'FRONT', label: 'Front' }, { key: 'REAR', label: 'Rear' }, { key: 'LEFT', label: 'Left' }, { key: 'RIGHT', label: 'Right' }];

async function uploadFile(): Promise<string | null> {
  const picked = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
  if (picked.canceled || !picked.assets?.[0]) return null;
  const a = picked.assets[0];
  const token = tokenStore.getAccess();
  const blob = await (await fetch(a.uri)).blob();
  const up = await fetch(`${API_BASE}/files?purpose=CUSTOMER_DOCUMENT`, { method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : '', 'X-Client': CLIENT_HEADER, 'X-File-Name': encodeURIComponent(a.name ?? 'file'), 'Content-Type': a.mimeType ?? 'application/octet-stream' }, body: blob });
  const j = await up.json().catch(() => ({} as any));
  if (!up.ok || !j?.data?.id) throw new ApiError({ status: up.status, ...(j?.error || { message: 'Upload failed' }) });
  return j.data.id;
}

export function AddVehicleScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [reg, setReg] = useState('');
  const [typeLabel, setTypeLabel] = useState('Private car');
  const [vehicleType, setVehicleType] = useState('Private car');
  const [yearLabel, setYearLabel] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [mm, setMm] = useState('');
  const [fuelLabel, setFuelLabel] = useState('');
  const [fuel, setFuel] = useState<string | null>(null);
  const [rcId, setRcId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());

  const pickRc = async () => { setError(null); try { const id = await uploadFile(); if (id) setRcId(id); } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not upload RC.'); } };
  const pickPhoto = async (slot: string) => { setError(null); try { const id = await uploadFile(); if (id) setPhotos((p) => ({ ...p, [slot]: id })); } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not upload photo.'); } };

  const uploaded = (rcId ? 1 : 0) + Object.keys(photos).length;

  const save = async () => {
    if (!reg.trim()) { setError('Enter the registration number.'); return; }
    if (!mm.trim()) { setError('Enter make and model.'); return; }
    if (!year) { setError('Choose the year.'); return; }
    if (!fuel) { setError('Choose the fuel.'); return; }
    if (!rcId) { setError('Upload the RC.'); return; }
    const parts = mm.trim().split(/\s+/);
    const make = parts[0]; const model = parts.slice(1).join(' ') || parts[0];
    setBusy(true); setError(null);
    try {
      await api.customers.addVehicle(params.customerId, {
        registration: reg.trim().toUpperCase(), vehicleType, make, model, year, fuel, rcFileId: rcId,
        photos: Object.entries(photos).map(([slot, fileId]) => ({ slot, fileId })),
      }, { idempotencyKey: idem.current });
      navigation.goBack();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not save the vehicle.'); setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.navTitle}>Add vehicle</Text>
      </View>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label="Registration number *"><View style={[styles.input, { borderWidth: 2, borderColor: colors.blue }]}><TextInput value={reg} onChangeText={(t) => setReg(t.toUpperCase())} autoCapitalize="characters" placeholder="KA 01 MX 4521" placeholderTextColor={colors.muted} style={styles.field} selectionColor={colors.blue} /></View></Field>
          <View style={styles.row2}>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Type</Text><Dropdown value={typeLabel} placeholder="Type" options={TYPES} onSelect={(o: any) => { setTypeLabel(o.label); setVehicleType(o.value); }} /></View>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Year</Text><Dropdown value={yearLabel} placeholder="Year" options={YEARS} onSelect={(o: any) => { setYearLabel(o.label); setYear(o.value); }} /></View>
          </View>
          <Field label="Make and model"><TextInput value={mm} onChangeText={setMm} placeholder="e.g. Hyundai Creta SX" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></Field>
          <Field label="Fuel *"><Dropdown value={fuelLabel} placeholder="Fuel" options={FUELS} onSelect={(o: any) => { setFuelLabel(o.label); setFuel(o.value); }} /></Field>

          <Text style={styles.sectionLabel}>RC AND PHOTOS · {uploaded} OF 5</Text>
          <View style={styles.chips}>
            <Pressable style={[styles.upChip, rcId ? styles.upOn : styles.upOff]} onPress={pickRc}>{rcId ? <Icon name="check" size={13} color={colors.green} /> : <Icon name="upload" size={13} color={colors.muted2} />}<Text style={[styles.upText, rcId && { color: colors.green }]}>RC</Text></Pressable>
            {SLOTS.map((s) => { const on = !!photos[s.key]; return (
              <Pressable key={s.key} style={[styles.upChip, on ? styles.upOn : styles.upOff]} onPress={() => pickPhoto(s.key)}>{on ? <Icon name="check" size={13} color={colors.green} /> : <Icon name="upload" size={13} color={colors.muted2} />}<Text style={[styles.upText, on && { color: colors.green }]}>{s.label}</Text></Pressable>
            ); })}
          </View>
          <View style={styles.note}><Icon name="alert-circle" size={16} color={colors.blue} /><Text style={styles.noteText}>RC plus at least 4 photos are needed for motor quotes.</Text></View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.footer}>
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
            <Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Saving…' : 'Save vehicle'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={{ gap: 8 }}><Text style={styles.label}>{label}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  body: { padding: 16, gap: 12, paddingBottom: 24 },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text, justifyContent: 'center' },
  field: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 },
  row2: { flexDirection: 'row', gap: 10 },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  upChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  upOn: { backgroundColor: '#f5fbf8', borderColor: '#c7ebda' },
  upOff: { backgroundColor: colors.surface, borderColor: colors.border },
  upText: { fontSize: 12, fontFamily: family.semibold, color: colors.muted2 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
