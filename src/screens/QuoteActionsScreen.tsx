import React, { useState } from 'react';
import { Alert, Linking } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'QuoteActions'>;

export function QuoteActionsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const close = () => navigation.goBack();
  const go = (route: string, p?: any) => { close(); setTimeout(() => navigation.navigate(route, p), 60); };
  const soon = (title: string) => go('ComingSoon', { title });
  const openShare = async (channel: 'DOWNLOAD' | 'LINK') => {
    try { const { data } = await api.quotations.share(params.id, channel, { idempotencyKey: newIdempotencyKey() }); const url = data?.url ?? data?.link ?? data?.shareUrl; if (url) { Linking.openURL(url).catch(() => undefined); close(); } else { Alert.alert('Done', channel === 'LINK' ? 'Payment link created.' : 'PDF ready.'); close(); } }
    catch (e) { Alert.alert('Could not complete', e instanceof ApiError ? e.message : 'Try again.'); }
  };
  const markPayment = (action: 'fail' | 'expire') => Alert.alert(action === 'fail' ? 'Mark payment failed?' : 'Mark link expired?', action === 'fail' ? 'Record that this payment did not go through.' : 'The payment link will stop working.', [{ text: 'Cancel', style: 'cancel' }, { text: action === 'fail' ? 'Mark failed' : 'Expire link', style: 'destructive', onPress: async () => { try { const { data } = await api.quotations.get(params.id); const pays: any[] = data.payments ?? data.paymentHistory ?? []; const pay = pays.find((pp) => ['PENDING', 'LINK_SENT', 'AWAITING', 'INITIATED'].includes(String(pp.status ?? '').toUpperCase())) ?? pays[pays.length - 1]; if (!pay?.id) { Alert.alert('No payment', 'No payment or link to update.'); return; } if (action === 'fail') await api.payments.fail(pay.id); else await api.payments.expire(pay.id); close(); } catch (e) { Alert.alert('Could not update', e instanceof ApiError ? e.message : 'Try again.'); } } }]);
  const cancelQuote = () => Alert.alert('Cancel quotation?', 'This cannot be undone.', [{ text: 'Keep', style: 'cancel' }, { text: 'Cancel it', style: 'destructive', onPress: async () => { try { const { data } = await api.quotations.get(params.id); await api.quotations.cancel(params.id, { version: data.version, reason: 'Cancelled by advisor' }, { idempotencyKey: newIdempotencyKey() }); close(); } catch (e) { Alert.alert('Could not cancel', e instanceof ApiError ? e.message : 'Try again.'); } } }]);

  const rows: { icon: IconName; bg: string; fg: string; label: string; onPress: () => void; danger?: boolean }[] = [
    { icon: 'link', bg: '#e8f0fd', fg: colors.blue, label: 'Add or change payment link', onPress: () => openShare('LINK') },
    { icon: 'credit-card', bg: '#e9e3fc', fg: '#5b3fb8', label: 'Record payment', onPress: () => go('RecordPayment', { id: params.id, customerName: params.customerName, amount: params.amount }) },
    { icon: 'alert-circle', bg: '#fde8c9', fg: '#8a5a12', label: 'Mark payment failed', onPress: () => markPayment('fail') },
    { icon: 'clock', bg: '#fbebec', fg: '#b4323c', label: 'Mark link expired', onPress: () => markPayment('expire') },
    { icon: 'edit-3', bg: '#f0ecfb', fg: '#5b3fb8', label: 'Revise (new revision)', onPress: () => go('QuoteBuilder', { quotationId: params.id }) },
    { icon: 'download', bg: '#e8f0fd', fg: colors.blue, label: 'Download PDF', onPress: () => openShare('DOWNLOAD') },
    { icon: 'x', bg: '#fbebec', fg: colors.red, label: 'Cancel quotation', onPress: cancelQuote, danger: true },
  ];

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}><Text style={styles.title} numberOfLines={1}>{params.number ?? 'Quotation'}</Text><Text style={styles.sub} numberOfLines={1}>{params.status ?? ''}</Text></View>
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
