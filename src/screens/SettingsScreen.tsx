import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { useAuth } from '../auth/AuthContext';
import { colors, family } from '../theme/theme';

type Item = { icon: IconName; label: string; sub?: string; route?: string };

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const soon = (title: string) => navigation.navigate('ComingSoon', { title });

  const pct = user?.profile?.completionPct;
  const plan = user?.subscription?.status === 'TRIAL' && typeof user.subscription.daysLeft === 'number'
    ? `Trial · ${user.subscription.daysLeft} days` : undefined;

  const ITEMS: Item[] = [
    { icon: 'user-plus', label: 'My profile', route: 'Profile', sub: typeof pct === 'number' ? `${pct}% complete` : undefined },
    { icon: 'shield', label: 'KYC', route: 'Kyc' },
    { icon: 'box', label: 'My insurers', route: 'MyInsurers' },
    { icon: 'credit-card', label: 'My plan', route: 'PlanBilling', sub: plan },
    { icon: 'dollar-sign', label: 'WhatsApp wallet', route: 'Wallet' },
    { icon: 'link', label: 'Integrations', route: 'Integrations' },
    { icon: 'mail', label: 'Message templates', route: 'MessageRules' },
    { icon: 'users', label: 'Assistants', route: 'Assistants' },
    { icon: 'link', label: 'Referrers', route: 'Referrers' },
    { icon: 'eye', label: 'Support access', route: 'SupportAccess' },
    { icon: 'download', label: 'Export my data', route: 'ExportData' },
    { icon: 'list', label: 'Activity log', route: 'ActivityLog' },
    { icon: 'lock', label: 'Security', route: 'Security' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {ITEMS.map((it) => (
            <Pressable key={it.label} style={styles.row} onPress={() => (it.route ? navigation.navigate(it.route) : soon(it.label))}>
              <View style={styles.rowIcon}><Icon name={it.icon} size={17} color={colors.text} /></View>
              <Text style={styles.rowLabel}>{it.label}</Text>
              {it.sub ? <Text style={styles.rowSub}>{it.sub}</Text> : null}
              <Icon name="chevron-right" size={16} color={colors.grayBar} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  rowSub: { fontSize: 12, fontFamily: family.semibold, color: colors.muted },
});
