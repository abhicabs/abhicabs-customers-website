import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';

const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthYear = (iso?: string | null) => { if (!iso) return null; const d = new Date(iso); return `${MO[d.getMonth()]} ${d.getFullYear()}`; };
const dayMonth = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const AV = ['#d9eafd', '#e9e3fc', '#fde8c9', '#d4f1e7', '#fbd5dd'];
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

export function MyInsurersScreen() {
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.myInsurers.list(); setRows(Array.isArray(data) ? data : data.items ?? data.insurers ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load insurers.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });
  const deactivate = (r: any) => Alert.alert('Deactivate insurer?', `${r.name} will be hidden from new quotes.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Deactivate', style: 'destructive', onPress: async () => { try { await api.myInsurers.deactivate(r.id, {}); load(); } catch (e) { Alert.alert('Failed', e instanceof ApiError ? e.message : 'Try again.'); } } }]);
  const activeCount = rows.filter((r) => (r.status ?? 'ACTIVE') === 'ACTIVE').length;

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>My insurers</Text>
          <Text style={styles.navSub}>{activeCount} active</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {rows.length ? rows.map((r, i) => {
          const expired = r.status === 'EXPIRED' || r.agentCodeStatus === 'EXPIRED';
          const name = r.name ?? r.insurer ?? 'Insurer';
          const code = r.agentCode ?? r.code;
          const sub = expired ? `Code expired ${dayMonth(r.validUntil ?? r.expiredAt)}` : [code, monthYear(r.validUntil) ? `till ${monthYear(r.validUntil)}` : null].filter(Boolean).join(' · ') || '—';
          const chip = expired ? { bg: '#fbf1e1', fg: '#8a5a12', label: 'Expired' } : (r.status === 'INACTIVE' ? { bg: '#eef1f5', fg: '#44526a', label: 'Inactive' } : { bg: '#e7f4ee', fg: '#127650', label: 'Active' });
          return (
            <Pressable key={r.id ?? i} style={styles.item} onPress={() => deactivate(r)}>
              <View style={[styles.avatar, { backgroundColor: AV[i % AV.length] }]}><Text style={styles.avatarText}>{initials(name)}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{name}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>{sub}</Text>
              </View>
              <View style={[styles.chip, { backgroundColor: chip.bg }]}><Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text></View>
            </Pressable>
          );
        }) : <EmptyState icon="box" title="No insurers yet" subtitle="Add your first insurer below." />}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => navigation.navigate('AddInsurer')}>
          <LinearGradient colors={[colors.addFrom, colors.addTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.add}>
            <Icon name="plus" size={18} color={colors.navy} />
            <Text style={styles.addText}>Add insurer</Text>
          </LinearGradient>
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
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontFamily: family.bold, color: colors.navy },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  add: { height: 46, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addText: { fontSize: 14, fontFamily: family.semibold, color: colors.navy },
});
