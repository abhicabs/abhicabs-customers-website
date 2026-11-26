import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerSummary } from '../api/types';

type R = RouteProp<AppStackParamList, 'LinkPolicyHolder'>;
const FALLBACK_REL = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Father-in-law', 'Mother-in-law', 'Brother', 'Sister', 'Other'];
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

export function LinkPolicyHolderScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [all, setAll] = useState<CustomerSummary[]>([]);
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<CustomerSummary | null>(null);
  const [rel, setRel] = useState('');
  const [rels, setRels] = useState<string[]>(FALLBACK_REL);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  useEffect(() => {
    api.customers.list({ status: 'ACTIVE', limit: 200 }).then((r) => setAll(r.data.filter((c) => c.id !== params.customerId))).catch(() => undefined).finally(() => setLoading(false));
    api.reference.get().then((r) => { const rl = (r.data as any).relationships; if (Array.isArray(rl) && rl.length) setRels(rl); }).catch(() => undefined);
  }, [params.customerId]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return all.filter((c) => c.name.toLowerCase().includes(t) || (c.number ?? '').toLowerCase().includes(t)).slice(0, 8);
  }, [q, all]);

  const save = async () => {
    if (!picked) { setError('Choose a policy holder.'); return; }
    if (!rel) { setError('Choose the relationship.'); return; }
    setBusy(true); setError(null);
    try { await api.customers.link(params.customerId, { linkedCustomerId: picked.id, relationship: rel }, { idempotencyKey: idem.current }); close(); }
    catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not link.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}><Text style={styles.title}>Link a policy holder</Text><Text style={styles.sub}>Someone with their own record</Text></View>
          <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
        </View>

        {picked ? (
          <Pressable style={[styles.row, styles.pickedRow]} onPress={() => setPicked(null)}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials(picked.name)}</Text></View>
            <View style={{ flex: 1 }}><Text style={styles.rowName}>{picked.name}</Text><Text style={styles.rowSub}>{picked.number}</Text></View>
            <Icon name="x" size={16} color={colors.muted} />
          </Pressable>
        ) : (
          <>
            <View style={styles.search}><Icon name="search" size={18} color={colors.grayBar} /><TextInput value={q} onChangeText={setQ} placeholder="Search name or number" placeholderTextColor={colors.grayBar} style={styles.searchInput} selectionColor={colors.blue} autoFocus /></View>
            <ScrollView style={{ maxHeight: 220 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {loading ? <ActivityIndicator color={colors.blue} style={{ marginVertical: 16 }} /> : results.map((c) => (
                <Pressable key={c.id} style={styles.row} onPress={() => { setPicked(c); setQ(''); }}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{initials(c.name)}</Text></View>
                  <View style={{ flex: 1 }}><Text style={styles.rowName}>{c.name}</Text><Text style={styles.rowSub}>{c.number}</Text></View>
                  <Icon name="chevron-right" size={16} color={colors.grayBar} />
                </Pressable>
              ))}
              {q.trim() && !loading && !results.length ? <Text style={styles.empty}>No match.</Text> : null}
            </ScrollView>
          </>
        )}

        {picked ? (
          <View style={{ gap: 8, marginTop: 4 }}>
            <Text style={styles.label}>Relationship *</Text>
            <Dropdown value={rel} placeholder="Relationship" options={rels.map((r) => ({ label: r }))} onSelect={(o: any) => setRel(o.label)} />
          </View>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.cta, (busy || !picked) && { opacity: 0.6 }]} disabled={busy || !picked} onPress={save}>
          <Icon name="link" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Linking…' : 'Link'}</Text>
        </Pressable>
      </View>
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
  title: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, backgroundColor: colors.bg, borderRadius: 24, paddingHorizontal: 16 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: family.medium, color: colors.text, padding: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  pickedRow: { backgroundColor: '#f3f7ff', borderRadius: 16, paddingHorizontal: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e9e3fc', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontFamily: family.bold, color: colors.navy },
  rowName: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  rowSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  empty: { fontSize: 13, fontFamily: family.medium, color: colors.muted, paddingVertical: 12 },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
