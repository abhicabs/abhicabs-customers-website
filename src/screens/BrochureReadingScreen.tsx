import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { API_BASE, CLIENT_HEADER } from '../config/env';
import { tokenStore } from '../auth/tokenStore';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'BrochureReading'>;
type Phase = 'UPLOAD' | 'READING' | 'REVIEW' | 'FAILED';

export function BrochureReadingScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [phase, setPhase] = useState<Phase>('UPLOAD');
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const poll = useRef<any>(null);

  const stopPoll = () => { if (poll.current) clearInterval(poll.current); poll.current = null; };
  useEffect(() => () => stopPoll(), []);

  const refresh = useCallback(async (id: string) => {
    try {
      const { data } = await api.products.reading(id);
      setJob(data);
      const st = (data.status ?? '').toUpperCase();
      if (st === 'REVIEW_REQUIRED' || st === 'REVIEWED' || st === 'DONE') { stopPoll(); setPhase('REVIEW'); }
      else if (st === 'FAILED') { stopPoll(); setPhase('FAILED'); }
    } catch { /* keep polling */ }
  }, []);

  const upload = async () => {
    setError(null);
    const picked = await DocumentPicker.getDocumentAsync({ type: ['application/pdf'], copyToCacheDirectory: true });
    if (picked.canceled || !picked.assets?.[0]) return;
    const a = picked.assets[0];
    setBusy(true);
    try {
      const token = tokenStore.getAccess();
      const blob = await (await fetch(a.uri)).blob();
      const up = await fetch(`${API_BASE}/files?purpose=BROCHURE`, { method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : '', 'X-Client': CLIENT_HEADER, 'X-File-Name': encodeURIComponent(a.name ?? 'brochure.pdf'), 'Content-Type': 'application/pdf' }, body: blob });
      const uj = await up.json().catch(() => ({} as any));
      if (!up.ok || !uj?.data?.id) throw new ApiError({ status: up.status, ...(uj?.error || { message: 'Upload failed' }) });
      const { data } = await api.products.startReading({ typeId: params.typeId, fileId: uj.data.id, insurerId: params.insurerId }, { idempotencyKey: idem.current });
      setJobId(data.id); setPhase('READING');
      poll.current = setInterval(() => refresh(data.id), 2500);
      refresh(data.id);
    } catch (e) { setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not read the brochure.'); setBusy(false); }
    finally { setBusy(false); }
  };

  const accept = async (key: string) => { if (!jobId) return; try { await api.products.readingDecisions(jobId, { decisions: [{ key, decision: 'ACCEPT' }] }); refresh(jobId); } catch { /* */ } };
  const fix = (f: any) => { if (!jobId) return; Alert.prompt?.(`Correct ${f.label ?? f.key}`, undefined, async (v?: string) => { if (v != null) { await api.products.readingDecisions(jobId, { decisions: [{ key: f.key, decision: 'EDIT', value: v }] }); refresh(jobId); } }, 'plain-text', f.value ?? ''); };
  const acceptHigh = async () => { if (!jobId) return; setBusy(true); try { await api.products.readingAcceptHigh(jobId); await refresh(jobId); } finally { setBusy(false); } };
  const retry = async () => { if (!jobId) return; setBusy(true); try { await api.products.readingRetry(jobId); setPhase('READING'); poll.current = setInterval(() => refresh(jobId), 2500); } finally { setBusy(false); } };

  const createProduct = async () => {
    if (!jobId) return;
    setBusy(true); setError(null);
    try {
      const { data: result } = await api.products.readingResult(jobId);
      const name = result?.name ?? result?.data?.name ?? job?.fields?.find((x: any) => /name/i.test(x.key))?.value ?? 'New product';
      const { data } = await api.products.ownCreate({ insurerId: params.insurerId!, typeId: params.typeId, code: String(name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 20), data: result?.data ?? { name }, ocrJobId: jobId } as any, { idempotencyKey: newIdempotencyKey() });
      if (data?.id) navigation.replace('ProductDetail', { id: data.id, name });
      else navigation.popToTop();
    } catch (e) { setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not create the product.'); setBusy(false); }
  };

  const fields: any[] = job?.fields ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}><Text style={styles.navTitle}>Read brochure</Text>{params.typeName || params.insurerName ? <Text style={styles.navSub} numberOfLines={1}>{[params.insurerName, params.typeName].filter(Boolean).join(' · ')}</Text> : null}</View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {phase === 'UPLOAD' && (
          <>
            <View style={styles.premHero}><Icon name="zap" size={18} color="#5b3fb8" /><Text style={styles.premText}>Premium: upload the brochure PDF and we read every value for you to check.</Text></View>
            <Pressable style={[styles.bigBtn, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={upload}><Icon name="upload" size={18} color={colors.onPrimary} /><Text style={styles.bigBtnText}>{busy ? 'Uploading…' : 'Upload brochure (PDF)'}</Text></Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        )}
        {phase === 'READING' && (
          <View style={styles.center}><ActivityIndicator color={colors.blue} size="large" /><Text style={styles.readingTitle}>Reading the brochure…</Text><Text style={styles.readingSub}>This takes up to a minute.</Text><Pressable style={styles.ghost} onPress={() => jobId && refresh(jobId)}><Icon name="refresh-cw" size={16} color={colors.text} /><Text style={styles.ghostText}>Refresh</Text></Pressable></View>
        )}
        {phase === 'REVIEW' && (
          <>
            <Text style={styles.sectionLabel}>READ VALUES{job?.threshold ? ` · auto-accept above ${job.threshold}%` : ''}</Text>
            {fields.length ? fields.map((f) => {
              const done = (f.decision ?? '').toUpperCase() === 'ACCEPT' || (f.decision ?? '').toUpperCase() === 'EDIT' || f.accepted;
              return (
                <View key={f.key} style={styles.fieldRow}>
                  <View style={{ flex: 1 }}><Text style={styles.fieldLabel}>{f.label ?? f.key}</Text><Text style={styles.fieldValue} numberOfLines={2}>{String(f.value ?? '—')}{f.confidence != null ? ` · ${f.confidence}%` : ''}</Text></View>
                  {done ? <Icon name="check" size={18} color={colors.green} /> : (
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Pressable style={styles.sbtn} onPress={() => fix(f)}><Text style={styles.sbtnText}>Fix</Text></Pressable>
                      <Pressable style={[styles.sbtn, styles.sbtnOk]} onPress={() => accept(f.key)}><Text style={[styles.sbtnText, { color: '#127650' }]}>Accept</Text></Pressable>
                    </View>
                  )}
                </View>
              );
            }) : <EmptyState icon="file-text" title="No values read" subtitle="You can still create the product manually." />}
            <Pressable style={styles.ghost} onPress={acceptHigh}><Icon name="check-circle" size={16} color={colors.text} /><Text style={styles.ghostText}>Accept all above threshold</Text></Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        )}
        {phase === 'FAILED' && (
          <View style={styles.center}><View style={styles.failIcon}><Icon name="alert-triangle" size={28} color="#b4323c" /></View><Text style={styles.readingTitle}>Reading failed</Text><Text style={styles.readingSub}>The brochure couldn’t be read. Try a clearer PDF.</Text><Pressable style={[styles.bigBtn, shadow.button, { marginTop: 8 }]} onPress={retry}><Icon name="refresh-cw" size={18} color={colors.onPrimary} /><Text style={styles.bigBtnText}>Retry reading</Text></Pressable></View>
        )}
      </ScrollView>

      {phase === 'REVIEW' ? (
        <View style={styles.footer}><Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={createProduct}><Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Creating…' : 'Create product'}</Text></Pressable></View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { padding: 16, gap: 12, paddingBottom: 110 },
  premHero: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f0ecfb', borderRadius: 18, padding: 16 },
  premText: { flex: 1, fontSize: 13, lineHeight: 19, fontFamily: family.semibold, color: '#5b3fb8' },
  bigBtn: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bigBtnText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
  center: { alignItems: 'center', gap: 8, paddingVertical: 50 },
  readingTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text, marginTop: 8 },
  readingSub: { fontSize: 13, fontFamily: family.medium, color: colors.muted, textAlign: 'center' },
  failIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fbebec', alignItems: 'center', justifyContent: 'center' },
  ghost: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, marginTop: 8 },
  ghostText: { fontSize: 14, fontFamily: family.semibold, color: colors.text },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f7f9ff', borderRadius: 16, padding: 14 },
  fieldLabel: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  fieldValue: { fontSize: 14, fontFamily: family.bold, color: colors.text, marginTop: 2 },
  sbtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  sbtnOk: { backgroundColor: '#e7f4ee', borderColor: '#c7ebda' },
  sbtnText: { fontSize: 12, fontFamily: family.bold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
