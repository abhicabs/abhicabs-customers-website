import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { ProfileHeader } from '../components/ProfileHeader';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerDetail } from '../api/types';

type R = RouteProp<AppStackParamList, 'PolicyHolderDetail'>;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dateLong = (iso: string | null) => { if (!iso) return '—'; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]} ${d.getFullYear()}`; };

export function PolicyHolderDetailScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [c, setC] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPan, setShowPan] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.customers.get(params.id); setC(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this policy holder.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });
  const mask = (v: string) => (v.length <= 4 ? '••••' : `${'•'.repeat(Math.max(2, v.length - 4))} ${v.slice(-4)}`);

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !c) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const city = c.address?.city ?? c.city ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ProfileHeader c={c} active="Overview" />
        <View style={styles.list}>
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Details</Text>
              <Pressable onPress={() => navigation.navigate('EditPolicyHolder', { id: params.id })}><Text style={styles.editLink}>Edit</Text></Pressable>
            </View>
            <Row label="Mobile" value={c.mobile} />
            {c.email ? <Row label="Email" value={c.email} /> : null}
            <Row label="Date of birth" value={dateLong(c.dob)} />
            {c.preferredContact ? <Row label="Preferred" value={c.preferredContact} /> : null}
            {city ? <Row label="City" value={city} /> : null}
          </View>

          {(c.identity?.pan || c.identity?.aadhaar) ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Identity numbers</Text>
              {c.identity.pan ? <IdRow label="PAN" value={c.identity.pan} shown={showPan} onToggle={() => setShowPan((s) => !s)} mask={mask} /> : null}
              {c.identity.aadhaar ? <IdRow label="Aadhaar" value={c.identity.aadhaar} shown={showAadhaar} onToggle={() => setShowAadhaar((s) => !s)} mask={mask} /> : null}
              <Text style={styles.idNote}>Showing is recorded and hides after a short time.</Text>
            </View>
          ) : null}

          {c.leads?.length ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Open items</Text>
              {c.leads.map((l) => (
                <Pressable key={l.id} style={styles.openRow} onPress={() => navigation.navigate('LeadDetail', { id: l.id })}>
                  <View style={styles.openIcon}><Icon name="columns" size={15} color={colors.text} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.openTitle} numberOfLines={1}>{l.number}</Text>
                    <Text style={styles.openSub} numberOfLines={1}>Lead · {l.status}</Text>
                  </View>
                  <Icon name="chevron-right" size={16} color={colors.grayBar} />
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}
function IdRow({ label, value, shown, onToggle, mask }: { label: string; value: string; shown: boolean; onToggle: () => void; mask: (v: string) => string }) {
  return (
    <View style={styles.idRow}>
      <Icon name="lock" size={16} color={colors.muted} />
      <View style={{ flex: 1 }}>
        <Text style={styles.idLabel}>{label}</Text>
        <Text style={styles.idValue}>{shown ? value : mask(value)}</Text>
      </View>
      <Pressable style={styles.showBtn} onPress={onToggle}>
        <Icon name={shown ? 'eye-off' : 'eye'} size={16} color={colors.text} />
        <Text style={styles.showText}>{shown ? 'Hide' : 'Show'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  body: { paddingBottom: 40 },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', paddingTop: 4, paddingHorizontal: 2 },
  cardTitle: { flex: 1, fontSize: 16, fontFamily: family.bold, color: colors.text },
  editLink: { fontSize: 13, fontFamily: family.bold, color: colors.blue },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.muted },
  rowValue: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.bg, borderRadius: 14, padding: 12 },
  idLabel: { fontSize: 11, fontFamily: family.medium, color: colors.muted },
  idValue: { fontSize: 15, fontFamily: family.bold, color: colors.text, letterSpacing: 0.6 },
  showBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 36, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingLeft: 12, paddingRight: 14 },
  showText: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  idNote: { fontSize: 11, fontFamily: family.medium, color: colors.muted },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  openIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e9e3fc', alignItems: 'center', justifyContent: 'center' },
  openTitle: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  openSub: { fontSize: 11, fontFamily: family.medium, color: colors.muted },
});
