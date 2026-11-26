import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from './Icon';
import { colors, family } from '../theme/theme';

const TABS: { key: string; label: string; icon: IconName; route: string }[] = [
  { key: 'Home', label: 'Home', icon: 'grid', route: 'AdminHome' },
  { key: 'Approvals', label: 'Approvals', icon: 'check-square', route: 'AdminApprovals' },
  { key: 'Advisors', label: 'Advisors', icon: 'users', route: 'AdminAdvisors' },
  { key: 'Products', label: 'Products', icon: 'box', route: 'AdminCatalogue' },
  { key: 'More', label: 'More', icon: 'menu', route: 'AdminMore' },
];

export function StaffTabBar({ active }: { active: string }) {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.bar}>
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Pressable key={t.key} style={styles.tab} onPress={() => { if (!on) navigation.navigate(t.route); }}>
            <View style={[styles.iconWrap, on && styles.iconWrapOn]}>
              <Icon name={t.icon} size={21} color={on ? colors.purple : colors.muted} />
            </View>
            <Text style={[styles.label, { color: on ? colors.purple : colors.muted, fontFamily: on ? family.bold : family.semibold }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', height: 84, paddingTop: 8, paddingBottom: 26, paddingHorizontal: 8, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  iconWrap: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 14 },
  iconWrapOn: { backgroundColor: '#ede8fd' },
  label: { fontSize: 10 },
});
