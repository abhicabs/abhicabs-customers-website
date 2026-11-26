import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, type IconName } from '../components/Icon';
import { Card, SectionHeader, EmptyState } from '../components/ui';
import { TaskRow } from '../components/TaskRow';
import { TabBar } from '../components/TabBar';
import { api } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';
import { greeting, todayLabel, relativeTime, initials } from '../lib/format';
import { colors, spacing, radius, family, shadow } from '../theme/theme';
import type {
  Task,
  TaskTab,
  TaskListResult,
  LeadStatusCounts,
  FollowUps,
  LeadSources,
  CatalogueSummary,
  RenewalsDue,
  RecentActivity,
  AdLeadsToday,
} from '../api/types';

// ── static config ────────────────────────────────────────────────────────────
const QUICK: { label: string; icon: IconName; primary?: boolean }[] = [
  { label: 'New lead', icon: 'user-plus', primary: true },
  { label: 'New policy holder', icon: 'users' },
  { label: 'Best fit', icon: 'target' },
  { label: 'New quotation', icon: 'file-text' },
  { label: 'Comparison', icon: 'git-pull-request' },
  { label: 'Record payment', icon: 'credit-card' },
  { label: 'Proposal', icon: 'send' },
  { label: 'Record policy', icon: 'shield' },
  { label: 'Renewals', icon: 'refresh-cw' },
  { label: 'Documents', icon: 'folder' },
];

const TASK_TABS: { key: TaskTab; label: string }[] = [
  { key: 'TODAY', label: 'Today' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'OVERDUE', label: 'Overdue' },
  { key: 'DONE', label: 'Done' },
];

const sourceColor = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('meta') || l.includes('facebook')) return colors.blue;
  if (l.includes('referr')) return colors.green;
  if (l.includes('google')) return colors.googleBar;
  if (l.includes('website')) return colors.purple;
  if (l.includes('walk')) return colors.amber;
  return colors.grayBar;
};

const catStyle = (name: string): { bg: string; icon: IconName } => {
  const n = name.toLowerCase();
  if (n.includes('health')) return { bg: colors.amberSoft, icon: 'heart' };
  if (n.includes('motor') || n.includes('car')) return { bg: colors.blueSoft, icon: 'truck' };
  if (n.includes('life')) return { bg: colors.purpleSoft, icon: 'users' };
  if (n.includes('term')) return { bg: colors.renewalCard, icon: 'shield' };
  if (n.includes('travel')) return { bg: colors.greenSoft, icon: 'navigation' };
  return { bg: colors.bg, icon: 'box' };
};

const activityStyle = (action: string): { bg: string; icon: IconName } => {
  if (action.includes('STATUS') || action.includes('REOPEN') || action.includes('CONVERT')) return { bg: colors.purpleSoft, icon: 'refresh-cw' };
  if (action.includes('QUOT') || action.includes('DOCUMENT') || action.includes('PROPOSAL')) return { bg: colors.amberSoft, icon: 'file-text' };
  if (action.includes('CREATED') || action.includes('ADDED')) return { bg: colors.blueSoft, icon: 'user-plus' };
  return { bg: colors.bg, icon: 'activity' };
};

