import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { downloadAndShare } from '../lib/download';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';

const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayMonth = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const STATE: Record<string, { bg: string; fg: string; label: string; sub: string }> = {
  PREPARING: { bg: '#f0ecfb', fg: '#5b3fb8', label: 'Preparing', sub: 'Being prepared' },
  PENDING: { bg: '#f0ecfb', fg: '#5b3fb8', label: 'Preparing', sub: 'Being prepared' },
  READY: { bg: '#e7f4ee', fg: '#127650', label: 'Ready', sub: 'Ready to download' },
  EXPIRED: { bg: '#eef1f5', fg: '#44526a', label: 'Expired', sub: 'Link expired' },
  FAILED: { bg: '#fbebec', fg: '#b4323c', label: 'Failed', sub: 'Could not prepare' },
};
const TILE = ['#d9eafd', '#e9e3fc', '#d4f1e7', '#fde8c9'];

export function ExportDataScreen() {
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.exportsApi.list(); setRows(Array.isArray(data) ? data : data.items ?? data.exports ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load exports.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });
  const requestExport = () => Alert.alert('Request export?', 'We prepare a file with your data. You will see it here when ready.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Request', onPress: async () => { try { await api.exportsApi.request({ include: ['leads', 'customers', 'policies', 'quotations'] }); load(); Alert.alert('Requested', 'Your export is being prepared.'); } catch (e) { Alert.alert('Failed', e instanceof ApiError ? e.message : 'Try again.'); } } }]);

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Export my data</Text>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.note}>
          <Icon name="lock" size={16} color={colors.blue} />
          <Text style={styles.noteText}>Your export includes every record, document and message. It needs an OTP.</Text>
        </View>

        <Text style={styles.sectionLabel}>EXPORTS</Text>
        {rows.length ? rows.map((r, i) => {
          const st = STATE[r.status] ?? STATE.PREPARING;
          return (
            <Pressable key={r.id ?? i} style={styles.item} onPress={() => (r.status === 'READY' ? (r.fileId ? downloadAndShare(r.fileId, r.name ?? 'export.csv') : undefined) : undefined)}>
              <View style={[styles.itemIcon, { backgroundColor: TILE[i % TILE.length] }]}><Icon name="download" size={17} color={colors.text} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>Full export · {dayMonth(r.createdAt ?? r.at)}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>{st.sub}</Text>
              </View>
              <View style={[styles.chip, { backgroundColor: st.bg }]}><Text style={[styles.chipText, { color: st.fg }]}>{st.label}</Text></View>
            </Pressable>
          );
        }) : <EmptyState icon="download" title="No exports yet" subtitle="Request your first export below." />}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.cta, shadow.button]} onPress={() => requestExport()}>
          <Icon name="download" size={18} color={colors.onPrimary} />
          <Text style={styles.ctaText}>Request export</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 12 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6, marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  itemIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
