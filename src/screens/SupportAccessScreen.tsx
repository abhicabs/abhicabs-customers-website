import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';

const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const timeOf = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${String(h).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${ap}`; };
const endsLabel = (iso?: string | null) => { if (!iso) return null; const d = new Date(iso); return `ends ${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}, ${timeOf(iso)}`; };

export function SupportAccessScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.supportAccess.list(); setData(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load support access.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });
  const endGrant = (r: any) => Alert.alert('End support access?', 'SkyUp staff will lose access to your account.', [{ text: 'Cancel', style: 'cancel' }, { text: 'End', style: 'destructive', onPress: async () => { try { await api.supportAccess.end(r?.id); load(); } catch (e) { Alert.alert('Failed', e instanceof ApiError ? e.message : 'Try again.'); } } }]);

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  const grants: any[] = Array.isArray(data) ? data : data?.grants ?? (data?.grant ? [data.grant] : []);
  const grant = grants.find((g) => (g.status ?? (g.active ? 'ACTIVE' : '')) === 'ACTIVE' || g.active) ?? grants[0];
  const active = grant && (grant.status === 'ACTIVE' || grant.active || (grant.endsAt && new Date(grant.endsAt) > new Date()));
  const records: any[] = (grant?.records ?? grant?.accessed ?? data?.records ?? []) as any[];
  const grantee = grant?.granteeName ?? grant?.grantee ?? grant?.name ?? 'SkyUp support';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Support access</Text>
          <Text style={styles.navSub}>{active ? 'Active grant' : 'No active grant'}</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {active ? (
          <>
            <LinearGradient colors={['#e9e3fc', '#dcd2fb']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.hero}>
              <View style={styles.chip}><Icon name="eye" size={13} color="#127650" /><Text style={styles.chipText}>Active</Text></View>
              <Text style={styles.heroTitle}>{grantee} (SkyUp) can view your account</Text>
              <Text style={styles.heroSub}>Read only{endsLabel(grant.endsAt) ? ` · ${endsLabel(grant.endsAt)}` : ''}{grant.ticket ? ` · ticket #${grant.ticket}` : ''}</Text>
            </LinearGradient>
            <Pressable style={styles.end} onPress={() => endGrant(records[0])}>
              <Icon name="x" size={18} color={colors.red} />
              <Text style={styles.endText}>End access now</Text>
            </Pressable>
            {records.length ? (
              <>
                <Text style={styles.sectionLabel}>RECORDS THEY OPENED</Text>
                {records.map((r, i) => {
                  const isQuote = /QT|quot/i.test(r.type ?? r.id ?? '');
                  const icon: IconName = isQuote ? 'file-text' : 'users';
                  return (
                    <View key={r.id ?? i} style={styles.item}>
                      <View style={[styles.itemIcon, { backgroundColor: isQuote ? '#d9eafd' : '#e9e3fc' }]}><Icon name={icon} size={17} color={colors.text} /></View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{r.label ?? r.id ?? 'Record'}</Text>
                        <Text style={styles.itemSub}>{timeOf(r.at)}</Text>
                      </View>
                      <Icon name="chevron-right" size={16} color={colors.grayBar} />
                    </View>
                  );
                })}
              </>
            ) : null}
          </>
        ) : (
          <EmptyState icon="eye" title="No active grant" subtitle="Give SkyUp read-only access to help with a ticket." />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.cta, shadow.button]} onPress={() => navigation.navigate('GiveAccess')}>
          <Icon name="eye" size={18} color={colors.onPrimary} />
          <Text style={styles.ctaText}>Give access</Text>
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
  hero: { borderRadius: 22, padding: 16, gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: '#e7f4ee', paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold, color: '#127650' },
  heroTitle: { fontSize: 18, lineHeight: 24, fontFamily: family.bold, color: colors.text },
  heroSub: { fontSize: 12, lineHeight: 18, fontFamily: family.medium, color: '#5b3fb8' },
  end: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#f2c4c8', borderRadius: 24 },
  endText: { fontSize: 15, fontFamily: family.semibold, color: colors.red },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6, marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  itemIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
