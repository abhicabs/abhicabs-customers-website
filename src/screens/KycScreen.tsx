import React, { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { API_BASE, CLIENT_HEADER } from '../config/env';
import { tokenStore } from '../auth/tokenStore';
import { colors, family, shadow } from '../theme/theme';

const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (iso?: string | null) => { if (!iso) return null; const d = new Date(iso); return `${d.getDate()} ${MO[d.getMonth()]}`; };

async function uploadFile(purpose: 'KYC_PAN' | 'KYC_LICENCE'): Promise<{ id: string; name: string } | null> {
  const picked = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
  if (picked.canceled || !picked.assets?.[0]) return null;
  const asset = picked.assets[0];
  const token = tokenStore.getAccess();
  const blob = await (await fetch(asset.uri)).blob();
  const up = await fetch(`${API_BASE}/files?purpose=${purpose}`, {
    method: 'POST',
    headers: { Authorization: token ? `Bearer ${token}` : '', 'X-Client': CLIENT_HEADER, 'X-File-Name': encodeURIComponent(asset.name ?? 'document'), 'Content-Type': asset.mimeType ?? 'application/octet-stream' },
    body: blob,
  });
  const j = await up.json().catch(() => ({} as any));
  if (!up.ok || !j?.data?.id) throw new ApiError({ status: up.status, ...(j?.error || { message: 'Upload failed' }) });
  return { id: j.data.id, name: asset.name ?? 'document' };
}

export function KycScreen() {
  const navigation = useNavigation<any>();
  const [k, setK] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // submit form state
  const [pan, setPan] = useState('');
  const [nameOnPan, setNameOnPan] = useState('');
  const [panFile, setPanFile] = useState<{ id: string; name: string } | null>(null);
  const [licFile, setLicFile] = useState<{ id: string; name: string } | null>(null);
  const [declared, setDeclared] = useState(true);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.kyc.get(); setK(data); if (data.sections?.personal?.fullName) setNameOnPan(data.sections.personal.fullName); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load KYC.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !k) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const status = k.status ?? k.kycStatus ?? 'NOT_SUBMITTED';
  const canSubmit = status === 'NOT_SUBMITTED' || status === 'REJECTED';

  const pick = async (which: 'PAN' | 'LIC') => {
    setFormError(null);
    try { const f = await uploadFile(which === 'PAN' ? 'KYC_PAN' : 'KYC_LICENCE'); if (f) (which === 'PAN' ? setPanFile : setLicFile)(f); }
    catch (e) { setFormError(e instanceof ApiError ? e.message : 'Could not upload the file.'); }
  };

  const submit = async () => {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase())) { setFormError('Enter a valid PAN (e.g. ABCPR1234K).'); return; }
    if (!nameOnPan.trim()) { setFormError('Enter the name on PAN.'); return; }
    if (!panFile) { setFormError('Upload the PAN card.'); return; }
    if (!licFile) { setFormError('Upload the IRDAI licence.'); return; }
    if (!declared) { setFormError('Confirm the declaration.'); return; }
    setBusy(true); setFormError(null);
    try {
      await api.kyc.submit({ version: k.version ?? 1, pan: pan.trim().toUpperCase(), nameOnPan: nameOnPan.trim(), panFileId: panFile.id, licenceFileId: licFile.id, declaration: true }, { idempotencyKey: idem.current });
      await load();
    } catch (e) { idem.current = newIdempotencyKey(); setFormError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not submit KYC.'); }
    finally { setBusy(false); }
  };

  const hero = status === 'VERIFIED' ? { grad: ['#d4f1e7', '#b9e8d7'] as [string, string], chipBg: '#e7f4ee', chipFg: '#127650', label: 'Verified', title: 'KYC verified', icon: 'check' as IconName }
    : status === 'REJECTED' ? { grad: ['#fde8ec', '#fbd3dc'] as [string, string], chipBg: '#fbebec', chipFg: '#b4323c', label: 'Rejected', title: 'Resubmit required', icon: 'alert-circle' as IconName }
    : status === 'NOT_SUBMITTED' ? { grad: ['#f1f3f8', '#e7ebf2'] as [string, string], chipBg: '#eef1f5', chipFg: '#44526a', label: 'Not submitted', title: 'Submit your KYC', icon: 'upload' as IconName }
    : { grad: ['#e9e3fc', '#dcd2fb'] as [string, string], chipBg: '#f0ecfb', chipFg: '#5b3fb8', label: 'Pending review', title: 'Under review', icon: 'clock' as IconName };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>KYC</Text>
          <Text style={styles.navSub}>{hero.label}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <LinearGradient colors={hero.grad} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.hero}>
            <View style={[styles.chip, { backgroundColor: hero.chipBg }]}><Icon name={hero.icon} size={13} color={hero.chipFg} /><Text style={[styles.chipText, { color: hero.chipFg }]}>{hero.label}</Text></View>
            <Text style={styles.heroTitle}>{hero.title}</Text>
            {status === 'REJECTED' && k.rejectionReason ? <Text style={[styles.heroSub, { color: '#8b3a4c' }]}>{k.rejectionReason}</Text>
              : canSubmit ? <Text style={styles.heroSub}>SkyUp checks it once</Text>
              : shortDate(k.submittedAt) ? <Text style={styles.heroSub}>Submitted {shortDate(k.submittedAt)} · usually 2 working days</Text> : null}
          </LinearGradient>

          {canSubmit ? (
            <>
              <View style={styles.row2}>
                <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>PAN *</Text><TextInput value={pan} onChangeText={(t) => setPan(t.toUpperCase())} autoCapitalize="characters" maxLength={10} placeholder="ABCPR1234K" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></View>
                <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Name on PAN *</Text><TextInput value={nameOnPan} onChangeText={setNameOnPan} placeholder="Name" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></View>
              </View>

              <Pressable style={[styles.upload, panFile ? styles.uploadDone : styles.uploadPending]} onPress={() => pick('PAN')}>
                <View style={styles.uploadIcon}><Icon name={panFile ? 'check' : 'upload'} size={20} color={panFile ? colors.green : colors.text} /></View>
                <Text style={[styles.uploadText, panFile && { color: colors.green }]}>{panFile ? `PAN card · ${panFile.name}` : 'PAN card · upload'}</Text>
              </Pressable>

              <Pressable style={[styles.upload, licFile ? styles.uploadDone : styles.uploadPending]} onPress={() => pick('LIC')}>
                <View style={styles.uploadIcon}><Icon name={licFile ? 'check' : 'upload'} size={20} color={licFile ? colors.green : colors.text} /></View>
                <Text style={[styles.uploadText, licFile && { color: colors.green }]}>{licFile ? `IRDAI licence · ${licFile.name}` : 'IRDAI licence · upload'}</Text>
              </Pressable>

              <Pressable style={styles.declRow} onPress={() => setDeclared((d) => !d)}>
                <View style={[styles.check, declared && styles.checkOn]}>{declared ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
                <Text style={styles.declText}>These documents are mine and valid</Text>
              </Pressable>

              {formError ? <Text style={styles.error}>{formError}</Text> : null}
            </>
          ) : (
            (Array.isArray(k.documents) ? k.documents : []).map((d: any, i: number) => (
              <View key={i} style={styles.item}>
                <View style={styles.tile}><Icon name={d.type === 'PAN' ? 'credit-card' : 'folder'} size={17} color={colors.text} /></View>
                <View style={{ flex: 1 }}><Text style={styles.itemTitle}>{d.label ?? d.type ?? 'Document'}</Text><Text style={styles.itemSub} numberOfLines={1}>{d.value ?? d.number ?? d.fileName ?? '—'}</Text></View>
                <View style={[styles.docChip, { backgroundColor: status === 'VERIFIED' ? '#e7f4ee' : '#f0ecfb' }]}><Text style={[styles.docChipText, { color: status === 'VERIFIED' ? '#127650' : '#5b3fb8' }]}>{status === 'VERIFIED' ? 'Verified' : 'Submitted'}</Text></View>
              </View>
            ))
          )}
        </ScrollView>

        {canSubmit ? (
          <View style={styles.footer}>
            <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={submit}>
              <Icon name="send" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Submitting…' : 'Submit for review'}</Text>
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>
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
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120, gap: 12 },
  hero: { borderRadius: 22, padding: 16, gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  heroTitle: { fontSize: 18, lineHeight: 24, fontFamily: family.bold, color: colors.text },
  heroSub: { fontSize: 12, lineHeight: 18, fontFamily: family.medium, color: '#44526a' },
  row2: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  upload: { alignItems: 'center', gap: 8, borderRadius: 18, padding: 18 },
  uploadPending: { backgroundColor: '#f7f9ff', borderWidth: 1, borderColor: '#9db8ee', borderStyle: 'dashed' },
  uploadDone: { backgroundColor: '#f5fbf8', borderWidth: 1, borderColor: '#c7ebda' },
  uploadIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  uploadText: { fontSize: 13, fontFamily: family.bold, color: colors.text, textAlign: 'center' },
  declRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f3f7ff', borderRadius: 14, padding: 12 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  declText: { flex: 1, fontSize: 13, fontFamily: family.bold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  tile: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#d9eafd', alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  itemSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  docChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  docChipText: { fontSize: 12, fontFamily: family.semibold },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
