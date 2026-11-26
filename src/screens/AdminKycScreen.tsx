import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'AdminKyc'>;
const AV = ['#d9eafd', '#e9e3fc', '#fde8c9', '#d4f1e7'];
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

export function AdminKycScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [pending, setPending] = useState<any[]>([]);
  const [selId, setSelId] = useState<string | null>(params?.accountId ?? null);
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const idem = useRef(newIdempotencyKey());

  const loadList = useCallback(async () => {
    try { const { data } = await api.admin.accounts({ kyc: 'PENDING_REVIEW' }); const items = Array.isArray(data) ? data : data.items ?? data.accounts ?? []; setPending(items); if (!selId && items[0]) setSelId(items[0].id); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load KYC queue.'); }
    finally { setLoading(false); }
  }, [selId]);
  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { if (selId) api.admin.accountKyc(selId).then((r) => setKyc(r.data)).catch(() => setKyc(null)); }, [selId]);

  const decide = async (decision: 'VERIFY' | 'REJECT') => {
    if (!selId) return;
    if (decision === 'REJECT' && !reason.trim()) { setError('Enter a reason.'); return; }
    setBusy(true); setError(null);
    try {
      await api.admin.kycDecision(selId, { decision, reason: decision === 'REJECT' ? reason.trim() : undefined }, { idempotencyKey: idem.current });
      idem.current = newIdempotencyKey();
      setReason(''); setRejectMode(false);
      await loadList(); setKyc(null); setSelId(null);
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? e.message : 'Could not record the decision.'); }
    finally { setBusy(false); }
  };

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error && !pending.length) return <Centered><ErrorState message={error} onRetry={loadList} /></Centered>;

  const docs: any[] = Array.isArray(kyc?.documents) ? kyc.documents : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Advisor KYC</Text>
          <Text style={styles.navSub}>{pending.length} to review</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {pending.map((a, i) => {
          const on = a.id === selId;
          return (
            <Pressable key={a.id ?? i} style={[styles.row, on && styles.rowOn]} onPress={() => { setSelId(a.id); setRejectMode(false); }}>
              <View style={[styles.avatar, { backgroundColor: AV[i % AV.length] }]}><Text style={styles.avatarText}>{initials(a.name ?? 'A')}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>{a.name ?? a.businessName ?? 'Advisor'}</Text>
                <Text style={styles.rowSub} numberOfLines={1}>{a.businessName ?? a.plan ?? ''}</Text>
              </View>
              <View style={styles.pendChip}><Text style={styles.pendText}>Pending</Text></View>
            </Pressable>
          );
        })}

        {kyc ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{kyc.name ?? kyc.fullName ?? 'Advisor'}</Text>
              <KV label="PAN" value={kyc.pan ?? kyc.panNumber ?? '—'} />
              <KV label="Name on PAN" value={kyc.nameOnPan ?? kyc.name ?? '—'} />
              <KV label="IRDA licence" value={kyc.licenceNumber ?? kyc.irda ?? '—'} />
            </View>
            {docs.length ? docs.map((d, i) => (
              <View key={i} style={styles.doc}><Icon name="check" size={16} color={colors.green} /><Text style={styles.docText}>{d.fileName ?? d.name ?? 'Document'}</Text></View>
            )) : null}

            {rejectMode ? (
              <View style={{ gap: 8 }}>
                <Text style={styles.label}>Reason</Text>
                <TextInput value={reason} onChangeText={(t) => { setReason(t); if (error) setError(null); }} placeholder="Why is this rejected?" placeholderTextColor={colors.muted} style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]} multiline selectionColor={colors.blue} />
              </View>
            ) : (
              <Pressable style={styles.reject} onPress={() => setRejectMode(true)}>
                <Icon name="x" size={18} color={colors.red} /><Text style={styles.rejectText}>Reject with reason</Text>
              </Pressable>
            )}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        ) : pending.length ? <EmptyState icon="shield" title="Pick an advisor" subtitle="Select someone above to review." /> : <EmptyState icon="check-circle" title="All reviewed" subtitle="No KYC pending." />}
      </ScrollView>

      {kyc ? (
        <View style={styles.footer}>
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={() => decide(rejectMode ? 'REJECT' : 'VERIFY')}>
            <Icon name="check" size={18} color={colors.onPrimary} />
            <Text style={styles.ctaText}>{busy ? 'Working…' : rejectMode ? 'Confirm reject' : 'Verify KYC'}</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}
function KV({ label, value }: { label: string; value: string }) {
  return <View style={styles.kv}><Text style={styles.kvLabel}>{label}</Text><Text style={styles.kvValue} numberOfLines={1}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: 'transparent' },
  rowOn: { borderColor: colors.blue },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontFamily: family.bold, color: colors.navy },
  rowTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  rowSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  pendChip: { backgroundColor: '#f0ecfb', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  pendText: { fontSize: 12, fontFamily: family.semibold, color: '#5b3fb8' },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 12 },
  cardTitle: { fontSize: 16, fontFamily: family.bold, color: colors.text },
  kv: { flexDirection: 'row', alignItems: 'center' },
  kvLabel: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.muted },
  kvValue: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  doc: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#f5fbf8', borderWidth: 1, borderColor: '#c7ebda', borderRadius: 16, padding: 16 },
  docText: { fontSize: 13, fontFamily: family.bold, color: colors.green },
  reject: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#f2c4c8', borderRadius: 24 },
  rejectText: { fontSize: 15, fontFamily: family.semibold, color: colors.red },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
