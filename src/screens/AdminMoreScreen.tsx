import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { StaffTabBar } from '../components/StaffTabBar';
import { useAuth } from '../auth/AuthContext';
import { colors, family } from '../theme/theme';

type Item = { icon: IconName; label: string; route?: string };
const ITEMS: Item[] = [
  { icon: 'edit-3', label: 'Product corrections', route: 'AdminCorrections' },
  { icon: 'mail', label: 'Message templates', route: 'AdminTemplates' },
  { icon: 'users', label: 'SkyUp users', route: 'AdminUsers' },
  { icon: 'settings', label: 'Configuration', route: 'AdminConfig' },
  { icon: 'list', label: 'Audit log', route: 'AdminAudit' },
  { icon: 'flag', label: 'Agent-code flags', route: 'AgentCodeFlags' },
  { icon: 'eye', label: 'Support access', route: 'AdminSupport' },
];

export function AdminMoreScreen() {
  const navigation = useNavigation<any>();
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Text style={styles.title}>More</Text>
        <Text style={styles.sub}>SkyUp Admin · {user?.name ?? 'Admin'}</Text>
      </View>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {ITEMS.map((it) => (
            <Pressable key={it.label} style={styles.row} onPress={() => navigation.navigate(it.route === 'ComingSoon' ? 'ComingSoon' : it.route!, it.route === 'ComingSoon' ? { title: it.label } : undefined)}>
              <View style={styles.rowIcon}><Icon name={it.icon} size={17} color={colors.text} /></View>
              <Text style={styles.rowLabel}>{it.label}</Text>
              <Icon name="chevron-right" size={16} color={colors.grayBar} />
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.logout} onPress={signOut}>
          <Icon name="log-out" size={18} color={colors.red} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
      <StaffTabBar active="More" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { paddingLeft: 20, paddingRight: 16, paddingTop: 8, paddingBottom: 10, gap: 1 },
  title: { fontSize: 26, fontFamily: family.bold, color: colors.text, letterSpacing: -0.26 },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#f2c4c8', borderRadius: 18 },
  logoutText: { fontSize: 15, fontFamily: family.semibold, color: colors.red },
});
