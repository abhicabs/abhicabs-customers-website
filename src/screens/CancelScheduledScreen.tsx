import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'CancelScheduled'>;

export function CancelScheduledScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  const confirm = async () => {
    setBusy(true); setError(null);
    try { await api.communications.cancel(params.id, { idempotencyKey: idem.current }); close(); }
    catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? e.message : 'Could not cancel the message.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}><Text style={styles.title}>Cancel scheduled message?</Text><Text style={styles.sub} numberOfLines={1}>{params.title ?? 'It won’t be sent'}</Text></View>
          <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
        </View>
        <View style={styles.note}><Icon name="alert-triangle" size={16} color="#8a5a12" /><Text style={styles.noteText}>This message will not be sent. You can schedule a new one later.</Text></View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={[styles.cta, busy && { opacity: 0.6 }]} disabled={busy} onPress={confirm}>
          <Icon name="x" size={18} color={colors.red} /><Text style={styles.ctaText}>{busy ? 'Cancelling…' : 'Cancel message'}</Text>
        </Pressable>
        <Pressable style={styles.keep} onPress={close}><Text style={styles.keepText}>Keep it scheduled</Text></Pressable>
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
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fbf1e1', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: '#8a5a12' },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#f2c4c8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.red },
  keep: { alignItems: 'center', paddingVertical: 4 },
  keepText: { fontSize: 14, fontFamily: family.semibold, color: colors.muted2 },
});
