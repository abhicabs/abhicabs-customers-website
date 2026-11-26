import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';

type Channel = 'META' | 'GOOGLE' | 'WEBSITE';
const CARDS: { key: Channel; icon: IconName; title: string; sub: string; tint: string; fg: string }[] = [
  { key: 'META', icon: 'bar-chart-2', title: 'Meta Ads', tint: '#e8f0fd', fg: '#1877f2', sub: 'Facebook & Instagram lead forms' },
  { key: 'GOOGLE', icon: 'search', title: 'Google Ads', tint: '#fde8ec', fg: '#ea4335', sub: 'Search & YouTube lead forms' },
  { key: 'WEBSITE', icon: 'globe', title: 'Website', tint: '#e7f4ee', fg: '#127650', sub: 'Your own site contact form' },
];

export function CampaignConnectScreen() {
  const navigation = useNavigation<any>();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());

  const oauth = async (ch: Channel) => {
    setBusy(true); setError(null); setInfo(null);
    try {
      const before = await api.campaigns.connections().then((r) => (Array.isArray(r.data) ? r.data.length : (r.data.items ?? r.data.connections ?? []).length)).catch(() => 0);
      const { data } = await api.campaigns.oauthStart(ch.toLowerCase());
      const openUrl = data?.url ?? data?.authUrl;
      if (!openUrl) { setError('Could not start sign-in. Try again.'); setBusy(false); return; }
      await WebBrowser.openBrowserAsync(openUrl);
      // Poll once the browser returns: did a connection get added/connected?
      const after = await api.campaigns.connections().then((r) => (Array.isArray(r.data) ? r.data : (r.data.items ?? r.data.connections ?? []))).catch(() => []);
      const connected = after.length > before || after.some((c: any) => (c.channel === ch) && (c.connected || c.status === 'CONNECTED' || c.status === 'ACTIVE'));
      if (connected) navigation.goBack();
      else { setInfo('If you finished sign-in, pull back to Campaigns to see it. Otherwise try again.'); setBusy(false); }
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not connect.'); setBusy(false); }
  };

  const connectWebsite = async () => {
    if (!name.trim()) { setError('Name this connection.'); return; }
    setBusy(true); setError(null);
    try { await api.campaigns.connect({ channel: 'WEBSITE', name: name.trim(), contactPageUrl: url.trim() || undefined }, { idempotencyKey: idem.current }); navigation.goBack(); }
    catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not connect.'); setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => (channel ? setChannel(null) : navigation.goBack())}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.navTitle}>{channel === 'META' ? 'Connect Meta Ads' : channel === 'GOOGLE' ? 'Connect Google Ads' : channel === 'WEBSITE' ? 'Connect website' : 'Connect a channel'}</Text>
      </View>

      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {!channel && CARDS.map((c) => (
            <Pressable key={c.key} style={styles.card} onPress={() => { setChannel(c.key); setError(null); setInfo(null); }}>
              <View style={[styles.cardIcon, { backgroundColor: c.tint }]}><Icon name={c.icon} size={20} color={c.fg} /></View>
              <View style={{ flex: 1 }}><Text style={styles.cardTitle}>{c.title}</Text><Text style={styles.cardSub}>{c.sub}</Text></View>
              <Icon name="chevron-right" size={18} color={colors.grayBar} />
            </Pressable>
          ))}

          {(channel === 'META' || channel === 'GOOGLE') && (
            <>
              <Text style={styles.h1}>Sign in with {channel === 'META' ? 'Facebook' : 'Google'}</Text>
              <Text style={styles.p}>Use the account that manages your ads. We only read ads, lead forms and pages. We never post.</Text>
              <Pressable style={[styles.oauthBtn, { backgroundColor: channel === 'META' ? '#1877f2' : '#ea4335' }, busy && { opacity: 0.6 }]} disabled={busy} onPress={() => oauth(channel)}>
                <Icon name="link" size={18} color="#fff" /><Text style={styles.oauthText}>{busy ? 'Opening…' : `Continue with ${channel === 'META' ? 'Facebook' : 'Google'}`}</Text>
              </Pressable>
              {info ? <View style={styles.note}><Icon name="alert-circle" size={16} color={colors.blue} /><Text style={styles.noteText}>{info}</Text></View> : null}
            </>
          )}

          {channel === 'WEBSITE' && (
            <>
              <Text style={styles.h1}>Connect your website</Text>
              <View style={{ gap: 8 }}><Text style={styles.label}>Connection name *</Text><TextInput value={name} onChangeText={setName} placeholder="e.g. Website contact form" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></View>
              <View style={{ gap: 8 }}><Text style={styles.label}>Contact page URL</Text><TextInput value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" placeholder="https://yoursite.in/contact" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></View>
              <View style={styles.note}><Icon name="alert-circle" size={16} color={colors.blue} /><Text style={styles.noteText}>We give you an embed snippet after connecting so leads flow in automatically.</Text></View>
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        {channel === 'WEBSITE' ? (
          <View style={styles.footer}><Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={connectWebsite}><Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Connecting…' : 'Connect website'}</Text></Pressable></View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  body: { padding: 16, gap: 12, paddingBottom: 24 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bg, borderRadius: 18, padding: 14 },
  cardIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontFamily: family.bold, color: colors.text },
  cardSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  h1: { fontSize: 22, fontFamily: family.bold, color: colors.text, letterSpacing: -0.22 },
  p: { fontSize: 14, lineHeight: 21, fontFamily: family.medium, color: colors.muted },
  oauthBtn: { height: 52, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  oauthText: { fontSize: 15, fontFamily: family.semibold, color: '#fff' },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
