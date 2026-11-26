import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState } from '../components/ui';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { DocVersion } from '../api/types';

type R = RouteProp<AppStackParamList, 'DocumentVersions'>;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayMonth = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const AV = ['#d9eafd', '#e9e3fc', '#d4f1e7', '#fde8c9'];
const chipFor = (st?: string) => (st === 'CONFIRMED' || st === 'VERIFIED' ? { bg: '#e7f4ee', fg: '#127650', label: 'Confirmed' } : st === 'REJECTED' ? { bg: '#fbebec', fg: '#b4323c', label: 'Rejected' } : { bg: '#fbf1e1', fg: '#8a5a12', label: 'Unconfirmed' });

export function DocumentVersionsScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const group = params.group ?? {};
  const versions: DocVersion[] = [...(group.versions ?? [])].sort((a: DocVersion, b: DocVersion) => (b.version ?? 0) - (a.version ?? 0));
  const latest = versions[0];
  const label = latest?.label ?? group.name ?? group.type ?? 'Document';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle} numberOfLines={1}>{group.type ?? 'Document'} versions</Text>
          <Text style={styles.navSub} numberOfLines={1}>{group.personName ?? ''} · never deleted</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {versions.length ? versions.map((v, i) => {
          const chip = chipFor(v.status);
          return (
            <Pressable key={v.id ?? i} style={styles.item} disabled={i !== 0 || v.status === 'CONFIRMED'} onPress={() => navigation.navigate('CheckValues', { docId: v.id })}>
              <View style={[styles.avatar, { backgroundColor: AV[i % AV.length] }]}><Text style={styles.avatarText}>V{v.version}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{i === 0 ? 'Current version' : 'Earlier version'}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>{[dayMonth(v.uploadedAt), (v as any).uploadedBy].filter(Boolean).join(' · ') || '—'}</Text>
              </View>
              <View style={[styles.chip, { backgroundColor: chip.bg }]}><Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text></View>
            </Pressable>
          );
        }) : <EmptyState icon="folder" title="No versions" subtitle="Upload a document to start." />}

        <View style={styles.kv}>
          <Text style={styles.kvLabel}>Label</Text>
          <Text style={styles.kvValue}>{label}</Text>
        </View>

        {latest ? (
          <Pressable style={styles.change} onPress={() => navigation.navigate('ChangeLabel', { docId: latest.id, rev: latest.rev, current: label })}>
            <Icon name="edit-3" size={18} color={colors.text} /><Text style={styles.changeText}>Change label</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.cta, shadow.button]} onPress={() => navigation.navigate('AddDocument', { customerId: params.customerId })}>
          <Icon name="upload" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>Upload new version</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
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
  kv: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: 22, padding: 16 },
  kvLabel: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.muted },
  kvValue: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  change: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 24 },
  changeText: { fontSize: 15, fontFamily: family.semibold, color: colors.text },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
