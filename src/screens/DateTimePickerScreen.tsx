import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'DateTimePicker'>;
const TIMES = [{ label: '9:00 AM', v: '09:00' }, { label: '10:00 AM', v: '10:00' }, { label: '11:00 AM', v: '11:00' }, { label: '2:00 PM', v: '14:00' }, { label: '4:00 PM', v: '16:00' }];
const toIso = (s: string) => { const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined; };

export function DateTimePickerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [date, setDate] = useState(params?.date ?? '');
  const [time, setTime] = useState(params?.time ?? '11:00');
  const close = () => navigation.goBack();
  const done = () => {
    const iso = toIso(date);
    navigation.navigate({ name: params?.target ?? 'AddTask', params: { pickedDate: iso ?? date, pickedTime: time }, merge: true } as any);
  };
  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}><Text style={styles.title}>Pick date and time</Text><Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable></View>
        <View style={{ gap: 8 }}><Text style={styles.label}>Date</Text><View style={[styles.input, { borderWidth: 2, borderColor: colors.blue }]}><TextInput value={date} onChangeText={setDate} placeholder="DD-MM-YYYY" placeholderTextColor={colors.muted} keyboardType="numbers-and-punctuation" style={styles.field} selectionColor={colors.blue} /><Icon name="calendar" size={18} color={colors.muted} /></View></View>
        <View style={styles.pills}>{TIMES.map((t) => { const on = t.v === time; return <Pressable key={t.v} style={[styles.pill, on ? styles.pillOn : styles.pillOff]} onPress={() => setTime(t.v)}><Text style={[styles.pillText, { color: on ? colors.onPrimary : colors.muted3 }]}>{t.label}</Text></Pressable>; })}</View>
        <Pressable style={[styles.cta, shadow.button]} onPress={done}><Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>Done</Text></Pressable>
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
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16 },
  field: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  pillOn: { backgroundColor: colors.navy },
  pillOff: { backgroundColor: colors.bg },
  pillText: { fontSize: 13, fontFamily: family.semibold },
  cta: { height: 50, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
