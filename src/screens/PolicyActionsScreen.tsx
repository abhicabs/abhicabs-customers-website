import React from 'react';
import { Alert } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { api } from '../api/endpoints';
import { downloadAndShare } from '../lib/download';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'PolicyActions'>;

export function PolicyActionsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const close = () => navigation.goBack();
  const go = (route: string, p?: any) => { close(); setTimeout(() => navigation.navigate(route, p), 60); };
  const soon = (title: string) => go('ComingSoon', { title });
  const downloadPdf = async () => { try { const { data } = await api.policies.get(params.id); const fid = data.documentFileId ?? data.document?.fileId; if (fid) { close(); downloadAndShare(fid, `${data.policyNumber ?? 'policy'}.pdf`); } else Alert.alert('No document', 'No policy PDF is on file yet.'); } catch (e) { Alert.alert('Could not download', e instanceof ApiError ? e.message : 'Try again.'); } };
  const recordCancellation = () => Alert.alert('Record insurer cancellation?', 'Marks this policy cancelled.', [{ text: 'Back', style: 'cancel' }, { text: 'Record', style: 'destructive', onPress: async () => { try { const { data } = await api.policies.get(params.id); await api.policies.cancel(params.id, { version: data.version, reason: 'Cancelled by insurer' }, { idempotencyKey: newIdempotencyKey() }); close(); } catch (e) { Alert.alert('Could not record', e instanceof ApiError ? e.message : 'Try again.'); } } }]);

  const rows: { icon: IconName; bg: string; fg: string; label: string; onPress: () => void; danger?: boolean }[] = [
    { icon: 'users', bg: '#e9e3fc', fg: '#5b3fb8', label: 'Edit nominees', onPress: () => go('EditNominees', { id: params.id }) },
    { icon: 'download', bg: '#e8f0fd', fg: colors.blue, label: 'Download policy PDF', onPress: downloadPdf },
    ...(params.renewalId ? [{ icon: 'refresh-cw' as IconName, bg: '#d4f1e7', fg: '#127650', label: 'Open renewal', onPress: () => go('RenewalDetail', { id: params.renewalId }) }] : []),
    { icon: 'edit-3', bg: '#fde8c9', fg: '#8a5a12', label: 'Correct policy details', onPress: () => go('CorrectPolicy', { id: params.id }) },
    { icon: 'x', bg: '#fbebec', fg: colors.red, label: 'Record insurer cancellation', onPress: recordCancellation, danger: true },
  ];

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}><Text style={styles.title} numberOfLines={1}>{params.product ?? 'Policy'}</Text><Text style={styles.sub} numberOfLines={1}>{[params.status, params.policyNumber].filter(Boolean).join(' · ')}</Text></View>
          <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
        </View>
        {rows.map((r) => (
          <Pressable key={r.label} style={styles.row} onPress={r.onPress}>
            <View style={[styles.rowIcon, { backgroundColor: r.bg }]}><Icon name={r.icon} size={18} color={r.fg} /></View>
            <Text style={[styles.rowLabel, r.danger && { color: colors.red }]}>{r.label}</Text>
            {!r.danger ? <Icon name="chevron-right" size={16} color={colors.grayBar} /> : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,31,59,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 18, gap: 2 },
  handleRow: { alignItems: 'center', paddingBottom: 6 },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#d5dbe5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingBottom: 6 },
  title: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 11 },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: family.semibold, color: colors.text },
});
