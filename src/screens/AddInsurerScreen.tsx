import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { DateField } from '../components/DateField';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';

const dmy = (s: string) => { const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m ? `${m[1]}-${m[2]}-${m[3]}` : undefined; };

export function AddInsurerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [avail, setAvail] = useState<{ id: string; name: string }[]>([]);
  const [insurerId, setInsurerId] = useState<string | null>(null);
  const [insurerLabel, setInsurerLabel] = useState('');
  const [agentCode, setAgentCode] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [declared, setDeclared] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());
  const close = () => navigation.goBack();

  useEffect(() => { api.myInsurers.available().then((r) => setAvail(Array.isArray(r.data) ? r.data : r.data.items ?? [])).catch(() => undefined); }, []);

  const save = async () => {
    if (!insurerId) { setError('Choose an insurer.'); return; }
    if (!agentCode.trim()) { setError('Enter your agent code.'); return; }
    if (!declared) { setError('Confirm the declaration.'); return; }
    setBusy(true); setError(null);
    try {
      await api.myInsurers.add({ insurerId, agentCode: agentCode.trim(), validUntil: validUntil ? dmy(validUntil) : null, declaration: true }, { idempotencyKey: idem.current });
      close();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not add the insurer.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handleRow}><View style={styles.handle} /></View>
          <View style={styles.header}><Text style={styles.title}>Add insurer</Text><Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable></View>
          <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            <View style={{ gap: 8 }}><Text style={styles.label}>Insurer *</Text><Dropdown value={insurerLabel} placeholder="Choose insurer" options={avail.map((a) => ({ label: a.name, id: a.id }))} onSelect={(o: any) => { setInsurerLabel(o.label); setInsurerId(o.id); }} /></View>
            <View style={{ gap: 8 }}><Text style={styles.label}>Agent code *</Text><TextInput value={agentCode} onChangeText={setAgentCode} autoCapitalize="characters" placeholder="Your code with this insurer" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} /></View>
            <View style={{ gap: 8 }}><Text style={styles.label}>Valid until</Text><DateField value={validUntil} onChange={setValidUntil} /></View>
            <Pressable style={styles.declRow} onPress={() => setDeclared((d) => !d)}>
              <View style={[styles.check, declared && styles.checkOn]}>{declared ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
              <Text style={styles.declText}>This appointment is mine and valid</Text>
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={save}><Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Adding…' : 'Add insurer'}</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,31,59,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 18, gap: 12 },
  handleRow: { alignItems: 'center' }, handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#d5dbe5' },
  header: { flexDirection: 'row', alignItems: 'center' }, title: { flex: 1, fontSize: 18, fontFamily: family.bold, color: colors.text },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text, justifyContent: 'center' },
  declRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f3f7ff', borderRadius: 14, padding: 12 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  declText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
