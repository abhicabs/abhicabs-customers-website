import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { pickAndUpload } from '../lib/upload';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [business, setBusiness] = useState('');
  const [licence, setLicence] = useState('');
  const [email, setEmail] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.profile.get();
      setP(data);
      setFullName(data.sections?.personal?.fullName ?? '');
      setBusiness(data.sections?.business?.displayName ?? '');
      setLicence(data.sections?.professional?.licenceNumber ?? '');
      setEmail(data.sections?.contact?.email ?? '');
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load your profile.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = async () => {
    if (!p) return;
    setSaving(true); setError(null);
    const s = p.sections;
    try {
      if (fullName.trim() && fullName !== s.personal?.fullName)
        await api.profile.save('personal', { version: s.personal.version, fullName: fullName.trim(), dob: s.personal.dob ?? undefined, gender: s.personal.gender ?? undefined });
      if (business !== (s.business?.displayName ?? ''))
        await api.profile.save('business', { version: s.business.version, displayName: business.trim() || undefined, gstin: s.business.gstin ?? undefined });
      if (licence !== (s.professional?.licenceNumber ?? ''))
        await api.profile.save('professional', { version: s.professional.version, advisorType: s.professional.advisorType ?? undefined, licenceNumber: licence.trim() || undefined, licenceValidUntil: s.professional.licenceValidUntil ?? undefined, categories: s.professional.categories ?? [] });
      if (email !== (s.contact?.email ?? ''))
        await api.profile.save('contact', { version: s.contact.version, email: email.trim() || undefined, altMobile: s.contact.altMobile ?? undefined, address1: s.contact.address1 ?? undefined, city: s.contact.city ?? undefined, state: s.contact.state ?? undefined, pin: s.contact.pin ?? undefined });
      await load();
      Alert.alert('Saved', 'Profile updated.');
    } catch (e) {
      if (e instanceof ApiError) setError(Object.values(e.fieldErrors)[0] || e.message);
      else setError('Could not save your profile.');
      await load();
    } finally { setSaving(false); }
  };

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error && !p) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  const pct = p?.completion?.percent;
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Profile</Text>
          {typeof pct === 'number' ? <Text style={styles.navSub}>{pct}% complete</Text> : null}
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <LinearGradient colors={['#fbd3dc', '#f6b3c3']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.hero}>
            <Text style={styles.heroTitle}>{fullName || '—'}</Text>
            <Text style={styles.heroSub}>{[business || 'Independent advisor', licence ? `IRDAI ${licence}` : null].filter(Boolean).join(' · ')}</Text>
          </LinearGradient>

          <Field label="Full name *"><TextInput value={fullName} onChangeText={setFullName} style={styles.input} selectionColor={colors.blue} placeholderTextColor={colors.muted} /></Field>
          <Field label="Business name"><TextInput value={business} onChangeText={setBusiness} style={styles.input} selectionColor={colors.blue} placeholder="Business name" placeholderTextColor={colors.muted} /></Field>
          <Field label="IRDAI licence"><TextInput value={licence} onChangeText={setLicence} style={styles.input} selectionColor={colors.blue} placeholder="IRDA/DB/…" placeholderTextColor={colors.muted} /></Field>
          <View style={styles.row2}>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={styles.label}>Mobile</Text>
              <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <Text style={styles.cur}>+91</Text>
                <Text style={[styles.inputText, { flex: 1 }]} numberOfLines={1}>{(p?.sections?.contact?.loginMobile ?? '').replace('+91', '')}</Text>
              </View>
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={styles.label}>Email</Text>
              <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} selectionColor={colors.blue} placeholder="name@email" placeholderTextColor={colors.muted} />
            </View>
          </View>

          <Pressable style={styles.upload} onPress={async () => { try { const file = await pickAndUpload('BUSINESS_LOGO', ['image/*']); if (file && p?.sections?.business) { await api.profile.save('business', { version: p.sections.business.version, logoFileId: file.id }); load(); } } catch { /* */ } }}>
            <View style={styles.uploadIcon}><Icon name={p?.sections?.business?.logoFileId ? 'check' : 'upload'} size={20} color={colors.green} /></View>
            <Text style={styles.uploadText}>{p?.sections?.business?.logoFileId ? 'Logo on quotations · uploaded' : 'Add your logo for quotations'}</Text>
          </Pressable>

          <Pressable style={styles.kycRow} onPress={() => navigation.navigate('Kyc')}>
            <View style={styles.kycIcon}><Icon name="shield" size={18} color={colors.blue} /></View>
            <View style={{ flex: 1 }}><Text style={styles.kycTitle}>KYC & documents</Text><Text style={styles.kycSub}>{p?.kycStatus === 'VERIFIED' ? 'Verified' : p?.kycStatus === 'PENDING_REVIEW' ? 'Under review' : p?.kycStatus === 'REJECTED' ? 'Action needed' : 'Submit PAN & licence'}</Text></View>
            <Icon name="chevron-right" size={16} color={colors.grayBar} />
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={[styles.cta, shadow.button, saving && { opacity: 0.6 }]} disabled={saving} onPress={save}>
            <Icon name="check" size={18} color={colors.onPrimary} />
            <Text style={styles.ctaText}>{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={{ gap: 8 }}><Text style={styles.label}>{label}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { padding: 16, gap: 12, paddingBottom: 24 },
  hero: { borderRadius: 22, padding: 16, gap: 10 },
  heroTitle: { fontSize: 18, lineHeight: 24, fontFamily: family.bold, color: colors.text },
  heroSub: { fontSize: 12, lineHeight: 18, fontFamily: family.medium, color: '#8b3a4c' },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  inputText: { fontSize: 14, fontFamily: family.semibold, color: colors.text },
  cur: { fontSize: 14, fontFamily: family.semibold, color: colors.muted },
  row2: { flexDirection: 'row', gap: 10 },
  upload: { alignItems: 'center', gap: 8, backgroundColor: '#f5fbf8', borderWidth: 1, borderColor: '#c7ebda', borderRadius: 18, padding: 18 },
  uploadIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  uploadText: { fontSize: 13, fontFamily: family.bold, color: colors.green, textAlign: 'center' },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  kycRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 16, padding: 12 },
  kycIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f0fd', alignItems: 'center', justifyContent: 'center' },
  kycTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  kycSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  footer: { padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
