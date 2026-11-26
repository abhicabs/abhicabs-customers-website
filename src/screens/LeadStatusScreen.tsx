import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { Dropdown } from '../components/form';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { followUpPresets } from '../lib/followup';
import { colors, spacing, radius, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { LeadStatus } from '../api/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type R = RouteProp<AppStackParamList, 'LeadStatus'>;

const LABEL: Record<LeadStatus, string> = {
  NEW: 'New', CONTACTED: 'Contacted', QUALIFIED: 'Qualified', FOLLOW_UP: 'Follow-up', CONVERTED: 'Converted', LOST: 'Lost',
};
const HINT: Record<LeadStatus, string> = {
  NEW: 'Back to new',
  CONTACTED: 'Spoke or reached out',
  QUALIFIED: 'Needs and budget confirmed',
  FOLLOW_UP: 'Pick a date next',
  CONVERTED: 'Convert from the lead screen',
  LOST: 'Asks for a reason',
};

export function LeadStatusScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const presets = followUpPresets().filter((p) => p.iso); // a follow-up needs a date

  const [selected, setSelected] = useState<LeadStatus | null>(null);
  const [followUp, setFollowUp] = useState<string>(presets[0]?.key ?? '');
  const [reasons, setReasons] = useState<string[]>([]);
  const [lostReason, setLostReason] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const idem = React.useRef(newIdempotencyKey());

  useEffect(() => {
    if (selected === 'LOST' && reasons.length === 0) {
      api.reference
        .get()
        .then((r) => setReasons(r.data.lostReasons))
        .catch(() => undefined);
    }
  }, [selected, reasons.length]);

  const close = () => navigation.goBack();

  const save = async () => {
    if (!selected) return;
    if (selected === 'FOLLOW_UP' && !presets.find((p) => p.key === followUp)?.iso) {
      Alert.alert('Pick a follow-up date');
      return;
    }
    if (selected === 'LOST' && !lostReason) {
      Alert.alert('Choose a reason');
      return;
    }
    setSaving(true);
    try {
      await api.leads.changeStatus(
        params.id,
        {
          version: params.version,
          status: selected as Exclude<LeadStatus, 'CONVERTED'>,
          nextFollowUpAt: selected === 'FOLLOW_UP' ? presets.find((p) => p.key === followUp)?.iso ?? undefined : undefined,
          lostReason: selected === 'LOST' ? lostReason : undefined,
          note: note.trim() || undefined,
        },
        { idempotencyKey: idem.current },
      );
      close();
    } catch (e) {
      idem.current = newIdempotencyKey();
      Alert.alert('Could not update', e instanceof ApiError ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Current status first (disabled), then the allowed moves.
  const rows: { status: LeadStatus; current: boolean; disabled: boolean }[] = [
    { status: params.current, current: true, disabled: true },
    ...params.allowedMoves.map((s) => ({ status: s, current: false, disabled: false })),
  ];

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Change status</Text>
            <Text style={styles.subtitle}>Only allowed moves are shown</Text>
          </View>
          <Pressable hitSlop={10} onPress={close} style={styles.close}>
            <Icon name="x" size={18} color={colors.muted} />
          </Pressable>
        </View>

        <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
          {rows.map((r) => {
            const on = selected === r.status;
            return (
              <Pressable
                key={r.status}
                disabled={r.disabled}
                onPress={() => setSelected(r.status)}
                style={[styles.option, on && styles.optionOn, r.disabled && styles.optionDisabled]}
              >
                <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optLabel}>{LABEL[r.status]}</Text>
                  <Text style={styles.optHint}>{r.current ? 'Current' : HINT[r.status]}</Text>
                </View>
              </Pressable>
            );
          })}

          {selected === 'FOLLOW_UP' ? (
            <View style={styles.extra}>
              <Text style={styles.extraLabel}>Follow-up date</Text>
              <View style={styles.presets}>
                {presets.map((p) => {
                  const on = p.key === followUp;
                  return (
                    <Pressable key={p.key} onPress={() => setFollowUp(p.key)} style={[styles.preset, on && styles.presetOn]}>
                      <Text style={[styles.presetText, { color: on ? colors.onPrimary : colors.muted2 }]}>{p.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {selected === 'LOST' ? (
            <View style={styles.extra}>
              <Text style={styles.extraLabel}>Reason</Text>
              <Dropdown
                value={lostReason}
                placeholder="Choose a reason"
                options={reasons.map((r) => ({ label: r }))}
                onSelect={(o) => setLostReason(o.label)}
              />
            </View>
          ) : null}
        </ScrollView>

        <Button label="Save" icon="check" onPress={save} loading={saving} disabled={!selected} style={{ marginTop: spacing.lg }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, padding: spacing.xl, gap: spacing.md },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontSize: 20, fontFamily: family.bold, color: colors.text },
  subtitle: { fontSize: 13, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.chip, borderWidth: 1.5, borderColor: 'transparent', backgroundColor: colors.bg, marginTop: spacing.sm },
  optionOn: { borderColor: colors.blue, backgroundColor: colors.surface },
  optionDisabled: { opacity: 0.6 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.checkboxBorder, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  optLabel: { fontSize: 15, fontFamily: family.bold, color: colors.text },
  optHint: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  extra: { marginTop: spacing.lg, gap: spacing.md },
  extraLabel: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  preset: { backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.chip },
  presetOn: { backgroundColor: colors.navy },
  presetText: { fontSize: 12, fontFamily: family.semibold },
});
