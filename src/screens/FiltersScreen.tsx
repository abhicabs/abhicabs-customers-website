import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'Filters'>;
const SORTS = [{ key: 'NEWEST', label: 'Newest' }, { key: 'OLDEST', label: 'Oldest' }, { key: 'NAME', label: 'Name A–Z' }, { key: 'RENEWAL', label: 'Renewal soonest' }];

export function FiltersScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const cities: string[] = params?.cities ?? [];
  const cur = params?.current ?? {};
  const [sort, setSort] = useState(cur.sort ?? 'NEWEST');
  const [city, setCity] = useState<string | null>(cur.city ?? null);
  const [showInactive, setShowInactive] = useState(!!cur.showInactive);
  const close = () => navigation.goBack();

  const apply = () => {
    navigation.navigate({ name: params?.target ?? 'PolicyHolders', params: { filters: { sort, city, showInactive } }, merge: true } as any);
  };
  const clear = () => { setSort('NEWEST'); setCity(null); setShowInactive(false); navigation.navigate({ name: params?.target ?? 'PolicyHolders', params: { filters: null }, merge: true } as any); };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}><Text style={styles.title}>Filters</Text><Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable></View>

        <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
          <View style={{ gap: 8 }}>
            <Text style={styles.sectionLabel}>SORT</Text>
            <View style={styles.pills}>{SORTS.map((s) => { const on = s.key === sort; return <Pressable key={s.key} style={[styles.pill, on ? styles.pillOn : styles.pillOff]} onPress={() => setSort(s.key)}><Text style={[styles.pillText, { color: on ? colors.onPrimary : colors.muted3 }]}>{s.label}</Text></Pressable>; })}</View>
          </View>
          {cities.length ? (
            <View style={{ gap: 8 }}>
              <Text style={styles.sectionLabel}>CITY</Text>
              <View style={styles.pills}>{cities.map((c) => { const on = c === city; return <Pressable key={c} style={[styles.pill, on ? styles.pillOn : styles.pillOff]} onPress={() => setCity(on ? null : c)}><Text style={[styles.pillText, { color: on ? colors.onPrimary : colors.muted3 }]}>{c}</Text></Pressable>; })}</View>
            </View>
          ) : null}
          <Pressable style={styles.checkRow} onPress={() => setShowInactive((v) => !v)}>
            <View style={[styles.check, showInactive && styles.checkOn]}>{showInactive ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
            <Text style={styles.checkText}>Show inactive</Text>
          </Pressable>
        </ScrollView>

        <Pressable style={[styles.cta, shadow.button]} onPress={apply}><Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>Apply</Text></Pressable>
        <Pressable style={styles.clear} onPress={clear}><Text style={styles.clearText}>Clear all</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,31,59,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 18, gap: 12 },
  handleRow: { alignItems: 'center' },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#d5dbe5' },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, fontSize: 18, fontFamily: family.bold, color: colors.text },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  pillOn: { backgroundColor: colors.navy },
  pillOff: { backgroundColor: colors.bg },
  pillText: { fontSize: 13, fontFamily: family.semibold },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  checkText: { fontSize: 14, fontFamily: family.semibold, color: colors.text },
  cta: { height: 50, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
  clear: { alignItems: 'center', paddingVertical: 2 },
  clearText: { fontSize: 14, fontFamily: family.semibold, color: colors.muted2 },
});
