import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';

const OCCASIONS = [
  { key: 'BIRTHDAY', label: 'Policy holder birthday' },
  { key: 'FAMILY_BIRTHDAY', label: 'Family member birthday' },
  { key: 'ANNIVERSARY', label: 'Policy anniversary' },
];

export function GreetingsScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<any>(null);
  const [on, setOn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.greetings.get(); setData(data); setOn(!!data?.on); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load greetings.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggle = async (v: boolean) => {
    setOn(v); setSaving(true);
    try { await api.greetings.save({ on: v, templates: data?.templates ?? {}, excluded: data?.excluded ?? [] }); }
    catch (e) { setOn(!v); }
    finally { setSaving(false); }
  };

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error && !data) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}><Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable><Text style={styles.navTitle}>Greetings</Text></View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Automatic festival and birthday wishes to your policy holders, from your WhatsApp and email.</Text>
        <View style={styles.masterRow}>
          <View style={{ flex: 1 }}><Text style={styles.masterTitle}>Send greetings</Text><Text style={styles.masterSub}>{on ? 'On — wishes go out automatically' : 'Off'}</Text></View>
          <Switch value={on} onValueChange={toggle} disabled={saving} trackColor={{ true: colors.navy }} />
        </View>
        <Text style={styles.sectionLabel}>OCCASIONS</Text>
        {OCCASIONS.map((o) => (
          <View key={o.key} style={styles.item}>
            <View style={styles.itemIcon}><Icon name="star" size={16} color={colors.text} /></View>
            <Text style={styles.itemLabel}>{o.label}</Text>
            <View style={[styles.chip, { backgroundColor: on && data?.templates?.[o.key] ? '#e7f4ee' : '#eef1f5' }]}><Text style={[styles.chipText, { color: on && data?.templates?.[o.key] ? '#127650' : '#44526a' }]}>{on ? (data?.templates?.[o.key] ? 'On' : 'Default') : 'Off'}</Text></View>
          </View>
        ))}
        <View style={styles.note}><Icon name="alert-circle" size={16} color={colors.blue} /><Text style={styles.noteText}>Message templates are set in Settings → Message templates.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) { return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }, navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  intro: { fontSize: 13, lineHeight: 19, fontFamily: family.medium, color: colors.muted },
  masterRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 18, padding: 16 },
  masterTitle: { fontSize: 15, fontFamily: family.bold, color: colors.text }, masterSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6, marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14 },
  itemIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fde8c9', alignItems: 'center', justifyContent: 'center' },
  itemLabel: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 }, chipText: { fontSize: 12, fontFamily: family.semibold },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }, noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
});
