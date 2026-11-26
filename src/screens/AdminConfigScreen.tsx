import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';

const fmtVal = (v: any) => (v === true ? 'On' : v === false ? 'Off' : v === null || v === undefined ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v));

export function AdminConfigScreen() {
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.admin.config(); setRows(Array.isArray(data) ? data : data.items ?? data.config ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load configuration.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.navTitle}>Configuration</Text>
      </View>
      {error ? <ErrorState message={error} onRetry={load} /> : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.note}><Icon name="lock" size={16} color={colors.blue} /><Text style={styles.noteText}>Changes need a second admin and are step-up verified.</Text></View>
          <View style={styles.card}>
            {loading ? <EmptyState icon="loader" title="Loading…" /> : rows.length ? rows.map((c, i) => (
              <Pressable key={c.id ?? i} style={styles.row} onPress={() => navigation.navigate('ComingSoon', { title: c.label ?? c.id ?? 'Setting' })}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel} numberOfLines={1}>{c.label ?? c.name ?? c.id}</Text>
                  {c.id ? <Text style={styles.rowId}>{c.id}</Text> : null}
                </View>
                <Text style={styles.rowValue} numberOfLines={1}>{fmtVal(c.value)}</Text>
                <Icon name="chevron-right" size={16} color={colors.grayBar} />
              </Pressable>
            )) : <Text style={styles.empty}>No configuration items.</Text>}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  rowLabel: { fontSize: 14, fontFamily: family.semibold, color: colors.text },
  rowId: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  rowValue: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  empty: { fontSize: 13, fontFamily: family.medium, color: colors.muted, padding: 12 },
});
