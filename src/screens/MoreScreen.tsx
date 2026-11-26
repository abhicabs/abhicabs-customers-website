import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon, type IconName } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/endpoints';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type Row = { icon: IconName; label: string; route?: keyof AppStackParamList; count?: string; danger?: boolean; action?: 'logout' };

export function MoreScreen() {
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuth();
  const isStaff = user?.role === 'ADM' || user?.role === 'STF';
  const [tasksToday, setTasksToday] = useState<string | undefined>();
  const [unread, setUnread] = useState<string | undefined>();
  const [renewalsDue, setRenewalsDue] = useState<string | undefined>();

  useEffect(() => {
    api.tasks.list('TODAY').then((r) => { const n = r.data.counts.TODAY; if (n) setTasksToday(`${n} today`); }).catch(() => undefined);
    api.notifications.count().then((r) => { if (r.data.unread) setUnread(`${r.data.unread} unread`); }).catch(() => undefined);
    api.dashboard.renewalsDue().then((r) => { if (r.data.count) setRenewalsDue(`${r.data.count} due`); }).catch(() => undefined);
  }, []);

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });
  const go = (r: Row) => {
    if (r.action === 'logout') return signOut();
    if (r.route) return navigation.navigate(r.route as any);
    soon(r.label);
  };

  const WORK: Row[] = [
    { icon: 'calendar', label: 'Tasks', route: 'Tasks', count: tasksToday },
    { icon: 'refresh-cw', label: 'Renewals', route: 'Renewals', count: renewalsDue },
    { icon: 'send', label: 'Proposals', route: 'Proposals' },
    { icon: 'shield', label: 'Policies', route: 'Policies' },
    { icon: 'bar-chart-2', label: 'Campaigns', route: 'Campaigns' },
    { icon: 'folder', label: 'Documents', route: 'DocumentsAll' },
  ];
  const SELL: Row[] = [
    { icon: 'package', label: 'Products', route: 'Products' },
    { icon: 'target', label: 'Best fit', route: 'BestFit' },
    { icon: 'git-pull-request', label: 'Comparisons', route: 'ComparisonsList' },
  ];
  const ACCOUNT: Row[] = [
    ...(isStaff ? [{ icon: 'grid' as IconName, label: 'Admin panel', route: 'AdminHome' as keyof AppStackParamList }] : []),
    { icon: 'message-circle', label: 'Communications', route: 'Communications' },
    { icon: 'bell', label: 'Notifications', route: 'Notifications', count: unread },
    { icon: 'settings', label: 'Settings', route: 'Settings' },
    { icon: 'log-out', label: 'Log out', danger: true, action: 'logout' },
  ];

  const subBadge = user?.subscription?.status === 'TRIAL' && typeof user.subscription.daysLeft === 'number'
    ? `Trial · ${user.subscription.daysLeft} days left`
    : user?.subscription?.banner?.message ?? null;

  const Group = ({ title, rows }: { title: string; rows: Row[] }) => (
    <>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.card}>
        {rows.map((r) => (
          <Pressable key={r.label} style={styles.row} onPress={() => go(r)}>
            <View style={styles.rowIcon}>
              <Icon name={r.icon} size={17} color={r.danger ? colors.red : colors.text} />
            </View>
            <Text style={[styles.rowLabel, r.danger && { color: colors.red }]}>{r.label}</Text>
            {r.count ? <Text style={styles.rowCount}>{r.count}</Text> : null}
            <Icon name="chevron-right" size={16} color={colors.grayBar} />
          </Pressable>
        ))}
      </View>
    </>
  );

  const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Text style={styles.title}>More</Text>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.profile} onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user?.name ?? '?')}</Text>
          </View>
          <View style={styles.profileCol}>
            <Text style={styles.name} numberOfLines={1}>{user?.name ?? '—'}</Text>
            <Text style={styles.role} numberOfLines={1}>
              {user?.roleLabel ?? ''}{user?.advisorName ? ` · ${user.advisorName}` : ''}
            </Text>
            {subBadge ? (
              <View style={styles.trial}>
                <Icon name="clock" size={13} color={colors.blue} />
                <Text style={styles.trialText} numberOfLines={1}>{subBadge}</Text>
              </View>
            ) : null}
          </View>
          <Icon name="chevron-right" size={18} color={colors.grayBar} />
        </Pressable>

        <Group title="WORK" rows={WORK} />
        <Group title="SELL" rows={SELL} />
        <Group title="ACCOUNT" rows={ACCOUNT} />
      </ScrollView>

      <TabBar active="more" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { paddingLeft: 20, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  title: { fontSize: 26, fontFamily: family.bold, color: colors.text, letterSpacing: -0.26 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120, gap: 12 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#ffffff', backgroundColor: '#fbd5dd', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontFamily: family.bold, color: colors.navy },
  profileCol: { flex: 1, gap: 3 },
  name: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  role: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  trial: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: '#e8f0fd', paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  trialText: { fontSize: 12, fontFamily: family.semibold, color: colors.blue },
  groupTitle: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  rowCount: { fontSize: 12, fontFamily: family.semibold, color: colors.muted },
});