// ── screen ───────────────────────────────────────────────────────────────────
export function HomeScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>();
  const soon = (title: string) => navigation.navigate('ComingSoon', { title });
  const onQuick = (label: string) => {
    if (label === 'New lead') return navigation.navigate('LeadAdd');
    if (label === 'New policy holder') return navigation.navigate('AddPolicyHolder');
    if (label === 'New quotation') return navigation.navigate('QuoteBuilder');
    if (label === 'Comparison') return navigation.navigate('ComparisonBuilder');
    if (label === 'Best fit') return navigation.navigate('BestFit');
    if (label === 'Proposal') return navigation.navigate('Proposals');
    if (label === 'Renewals') return navigation.navigate('Renewals');
    if (label === 'Record payment') return navigation.navigate('Quotes');
    if (label === 'Record policy') return navigation.navigate('Policies');
    if (label === 'Documents') return navigation.navigate('DocumentsAll');
    return soon(label);
  };

  const [leads, setLeads] = useState<LeadStatusCounts | null>(null);
  const [followUps, setFollowUps] = useState<FollowUps | null>(null);
  const [sources, setSources] = useState<LeadSources | null>(null);
  const [catalogue, setCatalogue] = useState<CatalogueSummary | null>(null);
  const [renewals, setRenewals] = useState<RenewalsDue | null>(null);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [adLeads, setAdLeads] = useState<AdLeadsToday | null>(null);

  const [taskTab, setTaskTab] = useState<TaskTab>('TODAY');
  const [taskData, setTaskData] = useState<TaskListResult | null>(null);
  const [taskLoading, setTaskLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    // Each widget is independent: one failure never blanks the rest.
    const settle = <T,>(pr: Promise<{ data: T }>, set: (v: T) => void) =>
      pr.then((r) => set(r.data)).catch(() => undefined);
    await Promise.all([
      settle(api.dashboard.leadStatusCounts(), setLeads),
      settle(api.dashboard.followUps(), setFollowUps),
      settle(api.dashboard.leadSources(), setSources),
      settle(api.dashboard.catalogueSummary(), setCatalogue),
      settle(api.dashboard.renewalsDue(), setRenewals),
      settle(api.dashboard.recentActivity(), setActivity),
      settle(api.dashboard.adLeadsToday(), setAdLeads),
    ]);
  }, []);

  const loadTasks = useCallback(async (tab: TaskTab) => {
    setTaskLoading(true);
    try {
      const { data } = await api.tasks.list(tab);
      setTaskData(data);
    } catch {
      setTaskData(null);
    } finally {
      setTaskLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);
  useEffect(() => {
    loadTasks(taskTab);
  }, [taskTab, loadTasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboard(), loadTasks(taskTab)]);
    setRefreshing(false);
  };

  const toggleDone = async (t: Task) => {
    setBusyId(t.id);
    try {
      if (t.status === 'DONE') await api.tasks.reopen(t.id, t.version);
      else await api.tasks.done(t.id, t.version);
      await loadTasks(taskTab);
    } catch {
      /* surfaced on next refresh */
    } finally {
      setBusyId(null);
    }
  };

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const tasksToday = taskData?.counts.TODAY ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      {/* App bar */}
      <View style={styles.appbar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greet} numberOfLines={1}>
            {greeting()}, {firstName}
          </Text>
          <Text style={styles.sub}>
            {todayLabel()} · {tasksToday} task{tasksToday === 1 ? '' : 's'} today
          </Text>
        </View>
        <Pressable style={[styles.iconBtn, shadow.iconBtn]} onPress={() => navigation.navigate('Search')}>
          <Icon name="search" size={19} color={colors.text} />
        </Pressable>
        <Pressable style={[styles.iconBtn, shadow.iconBtn]} onPress={() => navigation.navigate('Notifications')}>
          <Icon name="bell" size={19} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.blue} />}
      >
        {/* Add task */}
        <Pressable onPress={() => navigation.navigate('AddTask')}>
          <LinearGradient
            colors={[colors.addFrom, colors.addTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.addTask, { shadowColor: colors.addTo }]}
          >
            <Icon name="plus" size={18} color={colors.navy} />
            <Text style={styles.addTaskText}>Add task</Text>
          </LinearGradient>
        </Pressable>

        {/* Quick actions */}
        <Card style={{ gap: 0 }}>
          <View style={styles.quickGrid}>
            {QUICK.map((q) => (
              <Pressable key={q.label} style={styles.quick} onPress={() => onQuick(q.label)}>
                <View style={[styles.quickBubble, q.primary ? styles.quickBubblePrimary : styles.quickBubbleSoft]}>
                  <Icon name={q.icon} size={19} color={q.primary ? colors.onPrimary : colors.text} />
                </View>
                <Text style={styles.quickLabel} numberOfLines={2}>
                  {q.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Leads at a glance */}
        <Card>
          <SectionHeader title="Leads at a glance" action={leads ? `All ${leads.total}` : 'All'} onPress={() => navigation.navigate('Leads')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statRow}>
            <StatCard label="Total" value={leads?.total ?? 0} navy />
            <StatCard label="New" value={leads?.byStatus.NEW ?? 0} bg={colors.blueSoft} />
            <StatCard label="Contacted" value={leads?.byStatus.CONTACTED ?? 0} bg={colors.purpleSoft} />
            <StatCard label="Qualified" value={leads?.byStatus.QUALIFIED ?? 0} bg={colors.greenSoft} />
            <StatCard label="Follow-up" value={leads?.byStatus.FOLLOW_UP ?? 0} bg={colors.amberSoft} />
            <StatCard label="Converted" value={leads?.byStatus.CONVERTED ?? 0} bg={colors.greenSoft2} />
            <StatCard label="Lost" value={leads?.byStatus.LOST ?? 0} bg="#eef1f5" />
          </ScrollView>
          <AlertRow
            icon="calendar"
            tone="amber"
            label="Follow-ups due today"
            value={followUps?.dueToday ?? 0}
            onPress={() => navigation.navigate('Leads')}
          />
          <AlertRow
            icon="alert-triangle"
            tone="red"
            label="Overdue follow-ups"
            value={followUps?.overdue ?? 0}
            onPress={() => navigation.navigate('Leads')}
          />
        </Card>

        {/* My tasks */}
        <Card>
          <SectionHeader title="My tasks" action="All" onPress={() => navigation.navigate('Tasks')} />
          <View style={styles.taskTabs}>
            {TASK_TABS.map((t) => {
              const on = t.key === taskTab;
              const count = taskData?.counts?.[t.key];
              const countColor = on ? colors.onPrimary : t.key === 'OVERDUE' ? colors.red : colors.muted;
              return (
                <Pressable key={t.key} onPress={() => setTaskTab(t.key)} style={[styles.taskTab, on && styles.taskTabOn]}>
                  <Text style={[styles.taskTabLabel, { color: on ? colors.onPrimary : colors.muted2 }]}>{t.label}</Text>
                  {typeof count === 'number' ? <Text style={[styles.taskTabCount, { color: countColor }]}>{count}</Text> : null}
                </Pressable>
              );
            })}
          </View>

          {taskLoading ? (
            <EmptyState icon="loader" title="Loading…" />
          ) : taskData && taskData.tasks.length > 0 ? (
            <View style={{ gap: spacing.md }}>
              {taskData.tasks.map((t) => (
                <TaskRow key={t.id} task={t} onToggle={toggleDone} busy={busyId === t.id} />
              ))}
            </View>
          ) : (
            <EmptyState title="Nothing here" subtitle="No tasks in this tab." />
          )}
        </Card>

        {/* Renewals due */}
        {renewals && renewals.items.length > 0 ? (
          <Card>
            <SectionHeader title="Renewals due" action="All" onPress={() => navigation.navigate('Renewals')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.lg }}>
              {renewals.items.map((r) => (
                <View key={r.id} style={styles.renewal}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(r.customer?.name ?? '?')}</Text>
                  </View>
                  <Text style={styles.renewalName} numberOfLines={1}>
                    {r.customer?.name ?? 'Customer'}
                  </Text>
                  <Text style={styles.renewalPlan} numberOfLines={1}>
                    {r.policy?.product ?? r.policy?.insurer ?? '—'}
                  </Text>
                  <View style={styles.daysChip}>
                    <Icon name="clock" size={12} color={colors.amber} />
                    <Text style={styles.daysChipText}>{Math.max(0, r.daysLeft)} days</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Card>
        ) : null}

        {/* Ad leads today */}
        {adLeads && adLeads.count > 0 ? (
          <LinearGradient colors={[colors.blueSoft2, '#dce8fc']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.adCard}>
            <SectionHeader title="Ad leads today" action="Campaigns" onPress={() => navigation.navigate('Campaigns')} />
            <View style={styles.adRow}>
              {Object.entries(adLeads.byChannel).map(([ch, n]) => (
                <View key={ch} style={styles.adItem}>
                  <View style={styles.adPill}>
                    <Icon name="bar-chart-2" size={11} color={colors.blue} />
                    <Text style={styles.adPillText}>{ch}</Text>
                  </View>
                  <Text style={styles.adCount}>{n} new</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        ) : null}

        {/* Lead sources */}
        {sources && sources.sources.length > 0 ? (
          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="Lead sources" action="This month" onPress={() => navigation.navigate('Leads')} />
            {sources.sources.map((s) => (
              <View key={s.label} style={styles.srcRow}>
                <Text style={styles.srcLabel} numberOfLines={1}>
                  {s.label}
                </Text>
                <View style={styles.srcTrack}>
                  <View style={[styles.srcBar, { width: `${Math.max(4, s.percent)}%`, backgroundColor: sourceColor(s.label) }]} />
                </View>
                <Text style={styles.srcValue}>
                  {s.count} · {Math.round(s.percent)}%
                </Text>
              </View>
            ))}
          </Card>
        ) : null}

        {/* Recent activities */}
        {activity && activity.events.length > 0 ? (
          <Card>
            <SectionHeader title="Recent activities" action="All" onPress={() => navigation.navigate('ActivityLog')} />
            {activity.events.slice(0, 6).map((e) => {
              const st = activityStyle(e.action);
              const title = e.name ? `${e.title} · ${e.name}` : e.title;
              return (
                <View key={e.id} style={styles.actRow}>
                  <View style={[styles.actIcon, { backgroundColor: st.bg }]}>
                    <Icon name={st.icon} size={15} color={colors.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actTitle} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text style={styles.actSub} numberOfLines={1}>
                      {[e.detail, relativeTime(e.at)].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        ) : null}

        {/* Insurance catalogue */}
        {catalogue && catalogue.types.length > 0 ? (
          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="Insurance catalogue" action="Products" onPress={() => navigation.navigate('Products')} />
            <View style={styles.catGrid}>
              {catalogue.types.map((t) => {
                const cs = catStyle(t.name);
                return (
                  <Pressable key={t.typeId} style={[styles.catTile, { backgroundColor: cs.bg }]} onPress={() => navigation.navigate('NewFromSkyUp', { typeId: t.typeId })}>
                    <View style={styles.catIcon}>
                      <Icon name={cs.icon} size={13} color={colors.text} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.catName} numberOfLines={1}>
                        {t.name}
                      </Text>
                      <Text style={styles.catCount}>{t.products} products</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Pressable onPress={() => navigation.navigate('BestFit')}>
              <LinearGradient colors={[colors.purpleSoft, colors.purpleSoft2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bestFit}>
                <Icon name="zap" size={16} color={colors.text} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bestFitTitle}>Run Best fit</Text>
                  <Text style={styles.bestFitSub}>Rank products for a customer</Text>
                </View>
                <Icon name="arrow-right" size={15} color={colors.text} />
              </LinearGradient>
            </Pressable>
          </Card>
        ) : null}
      </ScrollView>

      <TabBar active="home" />
    </SafeAreaView>
  );
}

// ── small presentational pieces ───────────────────────────────────────────────
function StatCard({ label, value, bg, navy }: { label: string; value: number; bg?: string; navy?: boolean }) {
  if (navy) {
    return (
      <LinearGradient colors={[colors.navyGradFrom, colors.navyGradTo]} style={styles.stat}>
        <Text style={[styles.statLabel, { color: '#c9d6ea' }]}>{label}</Text>
        <Text style={[styles.statValue, { color: '#fff' }]}>{value}</Text>
      </LinearGradient>
    );
  }
  return (
    <View style={[styles.stat, { backgroundColor: bg }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function AlertRow({ icon, tone, label, value, onPress }: { icon: IconName; tone: 'amber' | 'red'; label: string; value: number; onPress?: () => void }) {
  const c = tone === 'amber' ? { bg: colors.amberAlert, fg: colors.amber } : { bg: colors.redAlert, fg: colors.red };
  return (
    <Pressable style={[styles.alert, { backgroundColor: c.bg }]} onPress={onPress}>
      <Icon name={icon} size={16} color={c.fg} />
      <Text style={[styles.alertLabel, { color: c.fg }]}>{label}</Text>
      <Text style={[styles.alertValue, { color: c.fg }]}>{value}</Text>
      <Icon name="chevron-right" size={15} color={c.fg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingLeft: 20, paddingRight: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  greet: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  iconBtn: { width: 40, height: 40, borderRadius: radius.iconBtn, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },

  scroll: { flex: 1 },
  body: { paddingHorizontal: spacing.xl, paddingBottom: 120, gap: spacing.lg + 2 },

  addTask: {
    height: 46,
    borderRadius: radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  addTaskText: { fontSize: 14, fontFamily: family.semibold, color: colors.navy },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14, columnGap: 4, justifyContent: 'space-between' },
  quick: { width: 62, alignItems: 'center', gap: spacing.sm },
  quickBubble: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  quickBubblePrimary: { backgroundColor: colors.navy },
  quickBubbleSoft: { backgroundColor: colors.bg },
  quickLabel: { fontSize: 10, lineHeight: 13, fontFamily: family.semibold, color: colors.text, textAlign: 'center' },

  statRow: { gap: spacing.md, paddingRight: spacing.xl },
  stat: { width: 96, borderRadius: radius.stat, padding: spacing.lg, gap: 2 },
  statLabel: { fontSize: 11, fontFamily: family.bold, color: colors.muted3 },
  statValue: { fontSize: 20, fontFamily: family.bold, color: colors.text },

  alert: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.lg, borderRadius: radius.chip },
  alertLabel: { flex: 1, fontSize: 13, fontFamily: family.bold },
  alertValue: { fontSize: 18, fontFamily: family.bold },

  taskTabs: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  taskTab: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.chip },
  taskTabOn: { backgroundColor: colors.navy },
  taskTabLabel: { fontSize: 12, fontFamily: family.semibold },
  taskTabCount: { fontSize: 11, fontFamily: family.bold },

  renewal: { width: 170, backgroundColor: colors.renewalCard, borderRadius: radius.stat, padding: spacing.lg, gap: spacing.sm },
  avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: '#fff', backgroundColor: colors.avatarPink, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 11, fontFamily: family.bold, color: colors.navy },
  renewalName: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  renewalPlan: { fontSize: 11, fontFamily: family.medium, color: colors.renewalText },
  daysChip: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: colors.amberChip, paddingLeft: 8, paddingRight: 12, paddingVertical: 5, borderRadius: radius.chip },
  daysChipText: { fontSize: 12, fontFamily: family.semibold, color: colors.amber },

  adCard: { borderRadius: radius.card, padding: spacing.xl, gap: spacing.lg },
  adRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  adItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  adPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.blueSoft2, paddingLeft: 7, paddingRight: 9, paddingVertical: 3, borderRadius: 10 },
  adPillText: { fontSize: 11, fontFamily: family.bold, color: colors.blue },
  adCount: { fontSize: 13, fontFamily: family.bold, color: colors.text },

  srcRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  srcLabel: { width: 96, fontSize: 12, fontFamily: family.semibold, color: colors.text },
  srcTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.bg, overflow: 'hidden' },
  srcBar: { height: 8, borderRadius: 4 },
  srcValue: { width: 56, textAlign: 'right', fontSize: 11, fontFamily: family.bold, color: colors.text },

  actRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actTitle: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  actSub: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 1 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catTile: { width: '48.5%', flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: 10, borderRadius: radius.tile },
  catIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  catName: { fontSize: 12, fontFamily: family.bold, color: colors.text },
  catCount: { fontSize: 10, fontFamily: family.medium, color: colors.muted2 },

  bestFit: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.lg, borderRadius: radius.tile },
  bestFitTitle: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  bestFitSub: { fontSize: 11, fontFamily: family.medium, color: colors.purple, marginTop: 1 },
});
