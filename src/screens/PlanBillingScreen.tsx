import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { useAuth } from '../auth/AuthContext';
import { WEB_URL } from '../config/env';
import { colors, family, shadow } from '../theme/theme';

const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const longDate = (iso?: string | null) => { if (!iso) return '—'; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MO[d.getMonth()]} ${d.getFullYear()}`; };
const PLANS = [
  { key: 'NORMAL', name: 'Normal', desc: 'Core CRM · 2 assistants' },
  { key: 'PREMIUM', name: 'Premium', desc: 'Brochure reading, campaigns, more' },
];

export function PlanBillingScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const sub = user?.subscription;
  const statusLabel = sub?.status === 'TRIAL' ? 'Trial' : sub?.status ? sub.status.charAt(0) + sub.status.slice(1).toLowerCase() : '—';
  const planName = sub?.plan ?? 'Normal';
  const currentKey = (sub?.plan ?? 'NORMAL').toUpperCase().includes('PREM') ? 'PREMIUM' : 'NORMAL';
  const soon = (title: string) => navigation.navigate('ComingSoon', { title });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Plan and billing</Text>
          {sub?.status === 'TRIAL' && typeof sub.daysLeft === 'number' ? <Text style={styles.navSub}>Trial · {sub.daysLeft} days left</Text> : null}
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#e8f0fd', '#dce8fc']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.hero}>
          <View style={styles.chip}>
            <Icon name="clock" size={13} color={colors.blue} />
            <Text style={styles.chipText}>{statusLabel}</Text>
          </View>
          <Text style={styles.heroTitle}>{planName} plan · {statusLabel}</Text>
          {sub?.endsAt ? <Text style={styles.heroSub}>Ends {longDate(sub.endsAt)}</Text> : null}
        </LinearGradient>

        {PLANS.map((pl) => {
          const on = pl.key === currentKey;
          return (
            <Pressable key={pl.key} style={[styles.opt, on ? styles.optOn : styles.optOff]} onPress={() => soon(`${pl.name} plan`)}>
              <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optTitle}>{pl.name}</Text>
                <Text style={styles.optSub}>{pl.desc}</Text>
              </View>
            </Pressable>
          );
        })}

        <Text style={styles.sectionLabel}>INVOICES</Text>
        <Pressable style={styles.invoice} onPress={() => Linking.openURL(`${WEB_URL}/settings/billing`).catch(() => undefined)}>
          <View style={styles.invIcon}><Icon name="credit-card" size={17} color={colors.text} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.invTitle}>No invoices yet</Text>
            <Text style={styles.invSub}>{sub?.status === 'TRIAL' ? 'Trial is free' : 'Billing history'}</Text>
          </View>
          <Icon name="chevron-right" size={16} color={colors.grayBar} />
        </Pressable>

        <View style={styles.note}>
          <Icon name="alert-circle" size={16} color={colors.blue} />
          <Text style={styles.noteText}>Plans are paid to SkyUp. GST is added on the invoice.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.cta, shadow.button]} onPress={() => Linking.openURL(`${WEB_URL}/settings/billing`).catch(() => undefined)}>
          <Icon name="arrow-right" size={18} color={colors.onPrimary} />
          <Text style={styles.ctaText}>Choose plan</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
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
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: '#e8f0fd', paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold, color: colors.blue },
  heroTitle: { fontSize: 18, lineHeight: 24, fontFamily: family.bold, color: colors.text },
  heroSub: { fontSize: 12, lineHeight: 18, fontFamily: family.medium, color: colors.blue },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  optOff: {},
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  optTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  optSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6, marginTop: 2 },
  invoice: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  invIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#d9eafd', alignItems: 'center', justifyContent: 'center' },
  invTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  invSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
