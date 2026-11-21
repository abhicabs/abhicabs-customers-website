// src/screens/dashboard/PerformanceLogScreen.js — NEW FILE
// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE LOG (Profile → Performance log) — for support. Shows every time the app was blocked for 0.7 s+ ("froze"),
// which screen was open, and what had just started; plus slow operations (e.g. "reading the call log took 3.8 s").
// After the app gets stuck: open this, tap Share, and send the text. Nothing is sent automatically.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Share } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { useTheme } from '../../theme/ThemeContext';
import { getPerfLog, getPerfSummary, formatPerfLog, clearPerfLog } from '../../services/stallMonitor';

const secs = (ms) => `${(ms / 1000).toFixed(1)} s`;

export default function PerformanceLogScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [entries, setEntries] = useState([]);
  const [sum, setSum] = useState({ stalls: 0, worstMs: 0, slowOps: 0 });

  const refresh = useCallback(() => {
    try { setEntries(getPerfLog()); setSum(getPerfSummary()); } catch { setEntries([]); }
  }, []);
  useFocusEffect(useCallback(() => { refresh(); return undefined; }, [refresh]));

  const share = async () => { try { await Share.share({ message: formatPerfLog() }); } catch { /* cancelled */ } };
  const clear = async () => { await clearPerfLog(); refresh(); };

  const renderItem = ({ item }) => {
    const stall = item.type === 'stall';
    const color = stall ? '#EF4444' : '#F59E0B';
    return (
      <View style={[s.card, { borderLeftColor: color }]}>
        <View style={s.cardTop}>
          <Icon name={stall ? 'snowflake-alert' : 'timer-sand'} size={18} color={color} />
          <Text style={[s.cardTitle, { color }]}>
            {stall ? `Froze ${secs(item.ms)}` : `Slow: ${item.name} — ${secs(item.ms)}`}
          </Text>
          <Text style={s.when}>{moment(item.at).format('DD MMM, hh:mm:ss A')}</Text>
        </View>
        <Text style={s.route}>on screen “{item.route || 'unknown'}”</Text>
        {stall && item.before && item.before.length > 0 ? (
          <View style={s.before}>
            <Text style={s.beforeHead}>What had just started</Text>
            {item.before.map((b, i) => <Text key={i} style={s.beforeLine}>• {b}</Text>)}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.title}>Performance log</Text>
          <Text style={s.subtitle}>For support — records when the app froze</Text>
        </View>
      </View>

      <View style={s.sumRow}>
        <View style={s.sumBox}><Text style={s.sumVal}>{sum.stalls}</Text><Text style={s.sumLbl}>Freezes</Text></View>
        <View style={s.sumBox}><Text style={s.sumVal}>{sum.stalls ? secs(sum.worstMs) : '—'}</Text><Text style={s.sumLbl}>Longest</Text></View>
        <View style={s.sumBox}><Text style={s.sumVal}>{sum.slowOps}</Text><Text style={s.sumLbl}>Slow tasks</Text></View>
      </View>

      <View style={s.actions}>
        <TouchableOpacity style={s.primary} onPress={share} activeOpacity={0.85} accessibilityLabel="Share log">
          <Icon name="share-variant" size={17} color="#fff" /><Text style={s.primaryTxt}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondary} onPress={refresh} activeOpacity={0.8} accessibilityLabel="Refresh log"><Text style={s.secondaryTxt}>Refresh</Text></TouchableOpacity>
        <TouchableOpacity style={s.secondary} onPress={clear} activeOpacity={0.8} accessibilityLabel="Clear log"><Text style={s.secondaryTxt}>Clear</Text></TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(e, i) => `${e.type}:${e.at}:${i}`}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={(
          <View style={s.empty}>
            <Icon name="check-circle-outline" size={44} color={colors.textMuted} />
            <Text style={s.emptyTitle}>No freezes recorded</Text>
            <Text style={s.emptyTxt}>Use the app as normal. If it gets stuck, come back here, tap Share and send it to support.</Text>
          </View>
        )}
      />
    </View>
  );
}

function makeStyles(colors) {
  const blue = colors.blue || '#2563EB';
  return StyleSheet.create({
    root:   { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    title:  { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
    subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    sumRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 14 },
    sumBox: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    sumVal: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
    sumLbl: { fontSize: 12, color: colors.textMuted, marginTop: 2, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
    primary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: blue },
    primaryTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
    secondary: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
    secondaryTxt: { fontSize: 14, fontWeight: '700', color: colors.textSec || colors.textMuted },
    list:   { paddingHorizontal: 16, paddingBottom: 40 },
    card:   { padding: 14, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, gap: 6 },
    cardTop:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardTitle: { flex: 1, fontSize: 14.5, fontWeight: '800' },
    when:   { fontSize: 11.5, color: colors.textMuted },
    route:  { fontSize: 12.5, color: colors.textSec || colors.textMuted },
    before: { padding: 10, borderRadius: 10, backgroundColor: colors.bg, gap: 3 },
    beforeHead: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5, color: colors.textMuted, textTransform: 'uppercase' },
    beforeLine: { fontSize: 12.5, color: colors.textPrimary },
    empty:  { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30, gap: 8 },
    emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
    emptyTxt: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19 },
  });
}
