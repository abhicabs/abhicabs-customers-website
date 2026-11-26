import React, { useCallback, useMemo, useState } from 'react';
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
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerDetail, CustomerDocuments, DocGroup } from '../api/types';

type R = RouteProp<AppStackParamList, 'PolicyHolderDocuments'>;
const ID_TYPES = ['Aadhaar', 'PAN'];

function statusChip(g: DocGroup) {
  const st = g.versions?.[0]?.status;
  if (st === 'UNCONFIRMED') return { bg: '#fbf1e1', fg: '#8a5a12', label: 'Check' };
  if (st === 'CONFIRMED' && ID_TYPES.includes(g.type)) return { bg: '#e7f4ee', fg: '#127650', label: 'Confirmed' };
  return { bg: '#eef1f5', fg: '#44526a', label: 'Saved' };
}
const statusLabel = (s?: string) => (s === 'CONFIRMED' ? 'Confirmed' : s === 'UNCONFIRMED' ? 'Unconfirmed' : 'Saved');

export function PolicyHolderDocumentsScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [c, setC] = useState<CustomerDetail | null>(null);
  const [docs, setDocs] = useState<CustomerDocuments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [cu, dc] = await Promise.all([api.customers.get(params.id), api.customers.documents(params.id)]);
      setC(cu.data); setDocs(dc.data);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load documents.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });

  // Group series by person, keeping order
  const byPerson = useMemo(() => {
    const map = new Map<string, DocGroup[]>();
    for (const g of docs?.groups ?? []) {
      if (!map.has(g.personName)) map.set(g.personName, []);
      map.get(g.personName)!.push(g);
    }
    return [...map.entries()];
  }, [docs]);

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !c) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ProfileHeader c={c} active="Documents" />
        <View style={styles.list}>
          {docs?.missing ? (
            <View style={styles.note}>
              <Icon name="alert-triangle" size={16} color="#8a5a12" />
              <Text style={styles.noteText} numberOfLines={2}>{docs.missing.message || `Missing: ${docs.missing.items.join(', ')}`}</Text>
            </View>
          ) : null}

          {byPerson.length ? byPerson.map(([person, groups]) => (
            <View key={person} style={styles.group}>
              <Text style={styles.groupLabel}>{person.toUpperCase()}</Text>
              {groups.map((g, i) => {
                const chip = statusChip(g);
                const v = g.versions?.[0];
                return (
                  <Pressable key={`${person}-${g.type}-${i}`} style={styles.docRow} onPress={() => navigation.navigate('DocumentVersions', { customerId: params.id, group: g })}>
                    <View style={styles.folder}><Icon name="folder" size={16} color={colors.text} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.docName} numberOfLines={1}>{g.name || g.type}</Text>
                      <Text style={styles.docSub} numberOfLines={1}>v{v?.version ?? 1} · {statusLabel(v?.status)}</Text>
                    </View>
                    <View style={[styles.chip, { backgroundColor: chip.bg }]}>
                      <Text style={[styles.chipText, { color: chip.fg }]}>{chip.label}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )) : (
            <EmptyState icon="folder" title="No documents" subtitle="Add the first document below." />
          )}

          <Pressable onPress={() => navigation.navigate('AddDocument', { customerId: params.id })}>
            <View style={[styles.addBtn, shadow.button]}>
              <Icon name="upload" size={18} color={colors.onPrimary} />
              <Text style={styles.addBtnText}>Add document</Text>
            </View>
          </Pressable>
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
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fbf1e1', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: '#8a5a12' },
  group: { gap: 10 },
  groupLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  folder: { width: 38, height: 46, borderRadius: 10, backgroundColor: '#fde8ec', alignItems: 'center', justifyContent: 'center' },
  docName: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  docSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  addBtn: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  addBtnText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
