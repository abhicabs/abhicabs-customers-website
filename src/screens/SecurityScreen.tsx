import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { relativeTime } from '../lib/format';
import { colors, family, shadow } from '../theme/theme';

const TILE = ['#d9eafd', '#e9e3fc', '#fde8c9', '#d4f1e7'];
const isMobile = (d: string) => /phone|iphone|pixel|android|mobile|ios/i.test(d || '');

export function SecurityScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.sessions.list(); setRows(Array.isArray(data) ? data : data.sessions ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load sessions.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const isCurrent = (s: any) => s.current || s.isCurrent || s.id === user?.sessionId;
  const endOne = async (id: string) => { try { await api.sessions.end(id); await load(); } catch (e) { Alert.alert('Could not sign out', e instanceof ApiError ? e.message : 'Try again.'); } };
  const endOthers = () => {
    const others = rows.filter((s) => !isCurrent(s));
    if (!others.length) return;
    Alert.alert('Sign out other devices', `This signs out ${others.length} other ${others.length === 1 ? 'device' : 'devices'}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => { setBusy(true); for (const s of others) await api.sessions.end(s.id).catch(() => undefined); await load(); setBusy(false); } },
    ]);
  };

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  const others = rows.filter((s) => !isCurrent(s)).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Security</Text>
          <Text style={styles.navSub}>{rows.length} device{rows.length === 1 ? '' : 's'}</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>SIGNED IN ON</Text>
        {rows.map((s, i) => {
          const cur = isCurrent(s);
          const device = s.device ?? s.name ?? s.userAgent ?? 'Device';
          const loc = [s.location ?? s.city, cur ? 'now' : relativeTime(s.lastActiveAt ?? s.at ?? s.createdAt ?? new Date().toISOString())].filter(Boolean).join(' · ');
          const icon: IconName = isMobile(device) ? 'phone' : 'grid';
          return (
            <Pressable key={s.id ?? i} style={styles.item} disabled={cur} onPress={() => Alert.alert(device, loc, cur ? [{ text: 'OK' }] : [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: () => endOne(s.id) }])}>
              <View style={[styles.tile, { backgroundColor: TILE[i % TILE.length] }]}><Icon name={icon} size={17} color={colors.text} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{device}{cur ? ' · this device' : ''}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>{loc}</Text>
              </View>
              {cur ? <View style={styles.thisChip}><Text style={styles.thisChipText}>This device</Text></View> : <Icon name="chevron-right" size={16} color={colors.grayBar} />}
            </Pressable>
          );
        })}

        {others > 0 ? (
          <Pressable style={[styles.signOut, busy && { opacity: 0.6 }]} disabled={busy} onPress={endOthers}>
            <Icon name="log-out" size={18} color={colors.red} />
            <Text style={styles.signOutText}>{busy ? 'Signing out…' : 'Sign out other devices'}</Text>
          </Pressable>
        ) : null}
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
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  tile: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  thisChip: { backgroundColor: '#e7f4ee', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  thisChipText: { fontSize: 12, fontFamily: family.semibold, color: '#127650' },
  signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#f2c4c8', borderRadius: 24 },
  signOutText: { fontSize: 15, fontFamily: family.semibold, color: colors.red },
});
