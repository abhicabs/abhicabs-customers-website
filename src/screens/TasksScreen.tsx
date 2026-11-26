import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { FAB } from '../components/leads';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family } from '../theme/theme';
import type { Task, TaskTab, TaskListResult, Priority } from '../api/types';

const TABS: { key: TaskTab; label: string }[] = [
  { key: 'TODAY', label: 'Today' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'OVERDUE', label: 'Overdue' },
  { key: 'DONE', label: 'Done' },
  { key: 'CANCELLED', label: 'Cancelled' },
];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function whenLabel(iso: string) {
  const d = new Date(iso); const now = new Date();
  let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  const time = `${h}:${String(d.getMinutes()).padStart(2, '0')} ${ap}`;
  if (d.toDateString() === now.toDateString()) return `Today, ${time}`;
  const t = new Date(now); t.setDate(now.getDate() + 1);
  if (d.toDateString() === t.toDateString()) return `Tomorrow, ${time}`;
  return `${d.getDate()} ${MO[d.getMonth()]}, ${time}`;
}
const PRI: Record<Priority, { bg: string; fg: string; label: string }> = {
  HIGH: { bg: '#fbebec', fg: '#b4323c', label: 'High' },
  MEDIUM: { bg: '#fbf1e1', fg: '#8a5a12', label: 'Medium' },
  LOW: { bg: '#eef1f5', fg: '#44526a', label: 'Low' },
};
const STATUS: Record<string, { bg: string; fg: string; label: string }> = {
  OPEN: { bg: '#e8f0fd', fg: '#1f5fd6', label: 'Open' },
  DONE: { bg: '#e7f4ee', fg: '#127650', label: 'Done' },
  CANCELLED: { bg: '#eef1f5', fg: '#44526a', label: 'Cancelled' },
};

export function TasksScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<TaskTab>('TODAY');
  const [data, setData] = useState<TaskListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (t: TaskTab, mode?: 'refresh') => {
    if (mode !== 'refresh') setLoading(true);
    setError(null);
    try { const { data } = await api.tasks.list(t); setData(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load tasks.'); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(tab); }, [load, tab]));
  useEffect(() => { load(tab); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async (t: Task) => {
    setBusyId(t.id);
    try {
      if (t.status === 'DONE') await api.tasks.reopen(t.id, t.version);
      else await api.tasks.done(t.id, t.version);
      await load(tab, 'refresh');
    } catch { /* next refresh */ } finally { setBusyId(null); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Tasks</Text>
      </View>

      <View style={styles.chipsWrap}>
        <FlatList
          horizontal
          data={TABS}
          keyExtractor={(t) => t.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item: t }) => {
            const on = t.key === tab;
            const c = data?.counts?.[t.key];
            return (
              <Pressable onPress={() => setTab(t.key)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                <Text style={[styles.chipLabel, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.label}</Text>
                {typeof c === 'number' ? <Text style={[styles.chipCount, { color: on ? colors.onPrimary : (t.key === 'OVERDUE' ? '#b4323c' : colors.muted) }]}>{c}</Text> : null}
              </Pressable>
            );
          }}
        />
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => load(tab)} />
      ) : (
        <FlatList
          data={loading ? [] : data?.tasks ?? []}
          keyExtractor={(t) => t.id}
          style={styles.flex1}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={false}
          onRefresh={() => load(tab, 'refresh')}
          renderItem={({ item }) => {
            const done = item.status === 'DONE';
            const canToggle = tab !== 'CANCELLED';
            const pri = PRI[item.priority];
            const st = STATUS[item.status] ?? STATUS.OPEN;
            return (
              <View style={styles.card}>
                <View style={styles.row1}>
                  <Pressable disabled={!canToggle || busyId === item.id} onPress={() => toggle(item)} hitSlop={8} style={[styles.check, done && styles.checkDone]}>
                    {busyId === item.id ? <ActivityIndicator size="small" color={colors.blue} /> : done ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}
                  </Pressable>
                  <Pressable style={styles.titleCol} onPress={() => navigation.navigate('AddTask', { task: item })}>
                    <Text style={[styles.title, done && styles.titleDone]} numberOfLines={1}>{item.title}</Text>
                    {item.linked?.name ? (
                      <Text style={styles.linked} numberOfLines={1}>
                        {item.linked.name}{item.linked.type === 'LEAD' ? ' · Lead' : ' · Policy holder'}
                      </Text>
                    ) : null}
                  </Pressable>
                  <Pressable style={styles.moreBtn} hitSlop={4} onPress={() => navigation.navigate('RescheduleTask', { id: item.id, title: item.title, version: item.version })}>
                    <Icon name="more-horizontal" size={19} color={colors.text} />
                  </Pressable>
                </View>
                <View style={styles.row2}>
                  <Icon name="clock" size={12} color={item.overdue ? '#b4323c' : '#44526a'} />
                  <Text style={[styles.when, { color: item.overdue ? '#b4323c' : '#44526a' }]}>{whenLabel(item.dueAt)}</Text>
                  <View style={[styles.chipTag, { backgroundColor: pri.bg }]}><Text style={[styles.chipTagText, { color: pri.fg }]}>{pri.label}</Text></View>
                  <View style={[styles.chipTag, { backgroundColor: st.bg }]}><Text style={[styles.chipTagText, { color: st.fg }]}>{st.label}</Text></View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={loading ? <EmptyState icon="loader" title="Loading…" /> : <EmptyState title="Nothing here" subtitle="No tasks in this tab." />}
        />
      )}

      <FAB bottom={28} onPress={() => navigation.navigate('AddTask')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  chipsWrap: { paddingTop: 12, paddingBottom: 10 },
  chips: { gap: 6, paddingHorizontal: 16, alignItems: 'flex-start' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.surface },
  chipLabel: { fontSize: 12, fontFamily: family.semibold },
  chipCount: { fontSize: 11, fontFamily: family.bold },
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 14, gap: 8 },
  row1: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: '#c3ccd8', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: colors.green, borderColor: colors.green },
  titleCol: { flex: 1, gap: 3 },
  title: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  titleDone: { textDecorationLine: 'line-through', color: colors.muted },
  linked: { fontSize: 12, fontFamily: family.semibold, color: colors.blue },
  moreBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  row2: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  when: { fontSize: 11, fontFamily: family.semibold },
  chipTag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipTagText: { fontSize: 12, fontFamily: family.semibold },
});
