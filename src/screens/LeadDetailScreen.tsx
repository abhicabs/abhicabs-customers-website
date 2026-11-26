import React, { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { relativeTime } from '../lib/format';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { LeadDetail, TimelineItem, LeadStatus, Priority } from '../api/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type R = RouteProp<AppStackParamList, 'LeadDetail'>;

const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (iso: string | null) => { if (!iso) return '—'; const d = new Date(iso); return `${d.getDate()} ${MO[d.getMonth()]}`; };
const ageDays = (iso: string) => { const d = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)); return d === 0 ? 'Today' : `${d} day${d === 1 ? '' : 's'}`; };

const STATUS_CHIP: Record<LeadStatus, { bg: string; fg: string }> = {
  NEW: { bg: '#d9eafd', fg: '#1f5fd6' }, CONTACTED: { bg: '#f0ecfb', fg: '#5b3fb8' }, QUALIFIED: { bg: '#d4f1e7', fg: '#127650' },
  FOLLOW_UP: { bg: '#fbf1e1', fg: '#8a5a12' }, CONVERTED: { bg: '#d4f1e7', fg: '#127650' }, LOST: { bg: '#eef1f5', fg: '#44526a' },
};
const PRI_CHIP: Record<Priority, { bg: string; fg: string; label: string }> = {
  HIGH: { bg: '#fbebec', fg: '#b4323c', label: 'High' }, MEDIUM: { bg: '#fbf1e1', fg: '#8a5a12', label: 'Medium' }, LOW: { bg: '#eef1f5', fg: '#44526a', label: 'Low' },
};
const TL_TABS = [
  { key: 'ALL', label: 'All', types: undefined as string | undefined },
  { key: 'CONTACT', label: 'Contacts', types: 'CONTACT' },
  { key: 'STATUS', label: 'Status', types: 'STATUS' },
  { key: 'MESSAGE', label: 'Messages', types: 'MESSAGE' },
];
const TL_STYLE: Record<string, { icon: IconName; bg: string }> = {
  FOLLOW_UP: { icon: 'calendar', bg: '#fde8c9' }, STATUS: { icon: 'refresh-cw', bg: '#e9e3fc' }, CONTACT: { icon: 'phone', bg: '#d9eafd' },
  CALL: { icon: 'phone', bg: '#d9eafd' }, MESSAGE: { icon: 'message-circle', bg: '#d4f1e7' }, TASK: { icon: 'check-square', bg: '#fde8c9' },
  QUOTATION: { icon: 'file-text', bg: '#e8f0fd' },
};

