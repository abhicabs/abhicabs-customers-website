import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';

const TILE = ['#d9eafd', '#e9e3fc', '#fde8c9', '#d4f1e7'];
const chipFor = (st: string) => { const s = (st || '').toUpperCase(); if (s.includes('APPROV') || s.includes('ACTIVE') || s.includes('LIVE')) return { bg: '#e7f4ee', fg: '#127650', label: 'Approved' }; if (s.includes('PENDING') || s.includes('REVIEW')) return { bg: '#f0ecfb', fg: '#5b3fb8', label: 'Pending' }; if (s.includes('REJECT')) return { bg: '#fbebec', fg: '#b4323c', label: 'Rejected' }; return { bg: '#eef1f5', fg: '#44526a', label: 'Draft' }; };

export function AdminTemplatesScreen() {
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.admin.templates({}); setRows(Array.isArray(data) ? data : data.items ?? data.templates ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load templates.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Message templates</Text>
      </View>

      {error ? <ErrorState message={error} onRetry={load} /> : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {loading ? <EmptyState icon="loader" title="Loading…" /> : rows.length ? rows.map((t, i) => {
            const chip = chipFor(t.status ?? t.state ?? '');
            const isEmail = /EMAIL/i.test(t.channel ?? '');
            const icon: IconName = isEmail ? 'mail' : 'message-circle';
            return (
              <Pressable key={t.id ?? i} style={styles.item} onPress={() => navigation.navigate('ComingSoon', { title: t.name ?? t.purpose ?? 'Template' })}>
                <View style={[styles.tile, { backgroundColor: TILE[i % TILE.length] }]}><Icon name={icon} size={17} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{t.name ?? t.purposeLabel ?? t.purpose ?? 'Template'}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>{[isEmail ? 'Email' : 'WhatsApp', t.language ?? t.purpose].filter(Boolean).join(' · ')}</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: chip.bg }]}><Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text></View>
              </Pressable>
            );
          }) : <EmptyState icon="mail" title="No templates" subtitle="Message templates will appear here." />}
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
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  tile: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
});
