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
import { colors, family } from '../theme/theme';

const AV = ['#d9eafd', '#e9e3fc', '#fde8c9', '#d4f1e7', '#fbd5dd'];
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

export function ReferrersScreen() {
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.referrers.list(); setRows(Array.isArray(data) ? data : data.items ?? data.referrers ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load referrers.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });
  const disableReferrer = (r: any) => Alert.alert('Disable referrer?', `${r.name} will stop getting referrals.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Disable', style: 'destructive', onPress: async () => { try { await api.referrers.disable(r.id); load(); } catch (e) { Alert.alert('Failed', e instanceof ApiError ? e.message : 'Try again.'); } } }]);
  const newLink = (r: any) => Alert.alert('New referral link?', 'The old link stops working.', [{ text: 'Cancel', style: 'cancel' }, { text: 'New link', onPress: async () => { try { await api.referrers.newLink(r.id); load(); Alert.alert('Done', 'A new link was created.'); } catch (e) { Alert.alert('Failed', e instanceof ApiError ? e.message : 'Try again.'); } } }]);

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  const first = rows.find((r) => (r.status ?? 'ACTIVE') === 'ACTIVE');
  const firstName = first?.name?.split(' ')[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Referrers</Text>
          <Text style={styles.navSub}>{rows.length} referrer{rows.length === 1 ? '' : 's'}</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {rows.length ? rows.map((r, i) => {
          const name = r.name ?? 'Referrer';
          const status = r.status ?? 'ACTIVE';
          const code = r.link ?? r.code ?? r.referralCode;
          const refs = r.referralsCount ?? r.referrals ?? r.count;
          const sub = status === 'INVITED' ? 'Invite sent'
            : code ? `Link ${code}${typeof refs === 'number' ? ` · ${refs} referrals` : ''}`
            : typeof refs === 'number' ? `${refs} referrals` : '—';
          const chip = status === 'INVITED' ? { bg: '#e8f0fd', fg: '#1f5fd6', label: 'Invited' }
            : status === 'DISABLED' ? { bg: '#eef1f5', fg: '#44526a', label: 'Disabled' }
            : { bg: '#e7f4ee', fg: '#127650', label: 'Active' };
          return (
            <Pressable key={r.id ?? i} style={styles.item} onPress={() => soon(name)}>
              <View style={[styles.avatar, { backgroundColor: AV[i % AV.length] }]}><Text style={styles.avatarText}>{initials(name)}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{name}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>{sub}</Text>
              </View>
              <View style={[styles.chip, { backgroundColor: chip.bg }]}><Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text></View>
            </Pressable>
          );
        }) : <EmptyState icon="link" title="No referrers yet" subtitle="Add your first referrer below." />}

        {first ? (
          <>
            <Pressable style={styles.ghost} onPress={() => newLink(r)}>
              <Icon name="link" size={18} color={colors.text} />
              <Text style={styles.ghostText}>New link for {firstName}</Text>
            </Pressable>
            <Pressable style={styles.disable} onPress={() => disableReferrer(r)}>
              <Icon name="x" size={18} color={colors.red} />
              <Text style={styles.disableText}>Disable {firstName}</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => navigation.navigate('PersonForm', { kind: 'referrer', title: 'Add referrer', body: 'We send them an invite to sign in and get their link.', withNote: true })}>
          <LinearGradient colors={[colors.addFrom, colors.addTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.add}>
            <Icon name="user-plus" size={18} color={colors.navy} />
            <Text style={styles.addText}>Add referrer</Text>
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
  ghost: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 24 },
  ghostText: { fontSize: 15, fontFamily: family.semibold, color: colors.text },
  disable: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#f2c4c8', borderRadius: 24 },
  disableText: { fontSize: 15, fontFamily: family.semibold, color: colors.red },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  add: { height: 46, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addText: { fontSize: 14, fontFamily: family.semibold, color: colors.navy },
});
