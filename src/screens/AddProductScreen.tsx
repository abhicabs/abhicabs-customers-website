import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';

const STEP_LABELS = ['Category', 'Company', 'Brochure', 'Product', 'Variants', 'Review', 'Published'];

export function AddProductScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(1);
  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
  const [insurers, setInsurers] = useState<{ id: string; name: string }[]>([]);
  const [typeId, setTypeId] = useState<string | null>(null);
  const [insurerId, setInsurerId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [variants, setVariants] = useState<string[]>([]);
  const [variantDraft, setVariantDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());

  useEffect(() => { api.quotations.choices().then((r) => setTypes(r.data.types)).catch(() => undefined); }, []);
  useEffect(() => { if (typeId) api.quotations.choices({ typeId }).then((r) => setInsurers(r.data.insurers)).catch(() => undefined); }, [typeId]);

  const soon = (title: string) => navigation.navigate('ComingSoon', { title });

  const create = async () => {
    if (!typeId || !insurerId || !name.trim()) { setError('Complete the product details.'); return; }
    setError(null); setSaving(true);
    try {
      const { data } = await api.products.ownCreate(
        { insurerId, typeId, code: name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 20), data: { name: name.trim() }, variants: variants.map((v) => ({ name: v })) },
        { idempotencyKey: idem.current },
      );
      setCreatedId(data.id ?? null);
      setStep(7);
    } catch (e) {
      idem.current = newIdempotencyKey();
      setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not create the product.');
    } finally { setSaving(false); }
  };

  const next = () => {
    if (step === 1) { if (!typeId) return setError('Choose a category.'); setError(null); setStep(2); }
    else if (step === 2) { if (!insurerId) return setError('Choose a company.'); setError(null); setStep(3); }
    else if (step === 3) { setStep(4); }
    else if (step === 4) { if (!name.trim()) return setError('Enter the product name.'); setError(null); setStep(5); }
    else if (step === 5) { setStep(6); }
    else if (step === 6) { create(); }
  };

  const typeName = types.find((t) => t.id === typeId)?.name ?? '';
  const insurerName = insurers.find((i) => i.id === insurerId)?.name ?? '';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => (step > 1 && step < 7 ? setStep(step - 1) : navigation.goBack())}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>Add my product</Text>
      </View>

      {step < 7 ? (
        <View style={styles.steps}>
          <View style={styles.bar}>{STEP_LABELS.slice(0, 7).map((_, i) => <View key={i} style={[styles.seg, i < step ? styles.segOn : styles.segOff]} />)}</View>
          <Text style={styles.stepText}>Step {step} of 7 · {STEP_LABELS[step - 1]}</Text>
        </View>
      ) : null}

      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <>
              <Text style={styles.h1}>Which category?</Text>
              {types.map((t) => {
                const on = t.id === typeId;
                return (
                  <Pressable key={t.id} style={[styles.opt, on ? styles.optOn : styles.optOff]} onPress={() => setTypeId(t.id)}>
                    <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                    <Text style={styles.optTitle}>{t.name}</Text>
                  </Pressable>
                );
              })}
              <LinearGradient colors={['#e8f0fd', '#dce8fc']} style={styles.hero}>
                <Text style={styles.heroTitle}>Category not listed?</Text>
                <Text style={styles.heroSub}>Create your own. No standard feature template.</Text>
              </LinearGradient>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.h1}>Which company?</Text>
              {insurers.map((ins) => {
                const on = ins.id === insurerId;
                return (
                  <Pressable key={ins.id} style={[styles.opt, on ? styles.optOn : styles.optOff]} onPress={() => setInsurerId(ins.id)}>
                    <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                    <Text style={styles.optTitle}>{ins.name}</Text>
                  </Pressable>
                );
              })}
              {!insurers.length ? <Text style={styles.muted}>No companies for this category yet.</Text> : null}
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.h1}>Fill the details</Text>
              <Pressable style={[styles.bigBtn, shadow.button]} onPress={() => (typeId ? navigation.navigate('BrochureReading', { typeId, insurerId: insurerId ?? undefined, typeName, insurerName }) : setError('Choose a category and company first.'))}>
                <Icon name="upload" size={18} color={colors.onPrimary} />
                <Text style={styles.bigBtnText}>Upload brochure (Premium)</Text>
              </Pressable>
              <Pressable style={styles.bigGhost} onPress={() => setStep(4)}>
                <Icon name="edit-3" size={18} color={colors.text} />
                <Text style={styles.bigGhostText}>Fill in manually</Text>
              </Pressable>
              <Text style={styles.muted}>Brochure reading auto-fills product details from a PDF (Premium). Manual entry is always available.</Text>
            </>
          )}

          {step === 4 && (
            <>
              <Text style={styles.h1}>Product</Text>
              <Field label="Product name *">
                <TextInput value={name} onChangeText={(t) => { setName(t); if (error) setError(null); }} placeholder="e.g. Arogya Plus" placeholderTextColor={colors.muted} style={styles.input} selectionColor={colors.blue} autoFocus />
              </Field>
              <Text style={styles.muted}>{typeName}{insurerName ? ` · ${insurerName}` : ''}</Text>
            </>
          )}

          {step === 5 && (
            <>
              <Text style={styles.h1}>Variants</Text>
              <Field label="Add a variant">
                <View style={styles.input}>
                  <TextInput value={variantDraft} onChangeText={setVariantDraft} placeholder="e.g. Gold" placeholderTextColor={colors.muted} style={{ flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text }} selectionColor={colors.blue}
                    onSubmitEditing={() => { if (variantDraft.trim()) { setVariants((v) => [...v, variantDraft.trim()]); setVariantDraft(''); } }} />
                  <Pressable hitSlop={8} onPress={() => { if (variantDraft.trim()) { setVariants((v) => [...v, variantDraft.trim()]); setVariantDraft(''); } }}>
                    <Icon name="plus" size={18} color={colors.blue} />
                  </Pressable>
                </View>
              </Field>
              <View style={styles.vChips}>
                {variants.map((v, i) => (
                  <Pressable key={`${v}-${i}`} style={styles.vChip} onPress={() => setVariants((xs) => xs.filter((_, j) => j !== i))}>
                    <Text style={styles.vChipText}>{v}</Text>
                    <Icon name="x" size={12} color={colors.muted2} />
                  </Pressable>
                ))}
                {!variants.length ? <Text style={styles.muted}>Optional — add Gold, Platinum, etc.</Text> : null}
              </View>
            </>
          )}

          {step === 6 && (
            <>
              <Text style={styles.h1}>Review</Text>
              <View style={styles.card}>
                <Row label="Category" value={typeName || '—'} />
                <Row label="Company" value={insurerName || '—'} />
                <Row label="Product" value={name || '—'} />
                <Row label="Variants" value={variants.length ? variants.join(', ') : 'None'} />
              </View>
            </>
          )}

          {step === 7 && (
            <View style={styles.doneWrap}>
              <View style={styles.doneBadge}><Icon name="check" size={30} color="#127650" /></View>
              <Text style={styles.doneTitle}>Product published</Text>
              <Text style={styles.doneSub}>{name} is now in your catalogue. Add your agent code to quote it.</Text>
              <Pressable style={[styles.cta, shadow.button, { marginTop: 8 }]} onPress={() => (createdId ? navigation.replace('ProductDetail', { id: createdId, name }) : navigation.goBack())}>
                <Icon name="arrow-right" size={18} color={colors.onPrimary} />
                <Text style={styles.ctaText}>View product</Text>
              </Pressable>
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        {step < 7 ? (
          <View style={styles.footer}>
            <Pressable style={[styles.cta, shadow.button, saving && { opacity: 0.6 }]} disabled={saving} onPress={next}>
              <Icon name={step === 6 ? 'check' : 'arrow-right'} size={18} color={colors.onPrimary} />
              <Text style={styles.ctaText}>{saving ? 'Saving…' : step === 6 ? 'Publish product' : `Next: ${STEP_LABELS[step]}`}</Text>
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={{ gap: 8, width: '100%' }}><Text style={styles.label}>{label}</Text>{children}</View>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <View style={styles.sumRow}><Text style={styles.sumLabel}>{label}</Text><Text style={styles.sumValue} numberOfLines={2}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  steps: { paddingHorizontal: 16, paddingBottom: 12, gap: 6 },
  bar: { flexDirection: 'row', gap: 4 },
  seg: { flex: 1, height: 4, borderRadius: 2 },
  segOn: { backgroundColor: colors.navy },
  segOff: { backgroundColor: colors.border },
  stepText: { fontSize: 12, fontFamily: family.semibold, color: colors.muted },
  body: { padding: 16, gap: 12, paddingBottom: 24 },
  h1: { fontSize: 22, fontFamily: family.bold, color: colors.text, letterSpacing: -0.22 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, width: '100%' },
  optOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  optOff: {},
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  optTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  hero: { borderRadius: 22, padding: 16, gap: 8, width: '100%' },
  heroTitle: { fontSize: 18, lineHeight: 24, fontFamily: family.bold, color: colors.text },
  heroSub: { fontSize: 12, lineHeight: 18, fontFamily: family.medium, color: colors.blue },
  muted: { fontSize: 13, fontFamily: family.medium, color: colors.muted, lineHeight: 19 },
  bigBtn: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' },
  bigBtnText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
  bigGhost: { height: 54, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' },
  bigGhostText: { fontSize: 15, fontFamily: family.semibold, color: colors.text },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  input: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, width: '100%' },
  vChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  vChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  vChipText: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  card: { backgroundColor: colors.bg, borderRadius: 18, padding: 16, gap: 12, width: '100%' },
  sumRow: { flexDirection: 'row', gap: 12 },
  sumLabel: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.muted },
  sumValue: { flex: 1.3, textAlign: 'right', fontSize: 13, fontFamily: family.bold, color: colors.text },
  doneWrap: { alignItems: 'center', gap: 10, paddingVertical: 40 },
  doneBadge: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#e7f4ee', alignItems: 'center', justifyContent: 'center' },
  doneTitle: { fontSize: 20, fontFamily: family.bold, color: colors.text },
  doneSub: { fontSize: 14, fontFamily: family.medium, color: colors.muted, textAlign: 'center', lineHeight: 21, paddingHorizontal: 20 },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
