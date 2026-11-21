// src/components/CallRemarkSheet.js — the after-call remark popup, shown as a bottom sheet OVER the current screen
// (My Leads / Calls by Day), so logging a remark after a call never opens the lead detail page.
// Reuses the proven Redux submitCallRemark thunk and the company's own outcomes + auto-status mapping.
// Special flows (Not Interested verification, Invalid) still route to the lead detail, those need their own screens.
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { useTheme } from '../theme/ThemeContext';
import { submitCallRemark } from '../store/slices/leadsSlice';
import { getLeadById } from '../api/leadsApi';
import { getCustomization, outcomeGroups } from '../services/customizationService';

const STATUS_PRIORITY = { New: 0, 'In Progress': 1, Interested: 2, Converted: 3, 'Not Interested': 4 };
const ANSWERED_SUB = ['Interested', 'Not Interested', 'Call Back Later', 'Client Meeting', 'Proposal Sent'];
function autoStatusForOutcome(outcome, current) {
  const cur = current || 'New';
  const pr = STATUS_PRIORITY[cur] ?? 0;
  let suggested = null;
  if (outcome === 'Not Interested') return 'Not Interested';
  if (outcome === 'Interested') suggested = 'Interested';
  else if (['Client Meeting', 'Proposal Sent'].includes(outcome)) suggested = 'Interested';
  else if (['Answered', 'Call Back Later'].includes(outcome)) suggested = 'In Progress';
  if (!suggested) return null;
  if ((STATUS_PRIORITY[suggested] ?? 0) <= pr) return null;
  return suggested;
}

export default function CallRemarkSheet({ visible, leadId, leadName, onClose, onDone, onNeedsLeadDetail }) {
  const { colors } = useTheme();
  const s = styles(colors);
  const dispatch = useDispatch();
  const [lead, setLead] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [remark, setRemark] = useState('');
  const [busy, setBusy] = useState(false);

  const cust = getCustomization();
  const groups = useMemo(() => {
    try { return outcomeGroups(cust); } catch { return { notAnswered: ['Not Answered', 'Busy', 'Switch Off'], answered: ['Interested', 'Not Interested', 'Call Back Later', 'Client Meeting', 'Proposal Sent'] }; }
  }, [cust]);

  useEffect(() => {
    if (!visible) { setOutcome(''); setRemark(''); setLead(null); return; }
    if (leadId) getLeadById(leadId).then(setLead).catch(() => {});
  }, [visible, leadId]);

  const willBe = outcome ? autoStatusForOutcome(outcome, lead?.status) : null;

  const save = async () => {
    if (!outcome) { Alert.alert('Select an outcome', 'Please choose how the call went.'); return; }
    if (!remark.trim()) { Alert.alert('Add a remark', 'Please enter a short remark.'); return; }
    // Not Interested / Invalid have their own verification flows in the lead detail — route there.
    if (outcome === 'Not Interested' || outcome === 'Invalid') {
      onNeedsLeadDetail && onNeedsLeadDetail(leadId, outcome);
      return;
    }
    setBusy(true);
    try {
      await dispatch(submitCallRemark({
        leadId, remark: remark.trim(), outcome,
        status: willBe || undefined,
      })).unwrap();
      onDone && onDone();
      onClose && onClose();
    } catch (e) {
      Alert.alert('Could not save', String(e || 'Please try again.'));
    } finally { setBusy(false); }
  };

  const Chip = ({ label, active, danger }) => (
    <TouchableOpacity
      style={[s.chip, active && (danger ? s.chipDangerActive : s.chipActive)]}
      onPress={() => setOutcome(label)}
    >
      <Text style={[s.chipText, active && { color: '#fff', fontWeight: '700' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.sheet} activeOpacity={1} onPress={() => {}}>
          <View style={s.handle} />
          <View style={s.header}>
            <Text style={s.title}>Call remark</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Icon name="close" size={20} color={colors.textMuted} /></TouchableOpacity>
          </View>
          <Text style={s.sub}>{leadName || lead?.name || 'Lead'}</Text>

          <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
            <Text style={s.section}>They didn't answer</Text>
            <View style={s.row}>{(groups.notAnswered || []).map((o) => <Chip key={o} label={o} active={outcome === o} danger />)}</View>

            <Text style={s.section}>Answered</Text>
            <View style={s.row}>{(groups.answered || []).map((o) => <Chip key={o} label={o} active={outcome === o} />)}</View>

            {willBe ? (
              <View style={s.statusNote}><Icon name="autorenew" size={13} color={colors.greenLight || '#10B981'} /><Text style={s.statusNoteText}>Status will update to "{willBe}".</Text></View>
            ) : null}

            <Text style={s.section}>Remark</Text>
            <TextInput style={s.input} value={remark} onChangeText={setRemark} placeholder="What did you discuss?" placeholderTextColor={colors.textMuted} multiline />
          </ScrollView>

          <TouchableOpacity style={[s.saveBtn, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.saveText}>Save remark</Text>}
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = (c) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: c.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, paddingBottom: 26 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '600', color: c.textPrimary },
  sub: { fontSize: 12, color: c.textMuted, marginTop: 2, marginBottom: 10 },
  section: { fontSize: 11, color: c.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 10, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: c.border, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14 },
  chipActive: { backgroundColor: c.primary, borderColor: c.primary },
  chipDangerActive: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  chipText: { fontSize: 13, color: c.textPrimary },
  statusNote: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: (c.greenBg || 'rgba(16,185,129,0.1)'), borderRadius: 8, padding: 8, marginTop: 12 },
  statusNoteText: { fontSize: 12, color: (c.greenLight || '#10B981') },
  input: { borderWidth: 1, borderColor: c.border, borderRadius: 10, padding: 10, fontSize: 13, color: c.textPrimary, minHeight: 56, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: c.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
  saveText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
