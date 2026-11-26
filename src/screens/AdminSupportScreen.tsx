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

const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayMonth = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const AV = ['#e9e3fc', '#d9eafd', '#d4f1e7', '#fde8c9'];
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

export function AdminSupportScreen() {
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.admin.supportGrants(); setRows(Array.isArray(data) ? data : data.items ?? data.grants ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load support access.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.navTitle}>Support access</Text>
      </View>
      {error ? <ErrorState message={error} onRetry={load} /> : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>ACTIVE GRANTS</Text>
          {loading ? <EmptyState icon="loader" title="Loading…" /> : rows.length ? rows.map((g, i) => {
            const account = g.accountName ?? g.advisorName ?? g.account ?? 'Account';
            const ends = g.endsAt ? `ends ${dayMonth(g.endsAt)}` : '';
            return (
              <View key={g.id ?? i} style={styles.item}>
                <View style={[styles.avatar, { backgroundColor: AV[i % AV.length] }]}><Text style={styles.avatarText}>{initials(account)}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{account}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>{[g.granteeName ?? g.grantee, ends, g.ticket ? `#${g.ticket}` : null].filter(Boolean).join(' · ') || 'Read only'}</Text>
                </View>
                <View style={styles.chip}><Text style={styles.chipText}>Active</Text></View>
              </View>
            );
          }) : <EmptyState icon="eye" title="No active grants" subtitle="Support access grants will appear here." />}
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
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontFamily: family.bold, color: colors.navy },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip: { backgroundColor: '#e7f4ee', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold, color: '#127650' },
});
