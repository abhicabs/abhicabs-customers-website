import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { relativeTime } from '../lib/format';
import { colors, spacing, radius, family } from '../theme/theme';
import type { NotificationItem } from '../api/types';

const TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'UNREAD', label: 'Unread' },
  { key: 'RENEWALS', label: 'Renewals' },
  { key: 'PAYMENTS', label: 'Payments' },
  { key: 'LEADS', label: 'Leads' },
  { key: 'CATALOGUE', label: 'Catalogue' },
];
const CAT_ICON: Record<string, { icon: IconName; bg: string }> = {
  LEADS: { icon: 'user-plus', bg: colors.blueSoft },
  RENEWALS: { icon: 'refresh-cw', bg: colors.purpleSoft },
  PAYMENTS: { icon: 'credit-card', bg: colors.greenSoft },
  CATALOGUE: { icon: 'grid', bg: colors.amberSoft },
  KYC: { icon: 'shield', bg: colors.blueSoft },
  ACCOUNTS: { icon: 'user', bg: colors.bg },
};

export function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState('ALL');
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (filter: string, mode?: 'refresh') => {
    if (mode !== 'refresh') setLoading(true);
    setError(null);
    try {
      const { data } = await api.notifications.list(filter);
      setItems(data.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(tab); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const readAll = async () => {
    try {
      await api.notifications.readAll();
      load(tab, 'refresh');
    } catch {
      /* ignore */
    }
  };

  const openItem = async (n: NotificationItem) => {
    api.notifications.open(n.id).catch(() => undefined);
    if (n.link?.type === 'lead' || n.link?.type === 'LEAD') navigation.navigate('LeadDetail', { id: n.link.id });
    else if (n.link?.type === 'customer' || n.link?.type === 'CUSTOMER') navigation.navigate('PolicyHolderDetail', { id: n.link.id });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.navbar}>
        <Pressable hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Notifications</Text>
        <Pressable hitSlop={10} onPress={readAll}>
          <Text style={styles.readAll}>Mark all read</Text>
        </Pressable>
      </View>

      <View style={styles.tabsWrap}>
        <FlatList
          horizontal
          data={TABS}
          keyExtractor={(t) => t.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
          renderItem={({ item: t }) => {
            const on = t.key === tab;
            return (
              <Pressable onPress={() => setTab(t.key)} style={[styles.tab, on && styles.tabOn]}>
                <Text style={[styles.tabLabel, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.label}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => load(tab)} />
      ) : (
        <FlatList
          data={loading ? [] : items}
          keyExtractor={(n) => n.id}
          style={styles.flex1}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={false}
          onRefresh={() => load(tab, 'refresh')}
          renderItem={({ item }) => {
            const ci = CAT_ICON[item.category] ?? { icon: 'bell' as IconName, bg: colors.bg };
            return (
              <Pressable style={[styles.row, !item.read && styles.rowUnread]} onPress={() => openItem(item)}>
                <View style={[styles.icon, { backgroundColor: ci.bg }]}>
                  <Icon name={ci.icon} size={16} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  {item.subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text> : null}
                </View>
                <View style={styles.rightCol}>
                  <Text style={styles.time}>{relativeTime(item.createdAt)}</Text>
                  {!item.read ? <View style={styles.dot} /> : null}
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={loading ? <EmptyState icon="loader" title="Loading…" /> : <EmptyState icon="bell" title="No notifications" subtitle="You’re all caught up." />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  readAll: { fontSize: 13, fontFamily: family.bold, color: colors.blue },
  tabsWrap: { flexGrow: 0 },
  tabs: { gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, alignItems: 'flex-start' },
  tab: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.chip },
  tabOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  tabLabel: { fontSize: 12, fontFamily: family.semibold },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  rowUnread: { borderColor: colors.blueSoft },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  subtitle: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2, lineHeight: 17 },
  time: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 4 },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue },
});
