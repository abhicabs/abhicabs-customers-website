import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';

const TABS = [
  { key: 'ALL', label: 'All' }, { key: 'LEADS', label: 'Leads' }, { key: 'CUSTOMERS', label: 'Policy holders' }, { key: 'QUOTATIONS', label: 'Quotes' }, { key: 'POLICIES', label: 'Policies' },
];
const GROUP_LABEL: Record<string, string> = { LEADS: 'LEADS', CUSTOMERS: 'POLICY HOLDERS', QUOTATIONS: 'QUOTES', POLICIES: 'POLICIES' };
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
const AV = ['#d9eafd', '#e9e3fc', '#d4f1e7', '#fde8c9', '#fbd5dd'];

export function SearchScreen() {
  const navigation = useNavigation<any>();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('ALL');
  const [groups, setGroups] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const text = q.trim();
    if (text.length < 2) { setGroups([]); setCount(0); setHint(null); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const { data } = await api.search.query(text);
        const g = Array.isArray(data?.groups) ? data.groups.filter((x: any) => Array.isArray(x.items) && x.items.length) : [];
        setGroups(g); setCount(data?.count ?? g.reduce((s: number, x: any) => s + x.items.length, 0)); setHint(null);
      } catch (e) {
        setGroups([]); setCount(0);
        setHint(e instanceof ApiError ? e.message : null);
      } finally { setLoading(false); }
    }, 300);
    return () => timer.current && clearTimeout(timer.current);
  }, [q]);

  const visible = useMemo(() => (tab === 'ALL' ? groups : groups.filter((g) => g.group === tab)), [groups, tab]);

  const open = (item: any) => {
    const o = item.open ?? { type: item.type, id: item.id };
    if (o.type === 'LEAD') navigation.navigate('LeadDetail', { id: o.id, name: item.title });
    else if (o.type === 'CUSTOMER') navigation.navigate('PolicyHolderDetail', { id: o.id, name: item.title });
    else if (o.type === 'QUOTATION') navigation.navigate('QuoteDetail', { id: o.id, number: item.title });
    else if (o.type === 'POLICY') navigation.navigate('PolicyDetail', { id: o.id });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.navTitle}>Search</Text>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.search}>
          <Icon name="search" size={18} color={colors.grayBar} />
          <TextInput value={q} onChangeText={setQ} placeholder="Name, number, policy…" placeholderTextColor={colors.grayBar} style={styles.searchInput} selectionColor={colors.blue} autoFocus autoCapitalize="none" autoCorrect={false} />
          {q ? <Pressable hitSlop={8} onPress={() => setQ('')}><Icon name="x" size={16} color={colors.grayBar} /></Pressable> : null}
        </View>
      </View>

      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {TABS.map((t) => { const on = t.key === tab; return (
            <Pressable key={t.key} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setTab(t.key)}><Text style={[styles.chipText, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.label}</Text></Pressable>
          ); })}
        </ScrollView>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {q.trim().length < 2 ? <EmptyState icon="search" title="Search everything" subtitle="Find leads, policy holders, quotes and policies." />
          : loading ? <View style={styles.loader}><ActivityIndicator color={colors.blue} /></View>
          : visible.length ? visible.map((grp) => (
            <View key={grp.group} style={{ gap: 10 }}>
              <Text style={styles.sectionLabel}>{GROUP_LABEL[grp.group] ?? grp.group}</Text>
              {grp.items.map((item: any, i: number) => (
                <Pressable key={item.id ?? i} style={styles.item} onPress={() => open(item)}>
                  {grp.group === 'QUOTATIONS' ? <View style={styles.fileTile}><Icon name="file-text" size={16} color={colors.text} /></View>
                    : <View style={[styles.avatar, { backgroundColor: AV[i % AV.length] }]}><Text style={styles.avatarText}>{initials(item.title)}</Text></View>}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    {item.subtitle ? <Text style={styles.itemSub} numberOfLines={1}>{item.subtitle}</Text> : null}
                  </View>
                  <Icon name="chevron-right" size={16} color={colors.grayBar} />
                </Pressable>
              ))}
            </View>
          )) : <EmptyState icon="search" title="No results" subtitle={hint ?? `Nothing matches “${q.trim()}”.`} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 6 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 10 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, backgroundColor: colors.surface, borderRadius: 24, paddingHorizontal: 16 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: family.medium, color: colors.text, padding: 0 },
  chipsWrap: { paddingBottom: 10 },
  chips: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, alignItems: 'flex-start' },
  chip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  body: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },
  loader: { paddingVertical: 40, alignItems: 'center' },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontFamily: family.bold, color: colors.navy },
  fileTile: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#d9eafd', alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
});
