import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'QuoteShare'>;
type Channel = 'WHATSAPP' | 'EMAIL' | 'LINK' | 'DOWNLOAD';
const OPTIONS: { channel: Channel; icon: IconName; title: string; sub: string }[] = [
  { channel: 'WHATSAPP', icon: 'message-circle', title: 'WhatsApp', sub: 'Shares and starts validity' },
  { channel: 'EMAIL', icon: 'mail', title: 'Email', sub: 'Shares and starts validity' },
  { channel: 'LINK', icon: 'link', title: 'Copy link', sub: 'Shareable link' },
  { channel: 'DOWNLOAD', icon: 'download', title: 'Download PDF', sub: 'Doesn’t start validity' },
];

export function QuoteShareScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [busy, setBusy] = useState<Channel | null>(null);
  const idem = React.useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  const share = async (channel: Channel) => {
    setBusy(channel);
    try {
      await api.quotations.share(params.id, channel, { idempotencyKey: idem.current });
      idem.current = newIdempotencyKey();
      close();
    } catch (e) {
      Alert.alert('Could not share', e instanceof ApiError ? e.message : 'Please try again.');
    } finally { setBusy(null); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Share quotation</Text>
            <Text style={styles.sub}>{params.customerName ? `${params.customerName} · ` : ''}validity starts on first share</Text>
          </View>
          <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
        </View>

        {OPTIONS.map((o) => (
          <Pressable key={o.channel} style={styles.row} disabled={!!busy} onPress={() => share(o.channel)}>
            <View style={styles.icon}><Icon name={o.icon} size={18} color={colors.text} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{o.title}</Text>
              <Text style={styles.rowSub}>{busy === o.channel ? 'Sharing…' : o.sub}</Text>
            </View>
          </Pressable>
        ))}

        <View style={[styles.row, { opacity: 0.55 }]}>
          <View style={styles.icon}><Icon name="phone" size={18} color={colors.text} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>SMS</Text>
            <Text style={[styles.rowSub, { color: '#8a5a12' }]}>Not available</Text>
          </View>
          <View style={styles.blocked}><Text style={styles.blockedText}>Blocked</Text></View>
        </View>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 4, paddingVertical: 10 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  rowSub: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  blocked: { backgroundColor: '#fbf1e1', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  blockedText: { fontSize: 12, fontFamily: family.semibold, color: '#8a5a12' },
});
