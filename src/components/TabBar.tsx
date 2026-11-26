import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from './Icon';
import { colors, radius, family, spacing, shadow } from '../theme/theme';

type TabKey = 'home' | 'leads' | 'policyholders' | 'quotes' | 'more';
const TABS: { key: TabKey; label: string; icon: IconName; route?: string }[] = [
  { key: 'home', label: 'Home', icon: 'grid', route: 'Home' },
  { key: 'leads', label: 'Leads', icon: 'columns', route: 'Leads' },
  { key: 'policyholders', label: 'Policy holders', icon: 'users', route: 'PolicyHolders' },
  { key: 'quotes', label: 'Quotes', icon: 'file-text', route: 'Quotes' },
  { key: 'more', label: 'More', icon: 'menu', route: 'More' },
];

// Bottom tab bar (navy). Home & Leads navigate; the rest are Part-3 placeholders.
export function TabBar({ active = 'home' }: { active?: TabKey }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }, shadow.card]}>
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Pressable
            key={t.key}
            style={styles.tab}
            onPress={() => {
              if (t.route && !on) navigation.navigate(t.route);
            }}
          >
            <View style={[styles.iconWrap, on && styles.iconWrapActive]}>
              <Icon name={t.icon} size={21} color={on ? colors.navy : colors.muted} />
            </View>
            <Text style={[styles.label, on ? styles.labelActive : styles.labelInactive]} numberOfLines={1}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.navy, paddingTop: spacing.md, paddingHorizontal: spacing.md },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  iconWrap: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xs, borderRadius: radius.chip },
  iconWrapActive: { backgroundColor: colors.blueSoft2 },
  label: { fontSize: 10 },
  labelActive: { color: colors.onPrimary, fontFamily: family.bold },
  labelInactive: { color: colors.muted, fontFamily: family.semibold },
});
