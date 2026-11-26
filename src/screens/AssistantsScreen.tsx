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
import { relativeTime } from '../lib/format';
import { colors, family, shadow } from '../theme/theme';

const AV = ['#d9eafd', '#e9e3fc', '#fde8c9', '#d4f1e7'];
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

export function AssistantsScreen() {
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.assistants.list(); setRows(Array.isArray(data) ? data : data.items ?? data.assistants ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load assistants.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });
  const disableAssistant = (r: any) => Alert.alert('Disable assistant?', `${r.name} will lose access.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Disable', style: 'destructive', onPress: async () => { try { await api.assistants.disable(r.id); load(); } catch (e) { Alert.alert('Failed', e instanceof ApiError ? e.message : 'Try again.'); } } }]);

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  const active = rows.filter((r) => (r.status ?? 'ACTIVE') === 'ACTIVE');
  const firstActive = active[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Assistants</Text>
          <Text style={styles.navSub}>{active.length} of 2</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {rows.length ? rows.map((r, i) => {
          const name = r.name ?? 'Assistant';
          const disabled = (r.status ?? 'ACTIVE') !== 'ACTIVE';
          const chip = disabled ? { bg: '#eef1f5', fg: '#44526a', label: 'Disabled' } : { bg: '#e7f4ee', fg: '#127650', label: 'Active' };
          const last = r.lastActiveAt ? `last active ${relativeTime(r.lastActiveAt)}` : (r.mobile ?? '');
          return (
            <Pressable key={r.id ?? i} style={styles.item} onPress={() => soon(name)}>
              <View style={[styles.avatar, { backgroundColor: AV[i % AV.length] }]}><Text style={styles.avatarText}>{initials(name)}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{name}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>Assistant{last ? ` · ${last}` : ''}</Text>
              </View>
              <View style={[styles.chip, { backgroundColor: chip.bg }]}><Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text></View>
            </Pressable>
          );
        }) : <EmptyState icon="users" title="No assistants yet" subtitle="Invite someone to help run your desk." />}

        <View style={styles.note}>
          <Icon name="lock" size={16} color={colors.blue} />
          <Text style={styles.noteText}>Assistants can’t see commissions, change settings or submit proposals.</Text>
        </View>

        {firstActive ? (
          <Pressable style={styles.disable} onPress={() => disableAssistant(r)}>
            <Icon name="x" size={18} color={colors.red} />
            <Text style={styles.disableText}>Disable {firstActive.name?.split(' ')[0] ?? 'assistant'}</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => navigation.navigate('PersonForm', { kind: 'assistant', title: 'Add assistant', body: 'They sign in with this mobile number.' })}>
          <LinearGradient colors={[colors.addFrom, colors.addTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.add}>
            <Icon name="user-plus" size={18} color={colors.navy} />
            <Text style={styles.addText}>Invite assistant</Text>
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
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
  disable: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#f2c4c8', borderRadius: 24 },
  disableText: { fontSize: 15, fontFamily: family.semibold, color: colors.red },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  add: { height: 46, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addText: { fontSize: 14, fontFamily: family.semibold, color: colors.navy },
});
