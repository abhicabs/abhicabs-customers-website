import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Icon, type IconName } from './Icon';
import { colors, family, shadow } from '../theme/theme';
import type { CustomerDetail } from '../api/types';

const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
const TABS = ['Overview', 'Family', 'Consent', 'Documents', 'Quotes', 'Policies', 'Payments', 'Renewals', 'Activity'];
// Which tab maps to which built screen; the rest open Coming soon.
const ROUTE: Record<string, string> = { Overview: 'PolicyHolderDetail', Family: 'PolicyHolderFamily', Consent: 'PolicyHolderConsent', Documents: 'PolicyHolderDocuments', Quotes: 'PolicyHolderQuotes', Policies: 'PolicyHolderPolicies', Activity: 'PolicyHolderActivity', Payments: 'PolicyHolderPayments', Renewals: 'PolicyHolderRenewals', Vehicles: 'PolicyHolderVehicles' };

export function ProfileHeader({ c, active }: { c: CustomerDetail; active: string }) {
  const navigation = useNavigation<any>();
  const contact = (scheme: string) => {
    const num = c.mobile.replace(/[^\d+]/g, '');
    Linking.openURL(scheme === 'wa' ? `https://wa.me/${num.replace('+', '')}` : `tel:${num}`).catch(() => undefined);
  };
  const soon = (title: string) => navigation.navigate('ComingSoon', { title });
  const onTab = (t: string) => {
    if (t === active) return;
    const r = ROUTE[t];
    if (r) navigation.navigate(r, { id: c.id, name: c.name });
    else soon(t);
  };

  const actions: { icon: IconName; label: string; onPress: () => void }[] = [
    { icon: 'phone', label: 'Call', onPress: () => contact('tel') },
    { icon: 'message-circle', label: 'WhatsApp', onPress: () => contact('wa') },
    { icon: 'file-text', label: 'Quote', onPress: () => navigation.navigate('QuoteBuilder', { customerId: c.id, customerName: c.name }) },
    { icon: 'target', label: 'Best fit', onPress: () => soon('Best fit') },
  ];

  return (
    <>
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.appbarTitle}>
          <Text style={styles.navName} numberOfLines={1}>{c.name}</Text>
          <Text style={styles.navSub} numberOfLines={1}>{c.number} · {c.status === 'INACTIVE' ? 'Inactive' : 'Active'}</Text>
        </View>
        <Pressable style={[styles.moreBtn, shadow.iconBtn]} hitSlop={10} onPress={() => navigation.navigate('PolicyHolderActions', { id: c.id, name: c.name, number: c.number, status: c.status, version: (c as any).version })}>
          <Icon name="more-horizontal" size={19} color={colors.text} />
        </Pressable>
      </View>

      <LinearGradient colors={['#fbd3dc', '#f6b3c3']} style={styles.header}>
        <View style={styles.headRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials(c.name)}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{c.name}</Text>
            <Text style={styles.occ} numberOfLines={1}>{[c.occupation, c.age ? `${c.age}` : null].filter(Boolean).join(' · ') || 'Policy holder'}</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <Stat label="Policies" value={String(c.policyCount ?? 0)} />
          <Stat label="Family" value={String(c.familyCount ?? c.family?.length ?? 0)} />
          <Stat label="Leads" value={String(c.leads?.length ?? 0)} />
        </View>
        <View style={styles.actions}>
          {actions.map((a) => (
            <Pressable key={a.label} style={styles.action} onPress={a.onPress}>
              <View style={styles.actionIcon}><Icon name={a.icon} size={19} color={colors.text} /></View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ptabs}>
        {TABS.map((t) => {
          const on = t === active;
          return (
            <Pressable key={t} style={[styles.ptab, on ? styles.ptabOn : styles.ptabOff]} onPress={() => onTab(t)}>
              <Text style={[styles.ptabText, { color: on ? colors.onPrimary : colors.muted2 }]}>{t}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  appbarTitle: { flex: 1, gap: 1 },
  navName: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  moreBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  header: { borderRadius: 22, padding: 16, gap: 12, marginHorizontal: 16, marginTop: 12 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#fff', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontFamily: family.bold, color: colors.navy },
  name: { fontSize: 19, fontFamily: family.bold, color: colors.text },
  occ: { fontSize: 12, fontFamily: family.medium, color: '#8b3a4c', marginTop: 3 },
  statRow: { flexDirection: 'row', gap: 8 },
  statCell: { flex: 1, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 14, padding: 10, alignItems: 'center', gap: 1 },
  statLabel: { fontSize: 10, fontFamily: family.bold, color: '#8b3a4c' },
  statValue: { fontSize: 15, fontFamily: family.bold, color: colors.text },
  actions: { flexDirection: 'row', gap: 8 },
  action: { flex: 1, alignItems: 'center', gap: 4 },
  actionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 11, fontFamily: family.semibold, color: colors.text },
  ptabs: { gap: 6, alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 2 },
  ptab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  ptabOn: { backgroundColor: colors.navy },
  ptabOff: { backgroundColor: colors.surface },
  ptabText: { fontSize: 12, fontFamily: family.semibold },
});
