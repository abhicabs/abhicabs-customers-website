import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '../components/Icon';
import { api } from '../api/endpoints';
import { isEmail, isMobile10 } from '../lib/validate';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef<string>('');

  const submit = async () => {
    if (!name.trim()) return setError('Enter your full name.');
    if (!isMobile10(mobile)) return setError('Enter a valid 10-digit mobile (starts 6-9).');
    if (!email.trim()) return setError('Enter your email.');
    if (!isEmail(email)) return setError('Enter a valid email.');
    if (!agree) return setError('Please accept the Terms to continue.');
    setError(null); setSaving(true);
    const full = `+91${mobile.replace(/\D/g, '')}`;
    try {
      const { data, meta } = await api.auth.registerOtp({ name: name.trim(), mobile: full, email: email.trim(), termsAccepted: true });
      navigation.navigate('LoginOtp', {
        mobile: full,
        maskedMobile: data.maskedMobile ?? null,
        codeLength: data.codeLength ?? 6,
        resendAfterSeconds: data.resendAfterSeconds ?? 30,
        register: true,
      } as any);
    } catch (e) {
      setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not start sign up.');
    } finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Create your account</Text>
      </View>

      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <LinearGradient colors={['#d4f1e7', '#b9e8d7']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.hero}>
            <View style={styles.chip}><Icon name="star" size={13} color="#127650" /><Text style={styles.chipText}>Normal plan</Text></View>
            <Text style={styles.heroTitle}>7-day free trial</Text>
            <Text style={styles.heroSub}>Full access, no card needed.</Text>
          </LinearGradient>

          <Field label="Full name *">
            <TextInput value={name} onChangeText={(t) => { setName(t); if (error) setError(null); }} placeholder="Your name" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} autoFocus />
          </Field>
          <Field label="Mobile number *">
            <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
              <Text style={styles.cur}>+91</Text>
              <TextInput value={mobile} onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))} keyboardType="number-pad" placeholder="98450 12345" placeholderTextColor={colors.muted} style={{ flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text }} selectionColor={colors.blue} />
            </View>
          </Field>
          <Field label="Email *">
            <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
              <Icon name="mail" size={18} color={colors.muted} />
              <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="name@email.in" placeholderTextColor={colors.muted} style={{ flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text }} selectionColor={colors.blue} />
            </View>
          </Field>

          <Pressable style={styles.terms} onPress={() => setAgree((a) => !a)}>
            <View style={[styles.check, agree && styles.checkOn]}>{agree ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
            <Text style={styles.termsText}>I agree to the Terms and Privacy policy</Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={[styles.cta, shadow.button, saving && { opacity: 0.6 }]} disabled={saving} onPress={submit}>
            <Icon name="arrow-right" size={18} color={colors.onPrimary} />
            <Text style={styles.ctaText}>{saving ? 'Sending…' : 'Send OTP and start trial'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={{ gap: 8, width: '100%' }}><Text style={styles.label}>{label}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  body: { padding: 16, gap: 12, paddingBottom: 24 },
  hero: { borderRadius: 22, padding: 16, gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: '#e7f4ee', paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold, color: '#127650' },
  heroTitle: { fontSize: 18, lineHeight: 24, fontFamily: family.bold, color: colors.text },
  heroSub: { fontSize: 12, lineHeight: 18, fontFamily: family.medium, color: '#2f6b55' },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text, justifyContent: 'center' },
  cur: { fontSize: 14, fontFamily: family.semibold, color: colors.muted },
  terms: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f3f7ff', borderRadius: 14, padding: 12 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  termsText: { flex: 1, fontSize: 13, fontFamily: family.bold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
