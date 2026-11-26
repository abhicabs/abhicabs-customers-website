import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { DateField } from '../components/DateField';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'RescheduleTask'>;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`;
function presets() {
  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const friday = new Date(now); friday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7));
  const monday = new Date(now); monday.setDate(now.getDate() + ((1 - now.getDay() + 7) % 7 || 7));
  return [
    { key: 'later_today', title: 'Later today', sub: '6:00 PM' },
    { key: 'tomorrow', title: 'Tomorrow', sub: '10:00 AM' },
    { key: 'this_friday', title: 'This Friday', sub: `${fmt(friday)}, 10:00 AM` },
    { key: 'next_monday', title: 'Next Monday', sub: `${fmt(monday)}, 10:00 AM` },
  ];
}

const toIsoR = (s: string) => { const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined; };

export function RescheduleTaskScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const opts = presets();
  const [preset, setPreset] = useState<string | null>('tomorrow');
  const [customDate, setCustomDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  const save = async () => {
    setBusy(true); setError(null);
    try { const body: any = { version: params.version }; const iso = customDate ? toIsoR(customDate) : undefined; if (iso) body.dueDate = iso; else body.preset = preset; await api.tasks.reschedule(params.id, body, { idempotencyKey: idem.current }); close(); }
    catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not reschedule.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}><Text style={styles.title}>Reschedule</Text>{params.title ? <Text style={styles.sub} numberOfLines={1}>{params.title}</Text> : null}</View>
          <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
        </View>
        {opts.map((o) => { const on = o.key === preset; return (
          <Pressable key={o.key} style={[styles.opt, on && styles.optOn]} onPress={() => setPreset(o.key)}>
            <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
            <View style={{ flex: 1 }}><Text style={styles.optTitle}>{o.title}</Text><Text style={styles.optSub}>{o.sub}</Text></View>
          </Pressable>
        ); })}
        <View style={{ gap: 8 }}>
          <Text style={styles.pickText}>Or pick a date</Text>
          <DateField value={customDate} onChange={(v) => { setCustomDate(v); setPreset(null); }} />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
          <Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Working…' : 'Reschedule'}</Text>
        </Pressable>
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
  title: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  optTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  optSub: { fontSize: 12, lineHeight: 17, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  pick: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 24 },
  pickText: { fontSize: 15, fontFamily: family.semibold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
