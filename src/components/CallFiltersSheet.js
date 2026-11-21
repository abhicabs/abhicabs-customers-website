// src/components/CallFiltersSheet.js — NEW FILE
// ─────────────────────────────────────────────────────────────────────────────
// All the "Calls by Day" filters in ONE place (a bottom sheet) instead of a wall of pills:
//   Call type · Numbers · Leads assigned · Ad (opens the ad sheet).
// Choices are held in a draft and applied together with "Show results", so the lists refresh once, not on every tap.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TYPES = [
  { key: 'all',      label: 'All calls', icon: 'phone' },
  { key: 'outgoing', label: 'Outgoing',  icon: 'phone-outgoing' },
  { key: 'incoming', label: 'Incoming',  icon: 'phone-incoming' },
  { key: 'missed',   label: 'Missed',    icon: 'phone-missed' },
  { key: 'rejected', label: 'Rejected',  icon: 'phone-cancel' },
];

export default function CallFiltersSheet({ visible, onClose, onApply, onOpenAd, value, adLabel, assignedCount, isToday, colors, dark }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => { if (visible) setDraft(value); }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps
  const s = useMemo(() => makeStyles(colors, dark), [colors, dark]);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const dirty = draft.callType !== 'all' || draft.leadsOnly || draft.assignedOnly;

  const Chip = ({ on, label, icon, onPress }) => (
    <TouchableOpacity style={[s.chip, on && s.chipOn]} onPress={onPress} activeOpacity={0.8} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={label}>
      {icon ? <Icon name={icon} size={15} color={on ? '#fff' : colors.textMuted} /> : null}
      <Text style={[s.chipTxt, on && s.chipTxtOn]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.wrap}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} accessibilityLabel="Close filters" />
        <View style={s.sheet}>
          <View style={s.grab} />
          <View style={s.head}>
            <Text style={s.title}>Filters</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Icon name="close" size={22} color={colors.textMuted} /></TouchableOpacity>
          </View>

          <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
            <Text style={s.label}>Call type</Text>
            <View style={s.chips}>{TYPES.map((t) => <Chip key={t.key} on={draft.callType === t.key} label={t.label} icon={t.icon} onPress={() => set({ callType: t.key })} />)}</View>

            <Text style={s.label}>Numbers</Text>
            <View style={s.chips}>
              <Chip on={!draft.leadsOnly} label="All numbers" onPress={() => set({ leadsOnly: false })} />
              <Chip on={draft.leadsOnly}  label="CRM leads only" icon="account-check-outline" onPress={() => set({ leadsOnly: true })} />
            </View>

            <Text style={s.label}>Leads assigned</Text>
            <View style={s.chips}>
              <Chip on={!draft.assignedOnly} label="All leads" onPress={() => set({ assignedOnly: false })} />
              <Chip on={draft.assignedOnly}  label={`${isToday ? 'Assigned today' : 'Assigned on this day'}${assignedCount != null ? ` (${assignedCount})` : ''}`} icon="star-four-points" onPress={() => set({ assignedOnly: true })} />
            </View>
            <Text style={s.help}>Leads created that day, or assigned / re-assigned to you that day.</Text>

            <Text style={s.label}>Ad</Text>
            <TouchableOpacity style={s.adRow} onPress={() => onOpenAd(draft)} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Choose ad">
              <Icon name="bullhorn-outline" size={18} color={colors.blueLight || colors.blue} />
              <View style={{ flex: 1 }}>
                <Text style={s.adTop}>Campaign › ad set › ad</Text>
                <Text style={s.adVal} numberOfLines={1}>{adLabel}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </ScrollView>

          <View style={s.foot}>
            <TouchableOpacity style={[s.clearBtn, !dirty && { opacity: 0.5 }]} disabled={!dirty} onPress={() => setDraft({ callType: 'all', leadsOnly: false, assignedOnly: false })} activeOpacity={0.8}>
              <Text style={s.clearTxt}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.applyBtn} onPress={() => onApply(draft)} activeOpacity={0.85} accessibilityLabel="Show results">
              <Text style={s.applyTxt}>Show results</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(colors, dark) {
  const blue = colors.blue || '#2563EB';
  return StyleSheet.create({
    wrap:     { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.5)' },
    sheet:    { maxHeight: '88%', backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 18 },
    grab:     { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginTop: 8 },
    head:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
    title:    { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
    body:     { paddingHorizontal: 20 },
    label:    { fontSize: 13, fontWeight: '800', color: colors.textPrimary, marginTop: 18, marginBottom: 10 },
    chips:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bg },
    chipOn:   { backgroundColor: blue, borderColor: blue },
    chipTxt:  { fontSize: 14, fontWeight: '700', color: colors.textSec || colors.textMuted },
    chipTxtOn:{ color: '#fff' },
    help:     { fontSize: 12, color: colors.textMuted, marginTop: 8, lineHeight: 17 },
    adRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bg },
    adTop:    { fontSize: 11.5, color: colors.textMuted, fontWeight: '600' },
    adVal:    { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginTop: 1 },
    foot:     { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8 },
    clearBtn: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border },
    clearTxt: { fontSize: 15, fontWeight: '700', color: colors.textSec || colors.textMuted },
    applyBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: blue },
    applyTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
  });
}
