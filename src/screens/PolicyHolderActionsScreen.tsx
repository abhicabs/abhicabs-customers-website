import React, { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'PolicyHolderActions'>;

export function PolicyHolderActionsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [busy, setBusy] = useState(false);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();
  const go = (route: string, p?: any) => { close(); setTimeout(() => navigation.navigate(route, p), 60); };

  const deactivate = () => {
    Alert.alert('Deactivate policy holder?', `${params.name} will be moved to inactive.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deactivate', style: 'destructive', onPress: async () => {
        setBusy(true);
        try { await api.customers.deactivate(params.id, { version: params.version ?? 1 }, { idempotencyKey: idem.current }); close(); }
        catch (e) { Alert.alert('Could not deactivate', e instanceof ApiError ? e.message : 'Try again.'); setBusy(false); }
      } },
    ]);
  };

  const rows: { icon: IconName; bg: string; fg: string; label: string; onPress: () => void; danger?: boolean }[] = [
    { icon: 'edit-3', bg: '#e8f0fd', fg: colors.blue, label: 'Edit details', onPress: () => go('EditPolicyHolder', { id: params.id }) },
    { icon: 'users', bg: '#f0ecfb', fg: '#5b3fb8', label: 'Change default nominee', onPress: () => go('ChangeNominee', { customerId: params.id }) },
    { icon: 'link', bg: '#fbf1e1', fg: '#8a5a12', label: 'Link a policy holder', onPress: () => go('LinkPolicyHolder', { customerId: params.id }) },
    { icon: 'user-plus', bg: '#e7f4ee', fg: '#127650', label: 'Add family member', onPress: () => go('FamilyMemberForm', { customerId: params.id }) },
    { icon: 'upload', bg: '#fde8ec', fg: '#b4323c', label: 'Add document', onPress: () => go('AddDocument', { customerId: params.id }) },
  ];

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{params.name}</Text>
            <Text style={styles.sub} numberOfLines={1}>{[params.number, params.status].filter(Boolean).join(' · ')}</Text>
          </View>
          <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
        </View>

        {rows.map((r) => (
          <Pressable key={r.label} style={styles.row} onPress={r.onPress}>
            <View style={[styles.rowIcon, { backgroundColor: r.bg }]}><Icon name={r.icon} size={18} color={r.fg} /></View>
            <Text style={styles.rowLabel}>{r.label}</Text>
            <Icon name="chevron-right" size={16} color={colors.grayBar} />
          </Pressable>
        ))}

        <Pressable style={[styles.row, busy && { opacity: 0.6 }]} disabled={busy} onPress={deactivate}>
          <View style={[styles.rowIcon, { backgroundColor: '#fbebec' }]}><Icon name="x" size={18} color={colors.red} /></View>
          <Text style={[styles.rowLabel, { color: colors.red }]}>Deactivate</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,31,59,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 18, gap: 4 },
  handleRow: { alignItems: 'center', paddingBottom: 6 },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#d5dbe5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingBottom: 8 },
  title: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: family.semibold, color: colors.text },
});
