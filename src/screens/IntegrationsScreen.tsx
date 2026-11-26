import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { isEmail } from '../lib/validate';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';

const PROVIDERS: { key: string; label: string; via: string; icon: IconName; tint: string; fg: string }[] = [
  { key: 'msg91', label: 'WhatsApp', via: 'MSG91', icon: 'message-circle', tint: '#e7f4ee', fg: '#127650' },
  { key: 'brevo', label: 'Email', via: 'Brevo', icon: 'mail', tint: '#e8f0fd', fg: '#1f5fd6' },
];

export function IntegrationsScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<any>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState<any>({});

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.integrations.list(); setData(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load integrations.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error && !data) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  const connOf = (key: string) => data?.[key] ?? data?.[key.toUpperCase()] ?? data?.connections?.[key] ?? {};

  const connect = async (key: string) => {
    const isWa = key === 'msg91';
    const body = isWa ? { authKey: f.authKey || undefined, waNumber: f.waNumber, namespace: f.namespace || undefined } : { apiKey: f.apiKey || undefined, fromEmail: f.fromEmail, fromName: f.fromName, replyTo: f.replyTo || undefined };
    if (!isWa && body.fromEmail && !isEmail(body.fromEmail)) { setError('Enter a valid from-email.'); return; }
    setBusy(true); setError(null);
    try { await api.integrations.connect(key, body); setOpen(null); setF({}); await load(); }
    catch (e) { setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not connect.'); }
    finally { setBusy(false); }
  };
  const test = async (key: string) => { try { await api.integrations.test(key); Alert.alert('Test sent', 'Check your WhatsApp/email.'); } catch (e) { Alert.alert('Test failed', e instanceof ApiError ? e.message : 'Try again.'); } };
  const disconnect = (key: string) => Alert.alert('Disconnect?', 'Messages will go through Bimayantra again.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Disconnect', style: 'destructive', onPress: async () => { try { await api.integrations.disconnect(key); await load(); } catch { /* */ } } }]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.navTitle}>Integrations</Text>
      </View>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.intro}>Connect your own WhatsApp and email so messages go from your number and address.</Text>
          {PROVIDERS.map((p) => {
            const conn = connOf(p.key);
            const connected = !!(conn.connected || conn.status === 'CONNECTED');
            const isOpen = open === p.key;
            const isWa = p.key === 'msg91';
            return (
              <View key={p.key} style={styles.card}>
                <Pressable style={styles.cardHead} onPress={() => { setOpen(isOpen ? null : p.key); setF({}); setError(null); }}>
                  <View style={[styles.cardIcon, { backgroundColor: p.tint }]}><Icon name={p.icon} size={20} color={p.fg} /></View>
                  <View style={{ flex: 1 }}><Text style={styles.cardTitle}>{p.label}</Text><Text style={styles.cardSub}>via {p.via}{conn.keyLast4 ? ` · ••${conn.keyLast4}` : ''}</Text></View>
                  <View style={[styles.statusChip, { backgroundColor: connected ? '#e7f4ee' : '#eef1f5' }]}><Text style={[styles.statusText, { color: connected ? '#127650' : '#44526a' }]}>{connected ? 'Connected' : 'Not connected'}</Text></View>
                </Pressable>

                {isOpen ? (
                  <View style={styles.form}>
                    <Field label={isWa ? 'MSG91 auth key' : 'Brevo API key'}><TextInput secureTextEntry value={f[isWa ? 'authKey' : 'apiKey'] ?? ''} onChangeText={(t) => setF((x: any) => ({ ...x, [isWa ? 'authKey' : 'apiKey']: t }))} placeholder={connected ? 'Leave blank to keep' : isWa ? 'Paste your auth key' : 'xkeysib-…'} placeholderTextColor={colors.muted} autoCapitalize="none" style={styles.input} selectionColor={colors.blue} /></Field>
                    {isWa ? (
                      <>
                        <Field label="WhatsApp number"><TextInput value={f.waNumber ?? conn.config?.waNumber ?? ''} onChangeText={(t) => setF((x: any) => ({ ...x, waNumber: t.replace(/[^\d]/g, '') }))} keyboardType="number-pad" placeholder="919876543210" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></Field>
                        <Field label="Namespace (optional)"><TextInput value={f.namespace ?? conn.config?.namespace ?? ''} onChangeText={(t) => setF((x: any) => ({ ...x, namespace: t }))} autoCapitalize="none" placeholder="Only if MSG91 asks" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></Field>
                      </>
                    ) : (
                      <>
                        <Field label="From email"><TextInput value={f.fromEmail ?? conn.config?.fromEmail ?? ''} onChangeText={(t) => setF((x: any) => ({ ...x, fromEmail: t }))} keyboardType="email-address" autoCapitalize="none" placeholder="you@yourdomain.in" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></Field>
                        <Field label="From name"><TextInput value={f.fromName ?? conn.config?.fromName ?? ''} onChangeText={(t) => setF((x: any) => ({ ...x, fromName: t }))} placeholder="Your name / agency" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></Field>
                      </>
                    )}
                    {error ? <Text style={styles.error}>{error}</Text> : null}
                    <Pressable style={[styles.connectBtn, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={() => connect(p.key)}><Icon name="link" size={18} color={colors.onPrimary} /><Text style={styles.connectText}>{busy ? 'Connecting…' : connected ? 'Update' : 'Connect'}</Text></Pressable>
                    {connected ? (
                      <View style={styles.connRow}>
                        <Pressable style={styles.ghostSm} onPress={() => test(p.key)}><Text style={styles.ghostSmText}>Send test</Text></Pressable>
                        <Pressable style={styles.ghostSm} onPress={() => disconnect(p.key)}><Text style={[styles.ghostSmText, { color: colors.red }]}>Disconnect</Text></Pressable>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
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
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  intro: { fontSize: 13, lineHeight: 19, fontFamily: family.medium, color: colors.muted },
  card: { backgroundColor: colors.surface, borderRadius: 18, overflow: 'hidden' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  cardIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontFamily: family.bold, color: colors.text },
  cardSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  statusText: { fontSize: 12, fontFamily: family.semibold },
  form: { paddingHorizontal: 14, paddingBottom: 16, gap: 12 },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  connectBtn: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  connectText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
  connRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  ghostSm: { paddingVertical: 4 },
  ghostSmText: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
});
