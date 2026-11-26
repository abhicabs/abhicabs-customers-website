import React, { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { DateField } from '../components/DateField';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { dobToIso } from '../lib/validate';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'EditNominees'>;
type Nom = { name: string; relationship: string; dob: string; share: string };
const fromIso = (s?: string | null) => { if (!s) return ''; const d = new Date(s); return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`; };

export function EditNomineesScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [noms, setNoms] = useState<Nom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.policies.get(params.id);
      const n = (data.nominees ?? []) as any[];
      setNoms(n.length ? n.map((x) => ({ name: x.name ?? '', relationship: x.relationship ?? '', dob: fromIso(x.dob), share: String(x.share ?? '') })) : [{ name: '', relationship: '', dob: '', share: '100' }]);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load the policy.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  const put = (i: number, patch: Partial<Nom>) => setNoms((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const add = () => setNoms((s) => [...s, { name: '', relationship: '', dob: '', share: '' }]);
  const remove = (i: number) => setNoms((s) => s.filter((_, j) => j !== i));

  const save = async () => {
    for (const n of noms) {
      if (!n.name.trim() || !n.relationship.trim()) { setSaveErr('Each nominee needs a name and relationship.'); return; }
      if (n.dob && dobToIso(n.dob).error) { setSaveErr(`Check ${n.name || 'nominee'}'s date of birth.`); return; }
    }
    const total = noms.reduce((s, n) => s + (Number(n.share) || 0), 0);
    if (total !== 100) { setSaveErr(`Shares must add up to 100% (now ${total}%).`); return; }
    setBusy(true); setSaveErr(null);
    try {
      await api.policies.setNominees(params.id, { nominees: noms.map((n) => ({ name: n.name.trim(), relationship: n.relationship.trim(), dob: n.dob ? dobToIso(n.dob).iso : undefined, share: Number(n.share) })) });
      navigation.goBack();
    } catch (e) { setSaveErr(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not save nominees.'); setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.navTitle}>Edit nominees</Text>
      </View>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {noms.map((n, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardHead}><Text style={styles.cardTitle}>Nominee {i + 1}</Text>{noms.length > 1 ? <Pressable onPress={() => remove(i)}><Text style={styles.remove}>Remove</Text></Pressable> : null}</View>
              <TextInput value={n.name} onChangeText={(t) => put(i, { name: t })} placeholder="Full name" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} />
              <View style={styles.row2}>
                <TextInput value={n.relationship} onChangeText={(t) => put(i, { relationship: t })} placeholder="Relationship" placeholderTextColor={colors.muted} style={[styles.input, { flex: 1.3 }]} selectionColor={colors.blue} />
                <View style={[styles.input, styles.shareInput]}><TextInput value={n.share} onChangeText={(t) => put(i, { share: t.replace(/[^\d]/g, '') })} keyboardType="number-pad" placeholder="Share" placeholderTextColor={colors.muted} style={styles.field} selectionColor={colors.blue} /><Text style={styles.pct}>%</Text></View>
              </View>
              <DateField value={n.dob} onChange={(v) => put(i, { dob: v })} />
            </View>
          ))}
          <Pressable style={styles.addRow} onPress={add}><Icon name="plus" size={16} color={colors.text} /><Text style={styles.addText}>Add nominee</Text></Pressable>
          {saveErr ? <Text style={styles.error}>{saveErr}</Text> : null}
        </ScrollView>
        <View style={styles.footer}><Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}><Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Saving…' : 'Save nominees'}</Text></Pressable></View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) { return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg }, flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }, navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  body: { padding: 16, gap: 12, paddingBottom: 24 },
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 14, gap: 10 },
  cardHead: { flexDirection: 'row', alignItems: 'center' }, cardTitle: { flex: 1, fontSize: 14, fontFamily: family.bold, color: colors.text },
  remove: { fontSize: 13, fontFamily: family.semibold, color: colors.red },
  input: { minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text, justifyContent: 'center' },
  row2: { flexDirection: 'row', gap: 10 },
  shareInput: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }, field: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 }, pct: { fontSize: 14, fontFamily: family.semibold, color: colors.muted },
  addRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  addText: { fontSize: 14, fontFamily: family.semibold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
