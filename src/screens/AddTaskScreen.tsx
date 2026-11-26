import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown, Segmented } from '../components/form';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { Priority } from '../api/types';

type R = RouteProp<AppStackParamList, 'AddTask'>;
const TYPES = [
  { key: 'CALL', label: 'Call' }, { key: 'MEETING', label: 'Meeting' }, { key: 'FOLLOW_UP', label: 'Follow-up' },
  { key: 'COLLECT_DOCUMENTS', label: 'Documents' }, { key: 'RENEWAL', label: 'Renewal' }, { key: 'OTHER', label: 'Other' },
];
const pad = (n: number) => String(n).padStart(2, '0');
function datePresets() {
  const now = new Date();
  const d = (add: number) => { const x = new Date(now); x.setDate(now.getDate() + add); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; };
  return [
    { label: 'Today', value: d(0) },
    { label: 'Tomorrow', value: d(1) },
    { label: 'In 2 days', value: d(2) },
    { label: 'In 3 days', value: d(3) },
    { label: 'In a week', value: d(7) },
  ];
}
const TIMES = [
  { label: '9:00 AM', value: '09:00' }, { label: '11:00 AM', value: '11:00' }, { label: '12:00 PM', value: '12:00' },
  { label: '2:00 PM', value: '14:00' }, { label: '4:00 PM', value: '16:00' }, { label: '5:00 PM', value: '17:00' }, { label: '6:30 PM', value: '18:30' },
];

export function AddTaskScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const dates = datePresets();
  const editTask = params?.task;
  const editing = !!editTask;

  const [title, setTitle] = useState(editTask?.title ?? '');
  const [taskType, setTaskType] = useState<string | null>(editTask?.taskType ?? null);
  const [dateLabel, setDateLabel] = useState(dates[0].label);
  const [dateValue, setDateValue] = useState(dates[0].value);
  const [timeLabel, setTimeLabel] = useState('5:00 PM');
  const [timeValue, setTimeValue] = useState('17:00');
  const [priority, setPriority] = useState<Priority>((editTask?.priority as Priority) ?? 'MEDIUM');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());

  React.useEffect(() => {
    if (editTask?.dueTime) { const t = TIMES.find((x) => x.value === editTask.dueTime); if (t) { setTimeLabel(t.label); setTimeValue(t.value); } }
    if (editTask?.dueDate) { setDateValue(editTask.dueDate); const d = new Date(editTask.dueDate); setDateLabel(`${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => navigation.goBack();

  const save = async () => {
    if (!title.trim()) { setError('Enter a task title.'); return; }
    setError(null); setSaving(true);
    try {
      if (editing) {
        await api.tasks.edit(editTask.id, { version: editTask.version, title: title.trim(), dueDate: dateValue, dueTime: timeValue, taskType: taskType ?? undefined, priority });
      } else {
        await api.tasks.create({
          title: title.trim(), dueDate: dateValue, dueTime: timeValue, taskType: taskType ?? undefined, priority,
          linkedType: params?.linkedType, linkedId: params?.linkedId,
        }, { idempotencyKey: idem.current });
      }
      close();
    } catch (e) {
      idem.current = newIdempotencyKey();
      if (e instanceof ApiError) setError(e.fieldErrors.title || e.message);
      else setError('Could not save the task.');
    } finally { setSaving(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handleRow}><View style={styles.handle} /></View>
          <View style={styles.header}>
            <Text style={styles.title}>{editing ? 'Edit task' : 'Add task'}</Text>
            <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
          </View>

          <ScrollView style={{ maxHeight: 460 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            <View style={styles.field}>
              <Text style={styles.label}>Task title *</Text>
              <TextInput
                value={title}
                onChangeText={(t) => { setTitle(t); if (error) setError(null); }}
                placeholder="What needs doing?"
                placeholderTextColor={colors.muted}
                style={[styles.input, error ? styles.inputErr : null]}
                selectionColor={colors.blue}
                autoFocus
              />
            </View>

            <View style={styles.chips}>
              {TYPES.map((t) => {
                const on = t.key === taskType;
                return (
                  <Pressable key={t.key} onPress={() => setTaskType(on ? null : t.key)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                    <Text style={[styles.chipText, { color: on ? colors.onPrimary : colors.muted3 }]}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {params?.linkedName ? (
              <View style={styles.field}>
                <Text style={styles.label}>Related</Text>
                <View style={styles.related}>
                  <Icon name={params.linkedType === 'CUSTOMER' ? 'users' : 'columns'} size={16} color={colors.blue} />
                  <Text style={styles.relatedText} numberOfLines={1}>{params.linkedName}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.row2}>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={styles.label}>Date</Text>
                <Dropdown
                  value={dateLabel}
                  placeholder="Date"
                  options={dates}
                  onSelect={(o: any) => { setDateLabel(o.label); setDateValue(o.value); }}
                />
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={styles.label}>Time</Text>
                <Dropdown
                  value={timeLabel}
                  placeholder="Time"
                  options={TIMES}
                  onSelect={(o: any) => { setTimeLabel(o.label); setTimeValue(o.value); }}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Priority</Text>
              <Segmented
                value={priority}
                onChange={setPriority}
                options={[{ value: 'HIGH', label: 'High' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'LOW', label: 'Low' }]}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <Pressable style={[styles.save, shadow.button, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
            <Icon name="check" size={18} color={colors.onPrimary} />
            <Text style={styles.saveText}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Save task'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,31,59,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 18, gap: 12 },
  handleRow: { alignItems: 'center' },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#d5dbe5' },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, fontSize: 18, fontFamily: family.bold, color: colors.text },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  field: { gap: 8 },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { height: 50, backgroundColor: colors.bg, borderRadius: 16, borderWidth: 2, borderColor: 'transparent', paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  inputErr: { borderColor: colors.red },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 14 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.bg },
  chipText: { fontSize: 12, fontFamily: family.semibold },
  related: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16 },
  relatedText: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  row2: { flexDirection: 'row', gap: 10 },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  save: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  saveText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
