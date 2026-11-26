import React, { useCallback, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { WEB_URL } from '../config/env';
import { colors, family, shadow } from '../theme/theme';

const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayMonth = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '₹0');
const isCredit = (t: string) => /RECHARGE|CREDIT|REFUND/i.test(t || '');

export function WalletScreen() {
  const navigation = useNavigation<any>();
  const [w, setW] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.wallet.get(); setW(data); }
    catch (e) { setError(e instanceof ApiError ? (e.status === 404 ? 'Wallet not enabled for this account.' : e.message) : 'Could not load the wallet.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const txns: any[] = useMemo(() => (Array.isArray(w?.transactions) ? w.transactions : []), [w]);
  const monthStats = useMemo(() => {
    const now = new Date(); const sameMonth = (iso: string) => { const d = new Date(iso); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); };
    const debits = txns.filter((t) => !isCredit(t.type) && t.at && sameMonth(t.at));
    return { sent: debits.length, spent: debits.reduce((s, t) => s + Math.abs(t.amount ?? 0), 0) };
  }, [txns]);

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  const balance = w?.balance ?? 0;
  const price = w?.pricePerMessage ?? 1;
  const msgs = price ? Math.floor(balance / price) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>WhatsApp wallet</Text>
          <Text style={styles.navSub}>{rupees(balance)}</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#d4f1e7', '#b9e8d7']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.hero}>
          <Text style={styles.heroBalance}>{rupees(balance)}.00</Text>
          <Text style={styles.heroSub}>About {msgs} messages · {rupees(price)} per message</Text>
        </LinearGradient>

        <View style={styles.tiles}>
          <View style={[styles.tile, { backgroundColor: '#d9eafd' }]}><Text style={styles.tileLabel}>Sent this month</Text><Text style={styles.tileValue}>{monthStats.sent}</Text></View>
          <View style={[styles.tile, { backgroundColor: '#e9e3fc' }]}><Text style={styles.tileLabel}>Spent</Text><Text style={styles.tileValue}>{rupees(monthStats.spent)}</Text></View>
        </View>

        <Text style={styles.sectionLabel}>TRANSACTIONS</Text>
        {txns.length ? txns.slice(0, 50).map((t, i) => {
          const credit = isCredit(t.type);
          const icon: IconName = credit ? 'credit-card' : 'message-circle';
          const tileBg = credit ? '#d9eafd' : '#e9e3fc';
          const title = credit ? 'Recharge' : t.reason ?? 'Message';
          const amt = `${credit ? '+' : '−'}${rupees(Math.abs(t.amount ?? 0))}`;
          return (
            <View key={t.id ?? i} style={styles.item}>
              <View style={[styles.itemIcon, { backgroundColor: tileBg }]}><Icon name={icon} size={17} color={colors.text} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{title}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>{dayMonth(t.at)} · {amt}</Text>
              </View>
              {credit ? (
                <View style={[styles.chip, { backgroundColor: t.status === 'SUCCESS' ? '#e7f4ee' : t.status === 'FAILED' ? '#fbebec' : '#fbf1e1' }]}>
                  <Text style={[styles.chipText, { color: t.status === 'SUCCESS' ? '#127650' : t.status === 'FAILED' ? '#b4323c' : '#8a5a12' }]}>{(t.status ?? 'Success').charAt(0) + (t.status ?? 'SUCCESS').slice(1).toLowerCase()}</Text>
                </View>
              ) : <Icon name="chevron-right" size={16} color={colors.grayBar} />}
            </View>
          );
        }) : <Text style={styles.empty}>No transactions yet.</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.cta, shadow.button]} onPress={() => Linking.openURL(`${WEB_URL}/settings/wallet`).catch(() => undefined)}>
          <Icon name="credit-card" size={18} color={colors.onPrimary} />
          <Text style={styles.ctaText}>Recharge {rupees(w?.minimumRecharge ?? 1000)} + GST</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 12 },
  hero: { borderRadius: 22, padding: 16, gap: 10 },
  heroBalance: { fontSize: 18, lineHeight: 24, fontFamily: family.bold, color: colors.text },
  heroSub: { fontSize: 12, lineHeight: 18, fontFamily: family.medium, color: '#2f6b55' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '48.5%', borderRadius: 16, padding: 12, gap: 2 },
  tileLabel: { fontSize: 11, fontFamily: family.bold, color: '#44526a' },
  tileValue: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6, marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  itemIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  empty: { fontSize: 13, fontFamily: family.medium, color: colors.muted },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
