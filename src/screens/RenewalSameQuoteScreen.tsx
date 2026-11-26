import React, { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { RenewalDetail } from '../api/types';

type R = RouteProp<AppStackParamList, 'RenewalSameQuote'>;
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayMonth = (iso?: string | null) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]}`; };
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');

export function RenewalSameQuoteScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [r, setR] = useState<RenewalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [premium, setPremium] = useState('');
  const [busy, setBusy] = useState(false);
  const idem = useRef(newIdempotencyKey());

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.renewals.get(params.id); setR(data); if (data.premium) setPremium(String(data.premium)); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this renewal.'); }
    finally { setLoading(false); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !r) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const base = Number(premium || 0);
  const gst = Math.round(base * 0.18);
  const total = base + gst;
  const lastYear = r.premium ?? 0;
  const pct = lastYear ? Math.round(((total - lastYear) / lastYear) * 1000) / 10 : null;

  const generate = async () => {
    if (!base) { setError('Enter the renewal premium.'); return; }
    setBusy(true); setError(null);
    try {
      const { data } = await api.renewals.renewalQuotation(params.id, { mode: 'SAME_POLICY', typedRenewalPremium: base }, { idempotencyKey: idem.current });
      const q = data?.quotation ?? data;
      if (q?.id) navigation.replace('QuoteDetail', { id: q.id, number: q.number ?? undefined, customerName: r.customer?.name });
      else navigation.goBack();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not generate the quotation.'); setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Renewal quotation</Text>
          <Text style={styles.navSub} numberOfLines={1}>Same policy{r.policy?.product ? ` · ${r.policy.product}` : ''}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.note}>
            <Icon name="refresh-cw" size={16} color={colors.blue} />
            <Text style={styles.noteText} numberOfLines={2}>Renewal of {r.policy?.policyNumber ?? 'policy'}{r.dueDate ? ` · ends ${dayMonth(r.dueDate)}` : ''}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Carried over</Text>
            {r.customer?.name ? <KV label="People" value={r.customer.name} /> : null}
            {r.policy?.insurer ? <KV label="Insurer" value={r.policy.insurer} /> : null}
          </View>

          <View style={{ gap: 8 }}>
            <Text style={styles.label}>Renewal premium before GST *</Text>
            <View style={styles.premInput}><Text style={styles.cur}>₹</Text><TextInput value={premium} onChangeText={(t) => setPremium(t.replace(/[^\d]/g, ''))} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.muted} style={styles.premField} selectionColor={colors.blue} /></View>
          </View>

          <View style={styles.breakdown}>
            <KV label="GST 18%" value={rupees(gst)} />
            <KV label="Total" value={rupees(total)} />
            {lastYear ? <KV label="Last year" value={`${rupees(lastYear)}${pct !== null ? ` · ${pct > 0 ? '+' : ''}${pct}%` : ''}`} /> : null}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={generate}>
            <Icon name="zap" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Generating…' : 'Generate renewal quotation'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}
function KV({ label, value }: { label: string; value: string }) {
  return <View style={styles.kv}><Text style={styles.kvLabel}>{label}</Text><Text style={styles.kvValue} numberOfLines={2}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { padding: 16, gap: 12, paddingBottom: 24 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
  card: { backgroundColor: colors.bg, borderRadius: 22, padding: 16, gap: 10 },
  cardTitle: { fontSize: 16, fontFamily: family.bold, color: colors.text },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  premInput: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 50, backgroundColor: colors.bg, borderRadius: 16, borderWidth: 2, borderColor: colors.blue, paddingHorizontal: 16 },
  cur: { fontSize: 14, fontFamily: family.semibold, color: colors.muted },
  premField: { flex: 1, fontSize: 15, fontFamily: family.bold, color: colors.text, padding: 0 },
  breakdown: { backgroundColor: colors.bg, borderRadius: 22, padding: 16, gap: 10 },
  kv: { flexDirection: 'row', gap: 8 },
  kvLabel: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.muted },
  kvValue: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
