import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'CampaignSetup'>;

export function CampaignSetupScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [sources, setSources] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [pipelines, setPipelines] = useState<{ id: string; name: string }[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingSources, setSavingSources] = useState(false);

  const isWebsite = params.channel === 'WEBSITE';

  const load = useCallback(async () => {
    setError(null);
    try {
      const [src, frm, pp] = await Promise.allSettled([
        isWebsite ? Promise.resolve({ data: [] }) : api.campaigns.sources(params.id),
        api.campaigns.forms({ connectionId: params.id }),
        api.pipelines.list(),
      ]);
      const srcData = src.status === 'fulfilled' ? (Array.isArray(src.value.data) ? src.value.data : src.value.data.items ?? []) : [];
      setSources(srcData);
      setPicked(new Set(srcData.filter((s: any) => s.subscribed).map((s: any) => s.id)));
      setForms(frm.status === 'fulfilled' ? (Array.isArray(frm.value.data) ? frm.value.data : frm.value.data.items ?? []) : []);
      setPipelines(pp.status === 'fulfilled' ? pp.value.data : []);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load setup.'); }
    finally { setLoading(false); }
  }, [params.id, isWebsite]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleSource = (sid: string) => setPicked((p) => { const n = new Set(p); n.has(sid) ? n.delete(sid) : n.add(sid); return n; });
  const saveSources = async () => { setSavingSources(true); try { await api.campaigns.saveSources(params.id, { ids: [...picked] }); await load(); } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not save.'); } finally { setSavingSources(false); } };
  const setPipeline = async (form: any, pipelineId: string) => { setForms((fs) => fs.map((f) => (f.id === form.id ? { ...f, pipelineId } : f))); try { await api.campaigns.saveForm(form.id, { pipelineId }); } catch { await load(); } };
  const setActive = async (form: any, active: boolean) => { setForms((fs) => fs.map((f) => (f.id === form.id ? { ...f, active } : f))); try { await api.campaigns.saveForm(form.id, { active }); } catch { await load(); } };

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error && !forms.length && !sources.length) return <Centered><ErrorState message={error} onRetry={load} /></Centered>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}><Text style={styles.navTitle}>Set up channel</Text>{params.name ? <Text style={styles.navSub} numberOfLines={1}>{params.name}</Text> : null}</View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {!isWebsite ? (
          <>
            <Text style={styles.sectionLabel}>PAGES & AD ACCOUNTS</Text>
            {sources.length ? sources.map((s) => { const on = picked.has(s.id); return (
              <Pressable key={s.id} style={styles.row} onPress={() => toggleSource(s.id)}>
                <View style={[styles.check, on && styles.checkOn]}>{on ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
                <View style={{ flex: 1 }}><Text style={styles.rowTitle} numberOfLines={1}>{s.name}</Text>{s.type ? <Text style={styles.rowSub}>{s.type}</Text> : null}</View>
              </Pressable>
            ); }) : <Text style={styles.muted}>Nothing found on this account. Check the permissions you gave when signing in.</Text>}
            {sources.length ? <Pressable style={[styles.saveBtn, shadow.button, savingSources && { opacity: 0.6 }]} disabled={savingSources} onPress={saveSources}><Icon name="check" size={16} color={colors.onPrimary} /><Text style={styles.saveText}>{savingSources ? 'Saving…' : 'Save sources'}</Text></Pressable> : null}
          </>
        ) : null}

        <Text style={[styles.sectionLabel, { marginTop: 6 }]}>FORMS & PIPELINE</Text>
        {forms.length ? forms.map((frm) => (
          <View key={frm.id} style={styles.formCard}>
            <View style={styles.formHead}>
              <Text style={styles.formTitle} numberOfLines={1}>{frm.name ?? frm.campaignName ?? 'Form'}</Text>
              <Switch value={!!frm.active} onValueChange={(v) => setActive(frm, v)} trackColor={{ true: colors.navy }} />
            </View>
            {frm.campaignName ? <Text style={styles.formSub} numberOfLines={1}>{frm.campaignName}</Text> : null}
            <Dropdown value={pipelines.find((p) => p.id === frm.pipelineId)?.name ?? ''} placeholder="Pipeline for new leads" options={pipelines.map((p) => ({ label: p.name, id: p.id }))} onSelect={(o: any) => setPipeline(frm, o.id)} />
          </View>
        )) : <EmptyState icon="file-text" title="No forms yet" subtitle="Forms appear once the channel is connected." />}
        <View style={styles.note}><Icon name="alert-circle" size={16} color={colors.blue} /><Text style={styles.noteText}>Detailed question-to-field mapping is available on the web.</Text></View>
      </ScrollView>
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
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  rowTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  rowSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  muted: { fontSize: 13, fontFamily: family.medium, color: colors.muted },
  saveBtn: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
  formCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 14, gap: 10 },
  formHead: { flexDirection: 'row', alignItems: 'center' },
  formTitle: { flex: 1, fontSize: 14, fontFamily: family.bold, color: colors.text },
  formSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
});
