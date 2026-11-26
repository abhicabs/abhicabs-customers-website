import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { Field, Input, Dropdown, Segmented } from '../components/form';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { normalizeMobile } from '../lib/phone';
import { followUpPresets } from '../lib/followup';
import { colors, spacing, radius, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { Pipeline, LeadSourceOption, Priority } from '../api/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export function LeadAddScreen() {
  const navigation = useNavigation<Nav>();
  const presets = followUpPresets();

  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [sources, setSources] = useState<LeadSourceOption[]>([]);

  const [name, setName] = useState('');
  const [digits, setDigits] = useState('');
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [pipelineName, setPipelineName] = useState<string>('');
  const [sourceCode, setSourceCode] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState('');
  const [campaign, setCampaign] = useState('');
  const [followUp, setFollowUp] = useState('none');
  const [priority, setPriority] = useState<Priority>('MEDIUM');

  const [dup, setDup] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const idem = React.useRef(newIdempotencyKey());

  useEffect(() => {
    (async () => {
      try {
        const [p, r] = await Promise.all([api.pipelines.list(), api.reference.get()]);
        setPipelines(p.data);
        setSources(r.data.leadSourceOptions);
        if (p.data[0]) {
          setPipelineId(p.data[0].id);
          setPipelineName(p.data[0].name);
        }
      } catch {
        /* dropdowns stay empty; fields still validate server-side */
      }
    })();
  }, []);

  const checkDuplicate = async () => {
    const mobile = normalizeMobile(digits);
    if (!mobile) return;
    try {
      const { data } = await api.leads.duplicateCheck({ mobile, name: name || undefined });
      setDup(data.exact ? `${data.exact.name} already uses this mobile.` : null);
    } catch {
      setDup(null);
    }
  };

  const save = async (confirm?: string[]) => {
    const mobile = normalizeMobile(digits);
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Enter the lead name.';
    if (!mobile) errs.mobile = 'Enter a valid 10-digit mobile.';
    if (!pipelineId) errs.pipeline = 'Choose a pipeline.';
    if (!sourceCode) errs.source = 'Choose a lead source.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const iso = presets.find((p) => p.key === followUp)?.iso ?? undefined;
      const lead = await api.leads.create(
        {
          pipelineId: pipelineId!,
          name: name.trim(),
          mobile: mobile!,
          source: sourceCode!,
          campaign: campaign.trim() || undefined,
          nextFollowUpAt: iso,
          priority,
          confirm,
        },
        { idempotencyKey: idem.current },
      );
      navigation.replace('LeadDetail', { id: lead.data.id, name: lead.data.name });
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.code === 'CONFIRMATION_REQUIRED') {
          Alert.alert('Possible duplicate', e.message, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Save anyway', onPress: () => save([e.messageId]) },
          ]);
        } else if (Object.keys(e.fieldErrors).length) {
          setErrors(e.fieldErrors);
        } else {
          Alert.alert('Could not save', e.message);
        }
      } else {
        Alert.alert('Could not save', 'Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.navbar}>
        <Pressable hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>New lead</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label="Lead name" required error={errors.name}>
            <Input value={name} onChangeText={setName} placeholder="Full name" error={!!errors.name} autoFocus />
          </Field>

          <Field label="Primary mobile" required error={errors.mobile}>
            <Input
              value={digits}
              onChangeText={(t) => setDigits(t.replace(/[^\d]/g, '').slice(0, 10))}
              onBlur={checkDuplicate}
              placeholder="98450 12345"
              prefix="+91"
              keyboardType="phone-pad"
              maxLength={10}
              error={!!errors.mobile}
            />
            {dup ? (
              <View style={styles.dup}>
                <Icon name="alert-triangle" size={14} color={colors.amber} />
                <Text style={styles.dupText}>{dup}</Text>
              </View>
            ) : null}
          </Field>

          <Field label="Pipeline" required error={errors.pipeline}>
            <Dropdown
              value={pipelineName}
              placeholder="Choose pipeline"
              error={!!errors.pipeline}
              options={pipelines.map((p) => ({ label: p.name, id: p.id }))}
              onSelect={(o: any) => {
                setPipelineId(o.id);
                setPipelineName(o.label);
              }}
            />
          </Field>

          <Field label="Lead source" required error={errors.source}>
            <Dropdown
              value={sourceLabel}
              placeholder="Choose source"
              error={!!errors.source}
              options={sources.map((s) => ({ label: s.label, code: s.code }))}
              onSelect={(o: any) => {
                setSourceCode(o.code);
                setSourceLabel(o.label);
              }}
            />
          </Field>

          <Field label="Campaign or ad (optional)">
            <Input value={campaign} onChangeText={setCampaign} placeholder="e.g. Diwali family floater" />
          </Field>

          <Field label="Next follow-up">
            <View style={styles.presets}>
              {presets.map((p) => {
                const on = p.key === followUp;
                return (
                  <Pressable key={p.key} onPress={() => setFollowUp(p.key)} style={[styles.preset, on && styles.presetOn]}>
                    <Text style={[styles.presetText, { color: on ? colors.onPrimary : colors.muted2 }]}>{p.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label="Priority">
            <Segmented
              value={priority}
              onChange={setPriority}
              options={[
                { value: 'HIGH', label: 'High' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LOW', label: 'Low' },
              ]}
            />
          </Field>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Save lead" icon="check" onPress={() => save()} loading={saving} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  body: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },
  dup: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.amberAlert, padding: spacing.md, borderRadius: radius.chip },
  dupText: { flex: 1, fontSize: 12, fontFamily: family.semibold, color: colors.amber },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  preset: { backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.chip },
  presetOn: { backgroundColor: colors.navy },
  presetText: { fontSize: 12, fontFamily: family.semibold },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
