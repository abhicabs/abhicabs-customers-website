import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'ChangeLabel'>;
const LABELS = ['Aadhaar', 'PAN', 'Passport', 'Driving licence', 'Address proof', 'Medical report', 'Policy copy', 'Vehicle RC', 'Other'];

export function ChangeLabelScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const close = () => navigation.goBack();

  const save = async () => {
    if (!label) { setError('Choose the new label.'); return; }
    setBusy(true); setError(null);
    try { await api.documents.changeLabel(params.docId, { rev: params.rev, label }); close(); }
    catch (e) { setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not change the label.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}><Text style={styles.title}>Change label</Text><Text style={styles.sub}>The change is logged</Text></View>
          <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
        </View>
        <View style={{ gap: 8 }}><Text style={styles.label}>Current</Text><View style={styles.readonly}><Text style={styles.readonlyText}>{params.current}</Text></View></View>
        <View style={{ gap: 8 }}><Text style={styles.label}>New label *</Text><Dropdown value={label} placeholder="New label" options={LABELS.filter((l) => l !== params.current).map((l) => ({ label: l }))} onSelect={(o: any) => { setLabel(o.label); if (error) setError(null); }} /></View>
        <View style={styles.note}><Icon name="lock" size={16} color={colors.blue} /><Text style={styles.noteText}>Advisor only.</Text></View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
          <Icon name="edit-3" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Saving…' : 'Change label'}</Text>
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
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  readonly: { height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, justifyContent: 'center' },
  readonlyText: { fontSize: 14, fontFamily: family.semibold, color: colors.text },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
