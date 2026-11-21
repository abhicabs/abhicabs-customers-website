// src/components/RemarkHistorySheet.js — view-only remark history as a bottom sheet over ANY screen.
// Opened by the blue remark button on the Leads list and Calls by Day, so checking past remarks never navigates into
// the lead detail page. Read-only: it fetches the lead's call history and shows the real typed remarks, newest first.
import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getLeadById } from '../api/leadsApi';
import { useTheme } from '../theme/ThemeContext';

// Keep only genuine, human-typed remarks (skip empty + generic auto-logged dialer entries).
function extractRemarks(lead) {
  if (!lead) return [];
  const out = [];
  const hist = Array.isArray(lead.callHistory) ? lead.callHistory : [];
  for (const h of hist) {
    const text = (h.remark || '').trim();
    if (!text) continue;
    if (/^(call (not )?received|outgoing call|incoming call|missed call|auto[- ]?logged)$/i.test(text)) continue;
    out.push({ text, outcome: h.outcome || '', at: h.calledAt || h.createdAt || null, by: h.agentName || h.userName || '' });
  }
  // initial campaign remark (if any) shown last
  if ((lead.remark || '').trim() && !out.some((r) => r.text === lead.remark.trim())) {
    out.push({ text: lead.remark.trim(), outcome: 'Initial remark', at: lead.createdAt || null, by: 'campaign', initial: true });
  }
  return out.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
}
const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');

export default function RemarkHistorySheet({ visible, lead, leadId, onClose }) {
  const { colors } = useTheme();
  const s = styles(colors);
  const [data, setData] = useState(lead || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let on = true;
    if (!visible) return;
    // If the caller passed a lead with callHistory, use it; else fetch by id.
    if (lead && Array.isArray(lead.callHistory)) { setData(lead); return; }
    const id = leadId || lead?.id || lead?._id;
    if (!id) return;
    setLoading(true);
    getLeadById(id).then((l) => { if (on) setData(l); }).catch(() => {}).finally(() => { if (on) setLoading(false); });
    return () => { on = false; };
  }, [visible, lead, leadId]);

  const remarks = extractRemarks(data);
  const name = data?.name || lead?.name || 'Lead';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.sheet} activeOpacity={1} onPress={() => {}}>
          <View style={s.handle} />
          <View style={s.header}>
            <Text style={s.title}>Remark history</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Icon name="close" size={20} color={colors.textMuted} /></TouchableOpacity>
          </View>
          <Text style={s.sub}>{name}{remarks.length ? ` · ${remarks.length} remark${remarks.length > 1 ? 's' : ''}` : ''}</Text>

          {loading ? (
            <View style={s.center}><ActivityIndicator color={colors.primary} /></View>
          ) : remarks.length === 0 ? (
            <View style={s.center}><Text style={s.empty}>No remarks yet for this lead.</Text></View>
          ) : (
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {remarks.map((r, i) => (
                <View key={i} style={[s.card, r.initial && s.cardInitial]}>
                  <View style={s.cardTop}>
                    <Text style={[s.outcome, r.initial && { color: colors.primary }]}>{r.outcome || 'Remark'}</Text>
                    {r.at ? <Text style={s.when}>{fmt(r.at)}</Text> : null}
                  </View>
                  <Text style={s.text}>{r.text}</Text>
                  {r.by ? <Text style={s.by}>by {r.by}</Text> : null}
                </View>
              ))}
            </ScrollView>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = (c) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: c.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, paddingBottom: 28 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '600', color: c.textPrimary },
  sub: { fontSize: 12, color: c.textMuted, marginTop: 2, marginBottom: 14 },
  center: { paddingVertical: 36, alignItems: 'center' },
  empty: { fontSize: 13, color: c.textMuted },
  card: { backgroundColor: c.background, borderRadius: 10, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: c.border },
  cardInitial: { borderLeftColor: c.primary },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  outcome: { fontSize: 12, fontWeight: '600', color: c.textSecondary },
  when: { fontSize: 11, color: c.textMuted },
  text: { fontSize: 13, color: c.textPrimary },
  by: { fontSize: 11, color: c.textMuted, marginTop: 3 },
});