export function LeadDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R>();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tlTab, setTlTab] = useState('ALL');
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  const loadLead = useCallback(async () => {
    setError(null);
    try { const { data } = await api.leads.get(params.id); setLead(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load this lead.'); }
    finally { setLoading(false); }
  }, [params.id]);
  const loadTimeline = useCallback(async (types?: string) => {
    try { const { data } = await api.leads.timeline(params.id, types); setTimeline([...data].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())); }
    catch { setTimeline([]); }
  }, [params.id]);
  useFocusEffect(useCallback(() => { loadLead(); loadTimeline(TL_TABS.find((t) => t.key === tlTab)?.types); }, [loadLead, loadTimeline, tlTab]));

  const contact = (scheme: string) => {
    if (!lead) return;
    const num = lead.mobile.replace(/[^\d+]/g, '');
    const url = scheme === 'wa' ? `https://wa.me/${num.replace('+', '')}` : scheme === 'mail' ? `mailto:${lead.email ?? ''}` : `tel:${num}`;
    Linking.openURL(url).catch(() => undefined);
  };
  const soon = (title: string) => navigation.navigate('ComingSoon', { title });
  const keepWithdrawn = async () => { if (!lead) return; try { await api.leads.keepWithdrawal(lead.id, lead.version); loadLead(); } catch (e) { Alert.alert('Could not update', e instanceof ApiError ? e.message : 'Try again.'); } };
  const removeWithdrawn = () => { if (!lead) return; Alert.alert('Remove lead?', 'The lead and its open tasks are removed.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: async () => { try { await api.leads.remove(lead.id, { version: lead.version }); navigation.goBack(); } catch (e) { Alert.alert('Could not remove', e instanceof ApiError ? e.message : 'Try again.'); } } }]); };

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !lead) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={loadLead} /></Centered>;

  const sc = STATUS_CHIP[lead.status] ?? STATUS_CHIP.NEW;
  const pc = PRI_CHIP[lead.priority];
  const actions: { icon: IconName; label: string; bg: string; fg: string; onPress: () => void }[] = [
    { icon: 'phone', label: 'Call', bg: '#e8f0fd', fg: '#1f5fd6', onPress: () => contact('tel') },
    { icon: 'message-circle', label: 'WhatsApp', bg: '#e7f4ee', fg: '#127650', onPress: () => contact('wa') },
    { icon: 'mail', label: 'Email', bg: '#f0ecfb', fg: '#5b3fb8', onPress: () => contact('mail') },
    { icon: 'edit-3', label: 'Log', bg: '#fde8c9', fg: '#8a5a12', onPress: () => navigation.navigate('LogContact', { id: lead.id, name: lead.name }) },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.navbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Lead</Text>
        <Pressable style={[styles.moreBtn, shadow.iconBtn]} hitSlop={10} onPress={() => navigation.navigate('LeadMoreActions', { id: lead.id, current: lead.status, allowedMoves: lead.allowedMoves, version: lead.version })}>
          <Icon name="more-horizontal" size={19} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.headRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials(lead.name)}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{lead.name}</Text>
              <Text style={styles.sub} numberOfLines={1}>{lead.number}{lead.interests?.[0] ? ` · ${lead.interests[0]}` : ''}</Text>
            </View>
          </View>
          <View style={styles.chipRow}>
            <View style={[styles.chip, { backgroundColor: sc.bg }]}><Text style={[styles.chipText, { color: sc.fg }]}>{lead.statusLabel}</Text></View>
            <View style={[styles.chip, { backgroundColor: pc.bg }]}><Text style={[styles.chipText, { color: pc.fg }]}>{pc.label}</Text></View>
            {lead.source ? (
              <View style={styles.sourcePill}><Icon name="bar-chart-2" size={11} color={colors.blue} /><Text style={styles.sourceText} numberOfLines={1}>{lead.source}</Text></View>
            ) : null}
          </View>
          <View style={styles.actions}>
            {actions.map((a) => (
              <Pressable key={a.label} style={styles.action} onPress={a.onPress}>
                <View style={[styles.actionIcon, { backgroundColor: a.bg }]}><Icon name={a.icon} size={22} color={a.fg} /></View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {((lead as any).withdrawn || (lead as any).withdrawal || lead.status === 'WITHDRAWN') ? (
          <View style={styles.withdrawCard}>
            <Text style={styles.withdrawTitle}>Ad-form submission withdrawn</Text>
            <Text style={styles.withdrawSub}>This person withdrew their form submission. Their answers are cleared. Keep the lead or remove it.</Text>
            <View style={styles.withdrawRow}>
              <Pressable style={styles.withdrawRemove} onPress={removeWithdrawn}><Icon name="x" size={16} color={colors.red} /><Text style={styles.withdrawRemoveText}>Remove</Text></Pressable>
              <Pressable style={styles.withdrawKeep} onPress={keepWithdrawn}><Icon name="check" size={16} color={colors.onPrimary} /><Text style={styles.withdrawKeepText}>Keep lead</Text></Pressable>
            </View>
          </View>
        ) : null}

        {/* Mini stats */}
        <View style={styles.statsRow}>
          <Stat label="Contacts" value={String(lead.contacts.length)} />
          <Stat label="Next follow-up" value={shortDate(lead.nextFollowUpAt)} />
          <Stat label="Age" value={ageDays(lead.createdAt)} />
        </View>

        {/* Details */}
        <View style={styles.card}>
          <View style={styles.cardHead}><Text style={styles.cardTitle}>Details</Text><Pressable onPress={() => navigation.navigate('EditLead', { id: lead.id })}><Text style={styles.edit}>Edit</Text></Pressable></View>
          <KV label="Mobile" value={lead.mobile} />
          {lead.email ? <KV label="Email" value={lead.email} /> : null}
          {lead.altMobile ? <KV label="Alt mobile" value={lead.altMobile} /> : null}
          {lead.campaign ? <KV label="Campaign" value={lead.campaign} /> : null}
          <KV label="Source" value={lead.source} />
        </View>

        {/* Interests / form answers */}
        {lead.interests?.length ? (
          <View style={styles.cardAlt}>
            <Text style={styles.cardTitle}>Insurance interests</Text>
            <View style={styles.interests}>{lead.interests.map((i) => <View key={i} style={styles.interestChip}><Text style={styles.interestText}>{i}</Text></View>)}</View>
          </View>
        ) : null}

        {/* Lead journey */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lead journey</Text>
          <View style={styles.tlTabs}>
            {TL_TABS.map((t) => {
              const on = t.key === tlTab;
              return <Pressable key={t.key} onPress={() => { setTlTab(t.key); loadTimeline(t.types); }} style={[styles.tlTab, on ? styles.tlTabOn : styles.tlTabOff]}><Text style={[styles.tlTabText, { color: on ? colors.onPrimary : colors.muted3 }]}>{t.label}</Text></Pressable>;
            })}
          </View>
          {timeline.length === 0 ? <Text style={styles.tlEmpty}>Nothing here yet.</Text> : timeline.map((it, i) => {
            const st = TL_STYLE[it.type] ?? { icon: 'activity' as IconName, bg: colors.bg };
            return (
              <View key={`${it.refId ?? it.type}-${i}`} style={styles.tlRow}>
                <View style={[styles.tlIcon, { backgroundColor: st.bg }]}><Icon name={st.icon} size={14} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tlTitle} numberOfLines={2}>{it.title}</Text>
                  <Text style={styles.tlSub}>{[it.detail, relativeTime(it.at)].filter(Boolean).join(' · ')}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky: Change status + Convert */}
      <View style={styles.sticky}>
        <Pressable style={styles.changeBtn} onPress={() => navigation.navigate('LeadStatus', { id: lead.id, current: lead.status, allowedMoves: lead.allowedMoves, version: lead.version })}>
          <Icon name="refresh-cw" size={18} color={colors.text} />
          <Text style={styles.changeText}>Change status</Text>
        </Pressable>
        <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate('ConvertLead', { id: lead.id })}>
          <LinearGradient colors={['#f9c6d0', '#f29db0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.convertBtn}>
            <Icon name="user-check" size={18} color={colors.navy} />
            <Text style={styles.convertText}>Convert</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}
function Stat({ label, value }: { label: string; value: string }) {
  return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue} numberOfLines={1}>{value}</Text></View>;
}
function KV({ label, value }: { label: string; value: string }) {
  return <View style={styles.kv}><Text style={styles.kvLabel}>{label}</Text><Text style={styles.kvValue} numberOfLines={1}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  navbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, fontSize: 18, fontFamily: family.bold, color: colors.text },
  moreBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 14 },
  headerCard: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 12 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#fff', backgroundColor: '#e9e3fc', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontFamily: family.bold, color: colors.navy },
  name: { fontSize: 20, fontFamily: family.bold, color: colors.text, letterSpacing: -0.2 },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 3 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  sourcePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#e8f0fd', paddingLeft: 7, paddingRight: 9, paddingVertical: 3, borderRadius: 10 },
  sourceText: { fontSize: 11, fontFamily: family.bold, color: colors.blue },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1, alignItems: 'center', gap: 6 },
  actionIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 11, fontFamily: family.semibold, color: colors.text },
  withdrawCard: { backgroundColor: '#fbf1e1', borderRadius: 18, padding: 16, gap: 8 },
  withdrawTitle: { fontSize: 14, fontFamily: family.bold, color: '#8a5a12' },
  withdrawSub: { fontSize: 12, lineHeight: 18, fontFamily: family.medium, color: '#8a5a12' },
  withdrawRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  withdrawRemove: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#f2c4c8' },
  withdrawRemoveText: { fontSize: 14, fontFamily: family.semibold, color: colors.red },
  withdrawKeep: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 22, backgroundColor: colors.navy },
  withdrawKeepText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
  statsRow: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 12, alignItems: 'center', gap: 2 },
  statLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted },
  statValue: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 12 },
  cardAlt: { backgroundColor: '#f7f9ff', borderRadius: 22, padding: 16, gap: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', paddingTop: 4, paddingHorizontal: 2 },
  cardTitle: { flex: 1, fontSize: 16, fontFamily: family.bold, color: colors.text },
  edit: { fontSize: 13, fontFamily: family.bold, color: colors.blue },
  kv: { flexDirection: 'row', alignItems: 'center' },
  kvLabel: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.muted },
  kvValue: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  interests: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  interestChip: { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  interestText: { fontSize: 12, fontFamily: family.semibold, color: colors.text },
  tlTabs: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tlTab: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  tlTabOn: { backgroundColor: colors.navy },
  tlTabOff: { backgroundColor: colors.bg },
  tlTabText: { fontSize: 11, fontFamily: family.semibold },
  tlEmpty: { fontSize: 13, fontFamily: family.medium, color: colors.muted, paddingVertical: 4 },
  tlRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  tlIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  tlTitle: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  tlSub: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  sticky: { flexDirection: 'row', gap: 10, backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  changeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 24 },
  changeText: { fontSize: 14, fontFamily: family.semibold, color: colors.text },
  convertBtn: { height: 46, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  convertText: { fontSize: 14, fontFamily: family.semibold, color: colors.navy },
});
