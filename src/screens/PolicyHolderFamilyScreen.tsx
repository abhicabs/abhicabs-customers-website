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
import type { CustomerDetail } from '../api/types';

type R = RouteProp<AppStackParamList, 'PolicyHolderFamily'>;
const AV = ['#fbd5dd', '#d9eafd', '#d4f1e7', '#fde8c9', '#e9e3fc'];
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

export function PolicyHolderFamilyScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [c, setC] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.customers.get(params.id); setC(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load family.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !c) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ProfileHeader c={c} active="Family" />
        <View style={styles.list}>
          {c.family?.length ? c.family.map((m, i) => (
            <View key={m.id} style={styles.card}>
              <View style={styles.memberRow}>
                <View style={[styles.avatar, { backgroundColor: AV[i % AV.length] }]}>
                  <Text style={styles.avatarText}>{initials(m.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>{m.name}</Text>
                  <Text style={[styles.sub, m.status !== 'ACTIVE' && { color: colors.muted }]} numberOfLines={1}>
                    {[m.relationship, m.age ? `${m.age}` : null].filter(Boolean).join(' · ')}
                    {m.status !== 'ACTIVE' ? ' · inactive' : ''}
                  </Text>
                </View>
                <Pressable hitSlop={8} onPress={() => navigation.navigate('FamilyMemberForm', { customerId: params.id, memberId: m.id, member: m })}>
                  <Icon name="more-horizontal" size={18} color={colors.muted} />
                </Pressable>
              </View>
              <View style={styles.docRow}>
                <View style={{ flex: 1 }} />
                <Pressable style={styles.addDoc} onPress={() => navigation.navigate('AddDocument', { customerId: params.id })}>
                  <Icon name="plus" size={12} color={colors.blue} />
                  <Text style={styles.addDocText}>Document</Text>
                </Pressable>
              </View>
            </View>
          )) : (
            <EmptyState icon="users" title="No family members" subtitle="Add the first member below." />
          )}

          <Pressable onPress={() => navigation.navigate('FamilyMemberForm', { customerId: params.id })}>
            <LinearGradient colors={[colors.addFrom, colors.addTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addBtn}>
              <Icon name="user-plus" size={18} color={colors.navy} />
              <Text style={styles.addBtnText}>Add family member</Text>
            </LinearGradient>
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
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 14, gap: 10 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontFamily: family.bold, color: colors.navy },
  name: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  docRow: { flexDirection: 'row', alignItems: 'center' },
  addDoc: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  addDocText: { fontSize: 11, fontFamily: family.bold, color: colors.blue },
  addBtn: { height: 46, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addBtnText: { fontSize: 14, fontFamily: family.semibold, color: colors.navy },
});
