import React, { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'ChangeNominee'>;

export function ChangeNomineeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [members, setMembers] = useState<any[]>([]);
  const [version, setVersion] = useState(1);
  const [sel, setSel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(0);
  const close = () => navigation.goBack();

  const load = useCallback(async () => {
    try {
      const { data } = await api.customers.get(params.customerId);
      setVersion((data as any).version ?? 1);
      const fam = (data.family ?? []) as any[];
      setMembers(fam);
      const cur = fam.find((m) => m.isDefaultNominee || m.defaultNominee);
      setSel(cur?.id ?? null);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load family.'); }
    finally { setLoading(false); }
  }, [params.customerId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = async () => {
    const m = members.find((x) => x.id === sel);
    if (!m) { setError('Choose a nominee.'); return; }
    if (!m.dob) { setError(`${m.name} needs a date of birth first.`); return; }
    setBusy(true); setError(null);
    try {
      await api.customers.setDefaultNominee(params.customerId, { version, nominee: { name: m.name, relationship: m.relationship, dob: m.dob } });
      close();
    } catch (e) { setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not set the nominee.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}><Text style={styles.title}>Default nominee</Text><Text style={styles.sub}>Suggested on new proposals only</Text></View>
          <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
        </View>
        <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {loading ? <EmptyState icon="loader" title="Loading…" /> : members.length ? members.map((m) => { const on = m.id === sel; return (
            <Pressable key={m.id} style={[styles.opt, on && styles.optOn]} onPress={() => setSel(m.id)}>
              <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
              <View style={{ flex: 1 }}><Text style={styles.optTitle}>{m.name}</Text><Text style={styles.optSub}>{[m.relationship, !m.dob ? 'needs date of birth' : null].filter(Boolean).join(' · ')}</Text></View>
            </Pressable>
          ); }) : <Text style={styles.empty}>No family members yet. Add one first.</Text>}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <Pressable style={[styles.cta, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
          <Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Saving…' : 'Save'}</Text>
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
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  optTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  optSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  empty: { fontSize: 13, fontFamily: family.medium, color: colors.muted },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
