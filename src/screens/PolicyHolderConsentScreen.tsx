import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { ProfileHeader } from '../components/ProfileHeader';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerDetail, Consents, ConsentCell } from '../api/types';

type R = RouteProp<AppStackParamList, 'PolicyHolderConsent'>;
const AV = ['#fbd5dd', '#d9eafd', '#d4f1e7', '#fde8c9', '#e9e3fc'];
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
const CHANNELS: { key: string; label: string }[] = [
  { key: 'WHATSAPP', label: 'WhatsApp' },
  { key: 'EMAIL', label: 'Email' },
  { key: 'SMS', label: 'SMS' },
];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (iso?: string | null) => { if (!iso) return null; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const chipFor = (status?: string) => {
  if (status === 'GIVEN') return { bg: '#e7f4ee', fg: '#127650', label: 'Given', given: true };
  if (status === 'WITHDRAWN') return { bg: '#fbebec', fg: '#b4323c', label: 'Withdrawn', given: false };
  return { bg: '#eef1f5', fg: '#44526a', label: 'Not recorded', given: false };
};

export function PolicyHolderConsentScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [c, setC] = useState<CustomerDetail | null>(null);
  const [cons, setCons] = useState<Consents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [cu, co] = await Promise.all([api.customers.get(params.id), api.customers.consents(params.id)]);
      setC(cu.data); setCons(co.data);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load consent.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !c) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const pd = cons?.personalData as ConsentCell | undefined;
  const pdStatus = pd?.status === 'GIVEN' ? 'given' : pd?.status === 'WITHDRAWN' ? 'withdrawn' : 'not recorded';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ProfileHeader c={c} active="Consent" />
        <View style={styles.list}>
          <LinearGradient colors={['#d4f1e7', '#b9e8d7']} style={styles.pd}>
            <View style={styles.pdRow}>
              <Icon name="lock" size={18} color={colors.text} />
              <Text style={styles.pdTitle}>Personal data consent: {pdStatus}</Text>
            </View>
            {shortDate(pd?.at) ? <Text style={styles.pdSub}>{shortDate(pd?.at)} · recorded</Text> : null}
          </LinearGradient>

          {cons?.rows?.length ? cons.rows.map((row, i) => (
            <View key={row.person.id} style={styles.card}>
              <View style={styles.personRow}>
                <View style={[styles.avatar, { backgroundColor: AV[i % AV.length] }]}>
                  <Text style={styles.avatarText}>{initials(row.person.name)}</Text>
                </View>
                <Text style={styles.personName}>{row.person.name}</Text>
              </View>
              {CHANNELS.map((ch) => {
                const cell = row.channels?.[ch.key];
                const chip = chipFor(cell?.status);
                return (
                  <View key={ch.key} style={styles.chRow}>
                    <Text style={styles.chLabel}>{ch.label}</Text>
                    <View style={[styles.chip, { backgroundColor: chip.bg }]}>
                      <Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text>
                    </View>
                    <Pressable hitSlop={6} onPress={() => navigation.navigate(chip.given ? 'WithdrawConsent' : 'RecordConsent', { customerId: params.id, personType: row.person.type === 'FAMILY' ? 'FAMILY' : 'CUSTOMER', personId: row.person.id, personName: row.person.name, channel: ch.key })}>
                      <Text style={styles.action}>{chip.given ? 'Withdraw' : 'Record'}</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )) : (
            <EmptyState icon="shield" title="No consent records" />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  body: { paddingBottom: 40 },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  pd: { borderRadius: 22, padding: 16, gap: 4 },
  pdRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pdTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  pdSub: { fontSize: 12, fontFamily: family.medium, color: '#2f6b55' },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 14, gap: 8 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 10, fontFamily: family.bold, color: colors.navy },
  personName: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  chRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chLabel: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.muted },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  action: { fontSize: 12, fontFamily: family.bold, color: colors.blue, paddingLeft: 8 },
});
