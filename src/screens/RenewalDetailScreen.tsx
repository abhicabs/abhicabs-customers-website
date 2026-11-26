import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { RenewalDetail } from '../api/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type R = RouteProp<AppStackParamList, 'RenewalDetail'>;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const longDate = (iso: string | null) => { if (!iso) return '—'; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]} ${d.getFullYear()}`; };
const shortDate = (iso: string) => { const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');
const STATUS_LABEL: Record<string, string> = { DUE: 'Due', IN_FOLLOW_UP: 'Follow-up', UPCOMING: 'Upcoming', LAPSED: 'Lapsed', RENEWED: 'Renewed', NOT_RENEWING: 'Not renewing' };

export function RenewalDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R>();
  const [r, setR] = useState<RenewalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.renewals.get(params.id); setR(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this renewal.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !r) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const overdue = r.daysLeft < 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.appbarTitle}>
          <Text style={styles.navName} numberOfLines={1}>{r.customer?.name ?? 'Renewal'}</Text>
          <Text style={styles.navSub} numberOfLines={1}>{r.policy?.product ?? r.policy?.insurer ?? ''} · renewal</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#fde8c9', '#fbd9b0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.countdown}>
          <View style={styles.cdRow}>
            <View style={styles.cdCircle}>
              <Text style={styles.cdNum}>{Math.abs(r.daysLeft)}</Text>
              <Text style={styles.cdDays}>{overdue ? 'late' : 'days'}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.cdTitle}>Renews {longDate(r.dueDate)}</Text>
              <Text style={styles.cdSub}>
                {r.graceUntil ? `Grace until ${shortDate(r.graceUntil)} · ` : ''}{rupees(r.premium)}
              </Text>
              <View style={styles.dueChip}>
                <Icon name="alert-circle" size={13} color="#8a5a12" />
                <Text style={styles.dueChipText}>{STATUS_LABEL[r.status] ?? r.status}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contacts</Text>
          {r.contacts?.length ? (
            r.contacts.slice().reverse().map((ct, i) => (
              <View key={i} style={styles.contactRow}>
                <View style={styles.contactIcon}><Icon name="phone" size={14} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactTitle} numberOfLines={1}>{ct.outcome}</Text>
                  <Text style={styles.contactSub} numberOfLines={1}>{shortDate(ct.at)}{ct.note ? ` · ${ct.note}` : ''}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>No contact logged yet.</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.sticky}>
        <Pressable style={styles.btnGhost} onPress={() => navigation.navigate('RenewalLogContact', { id: r.id, name: r.customer?.name, version: r.version })}>
          <Icon name="phone" size={18} color={colors.text} />
          <Text style={styles.btnGhostText}>Log contact</Text>
        </Pressable>
        <Pressable style={[styles.btnNavy, shadow.button]} onPress={() => navigation.navigate('HowToRenew', { id: r.id, subtitle: [r.customer?.name, r.policy?.product].filter(Boolean).join(' · ') })}>
          <Icon name="file-text" size={18} color={colors.onPrimary} />
          <Text style={styles.btnNavyText}>Renewal quote</Text>
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
  appbarTitle: { flex: 1, gap: 1 },
  navName: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 12 },
  countdown: { borderRadius: 22, padding: 16 },
  cdRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cdCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  cdNum: { fontSize: 22, fontFamily: family.bold, color: colors.text },
  cdDays: { fontSize: 10, fontFamily: family.semibold, color: '#8a5a12' },
  cdTitle: { fontSize: 16, fontFamily: family.bold, color: colors.text },
  cdSub: { fontSize: 12, fontFamily: family.medium, color: '#8a5a12' },
  dueChip: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: '#fbf1e1', paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: 14, marginTop: 2 },
  dueChipText: { fontSize: 12, fontFamily: family.semibold, color: '#8a5a12' },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 12 },
  cardTitle: { fontSize: 16, fontFamily: family.bold, color: colors.text },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  contactTitle: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  contactSub: { fontSize: 11, fontFamily: family.medium, color: colors.muted },
  empty: { fontSize: 13, fontFamily: family.medium, color: colors.muted },
  sticky: { flexDirection: 'row', gap: 10, backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  btnGhost: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 24 },
  btnGhostText: { fontSize: 14, fontFamily: family.semibold, color: colors.text },
  btnNavy: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, backgroundColor: colors.navy, borderRadius: 24 },
  btnNavyText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
