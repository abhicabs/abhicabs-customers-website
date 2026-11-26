import React, { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'EditCommercials'>;

export function EditCommercialsScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [commission, setCommission] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const loaded = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.products.commercials(params.id); if (!loaded.current) { setCommission(data?.commissionPercent != null ? String(data.commissionPercent) : ''); setNotes(data?.notes ?? ''); loaded.current = true; } }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load commercials.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error && !loaded.current) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  const save = async () => {
    const c = Number(commission);
    if (commission && (isNaN(c) || c < 0 || c > 100)) { setError('Commission must be between 0 and 100.'); return; }
    setBusy(true); setError(null);
    try { await api.products.saveCommercials(params.id, { commissionPercent: commission ? c : undefined, notes: notes.trim() || undefined }); navigation.goBack(); }
    catch (e) { setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not save.'); setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}><Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable><Text style={styles.navTitle}>Edit commercials</Text></View>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.body}>
          <Text style={styles.intro}>Your commission on this product. Only you can see it.</Text>
          <View style={{ gap: 8 }}><Text style={styles.label}>Commission %</Text><View style={[styles.input, styles.rowInput]}><TextInput value={commission} onChangeText={(t) => setCommission(t.replace(/[^\d.]/g, ''))} keyboardType="decimal-pad" placeholder="e.g. 15" placeholderTextColor={colors.muted} style={styles.field} selectionColor={colors.blue} /><Text style={styles.pct}>%</Text></View></View>
          <View style={{ gap: 8 }}><Text style={styles.label}>Notes</Text><TextInput value={notes} onChangeText={setNotes} placeholder="Optional" placeholderTextColor={colors.muted} style={[styles.input, { height: 90, textAlignVertical: 'top', paddingTop: 12 }]} multiline selectionColor={colors.blue} /></View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <View style={styles.footer}><Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}><Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Saving…' : 'Save commercials'}</Text></Pressable></View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) { return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface }, flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }, navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  body: { flex: 1, padding: 16, gap: 12 },
  intro: { fontSize: 13, fontFamily: family.medium, color: colors.muted },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text, justifyContent: 'center' },
  rowInput: { flexDirection: 'row', alignItems: 'center', gap: 6 }, field: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 }, pct: { fontSize: 14, fontFamily: family.semibold, color: colors.muted },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
