import React, { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { EmptyState, ErrorState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'CheckValues'>;
const valOf = (v: any) => (v && typeof v === 'object' ? (v.value ?? '') : v ?? '');
const confOf = (v: any) => (v && typeof v === 'object' ? v.confidence : null);

export function CheckValuesScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const idem = useRef(newIdempotencyKey());

  const load = useCallback(async () => {
    setError(null);
    try { const { data } = await api.documents.get(params.docId); setDoc(data); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load the document.'); }
    finally { setLoading(false); }
  }, [params.docId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Centered><EmptyState icon="loader" title="Loading…" /></Centered>;
  if (error || !doc) return <Centered><ErrorState message={error ?? 'Not found'} onRetry={load} /></Centered>;

  const entries = Object.entries((doc.values ?? doc.readValues ?? {}) as Record<string, any>);
  const reading = doc.reading || doc.readStatus === 'PENDING';

  const confirm = async () => {
    setBusy(true); setError(null);
    const plain: Record<string, unknown> = {};
    for (const [k, v] of entries) plain[k] = valOf(v);
    try {
      await api.documents.confirm(params.docId, { rev: doc.rev, values: plain }, { idempotencyKey: idem.current });
      navigation.goBack();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not confirm.'); setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle} numberOfLines={1}>Check {doc.type ?? 'document'} values</Text>
          <Text style={styles.navSub} numberOfLines={1}>{[doc.personName, doc.version ? `v${doc.version}` : null, doc.uploadedBy ? `by ${doc.uploadedBy}` : null].filter(Boolean).join(' · ')}</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.upload}>
          <View style={styles.uploadIcon}><Icon name="check" size={20} color={colors.green} /></View>
          <Text style={styles.uploadText}>{doc.fileName ?? doc.originalName ?? 'Document'}</Text>
        </View>

        {entries.length ? (
          <View style={styles.answers}>
            {entries.map(([k, v]) => (
              <View key={k} style={styles.kvRow}>
                <Text style={styles.kvLabel}>{k}</Text>
                <Text style={styles.kvValue} numberOfLines={2}>{String(valOf(v))}{confOf(v) ? ` · ${confOf(v)}` : ''}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.answers}><Text style={styles.muted}>{reading ? 'Reading the document… check back shortly.' : 'No values read. Confirm to accept as-is.'}</Text></View>
        )}

        <View style={styles.note}>
          <Icon name="alert-circle" size={16} color={colors.blue} />
          <Text style={styles.noteText}>Confirmed values replace the ones on record. Earlier versions stay in history.</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.cta, shadow.button, (busy || reading) && { opacity: 0.6 }]} disabled={busy || reading} onPress={confirm}>
          <Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Confirming…' : 'Confirm values'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]}><StatusBar style="dark" />{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110, gap: 12 },
  upload: { alignItems: 'center', gap: 8, backgroundColor: '#f5fbf8', borderWidth: 1, borderColor: '#c7ebda', borderRadius: 18, padding: 18 },
  uploadIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  uploadText: { fontSize: 13, fontFamily: family.bold, color: colors.green, textAlign: 'center' },
  answers: { backgroundColor: '#f7f9ff', borderRadius: 22, padding: 16, gap: 10 },
  kvRow: { flexDirection: 'row', gap: 10 },
  kvLabel: { width: 150, fontSize: 12, lineHeight: 17, fontFamily: family.medium, color: colors.muted },
  kvValue: { flex: 1, fontSize: 12, lineHeight: 17, fontFamily: family.bold, color: colors.text },
  muted: { fontSize: 13, fontFamily: family.medium, color: colors.muted },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  noteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, backgroundColor: colors.surface, shadowColor: '#13294b', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
