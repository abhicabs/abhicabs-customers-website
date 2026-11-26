import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { api } from '../api/endpoints';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'LeadSourcePicker'>;
const DEFAULTS = [
  { label: 'Meta Ads', sub: 'Facebook and Instagram' }, { label: 'Google Ads', sub: 'Search and YouTube' }, { label: 'Website', sub: '' },
  { label: 'Social media', sub: 'Organic posts' }, { label: 'Referred by a client', sub: '' }, { label: 'Referred by a referrer', sub: '' },
  { label: 'Walk-in or personal contact', sub: '' }, { label: 'Campaign', sub: 'Name required' }, { label: 'Manual entry', sub: '' }, { label: 'Other', sub: '' },
];

export function LeadSourcePickerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [sources, setSources] = useState<{ label: string; sub?: string }[]>(DEFAULTS);
  const close = () => navigation.goBack();

  useEffect(() => { api.reference.get().then((r) => { const ls = (r.data as any).leadSources; if (Array.isArray(ls) && ls.length) setSources(ls.map((s: string) => ({ label: s }))); }).catch(() => undefined); }, []);

  const choose = (label: string) => navigation.navigate({ name: params?.target ?? 'LeadAdd', params: { pickedSource: label }, merge: true } as any);

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}><Text style={styles.title}>Lead source</Text><Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable></View>
        <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {sources.map((s) => { const on = s.label === params?.current; return (
            <Pressable key={s.label} style={[styles.opt, on && styles.optOn]} onPress={() => choose(s.label)}>
              <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
              <View style={{ flex: 1 }}><Text style={styles.optTitle}>{s.label}</Text>{s.sub ? <Text style={styles.optSub}>{s.sub}</Text> : null}</View>
            </Pressable>
          ); })}
        </ScrollView>
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
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  optTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  optSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
});
