import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { DateField } from '../components/DateField';
import { EmptyState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerSummary, CustomerDetail, ProductRow } from '../api/types';

type R = RouteProp<AppStackParamList, 'ComparisonBuilder'>;
const STEPS = ['Type', 'Insurance', 'Options', 'Details', 'Premiums', 'Recommend', 'Review', 'Done'];
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');
const siOptions = [
  { label: '₹5 lakh', value: 500000 }, { label: '₹10 lakh', value: 1000000 }, { label: '₹25 lakh', value: 2500000 },
  { label: '₹50 lakh', value: 5000000 }, { label: '₹1 crore', value: 10000000 },
];
const termOptions = [{ label: '1 year', value: 1 }, { label: '2 years', value: 2 }, { label: '3 years', value: 3 }];
const RANK_BG = ['#d9eafd', '#e9e3fc', '#fde8c9', '#d4f1e7'];
const toIso = (s: string) => { const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined; };
const age = (dob?: string | null) => { if (!dob) return null; const d = new Date(dob); return Math.floor((Date.now() - d.getTime()) / 31557600000); };

type Opt = { productId: string; name: string; insurerId?: string; insurer?: string; typedBasePremium?: number };

export function ComparisonBuilderScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);

  const draftId = useRef<string | null>(null);
  const version = useRef<number>(0);
  const customerIdRef = useRef<string | null>(params?.customerId ?? null);
  const idem = useRef(newIdempotencyKey());

  const [customerLabel, setCustomerLabel] = useState(params?.customerName ?? '');
  const [mode, setMode] = useState<'COMPARISON' | 'SINGLE'>('COMPARISON');
  const [typeId, setTypeId] = useState<string | null>(null);
  const [options, setOptions] = useState<Opt[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [siLabel, setSiLabel] = useState('');
  const [sumInsured, setSumInsured] = useState<number | null>(null);
  const [termLabel, setTermLabel] = useState('1 year');
  const [policyTerm, setPolicyTerm] = useState<number>(1);
  const [startStr, setStartStr] = useState('');
  const [recommendId, setRecommendId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [priced, setPriced] = useState<any[] | null>(null);

  useEffect(() => {
    api.customers.list({ status: 'ACTIVE', limit: 100 }).then((r) => setCustomers(r.data)).catch(() => undefined);
    api.quotations.choices().then((r) => setTypes(r.data.types)).catch(() => undefined);
    if (customerIdRef.current) fetchCustomer(customerIdRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCustomer = async (id: string) => { try { const { data } = await api.customers.get(id); setCustomer(data); setPeople([`C:${data.id}`]); } catch { /* */ } };
  const loadProducts = async (tid: string) => { try { const { data } = await api.products.list({ typeId: tid }); setProducts(data); setOptions([]); } catch { /* */ } };

  const inputsNow = () => ({ typeId, people, sumInsured: sumInsured ?? undefined, policyTerm, startDate: toIso(startStr) });

  const save = async (patch?: { recommend?: boolean }) => {
    setError(null); setLoading(true);
    try {
      if (!draftId.current) {
        if (!customerIdRef.current) { setError('Choose a policy holder.'); setLoading(false); return false; }
        const { data } = await api.comparisons.start(customerIdRef.current, { idempotencyKey: idem.current });
        draftId.current = data.id; version.current = data.version;
      }
      const body: any = { version: version.current, inputs: inputsNow(), options: options.map((o) => ({ productId: o.productId, ...(o.typedBasePremium ? { typedBasePremium: o.typedBasePremium } : {}) })) };
      if (patch?.recommend) { body.recommendedProductId = recommendId; body.recommendedReason = reason.trim() || undefined; }
      const { data } = await api.comparisons.save(draftId.current!, body);
      version.current = data.version;
      return true;
    } catch (e) {
      if (e instanceof ApiError) { setError(Object.values(e.fieldErrors)[0] || e.message); if (e.details?.comparison?.version) version.current = e.details.comparison.version; }
      else setError('Could not save this step.');
      return false;
    } finally { setLoading(false); }
  };

  const runPreview = async () => {
    if (!draftId.current) return;
    setLoading(true); setError(null);
    try { const { data } = await api.comparisons.preview(draftId.current); setPriced(data.options ?? data.table ?? []); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not price the options.'); }
    finally { setLoading(false); }
  };
  const runGenerate = async () => {
    if (!draftId.current) return;
    setLoading(true); setError(null);
    try { await api.comparisons.generate(draftId.current, { idempotencyKey: newIdempotencyKey() }); navigation.replace('ComparisonDetail', { id: draftId.current, customerName: customerLabel }); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not generate the comparison.'); setLoading(false); }
  };

  const toggleOption = (p: ProductRow) => setOptions((os) => {
    const exists = os.find((o) => o.productId === p.id);
    if (exists) return os.filter((o) => o.productId !== p.id);
    if (os.length >= 3) return os;
    return [...os, { productId: p.id, name: p.name, insurerId: (p as any).insurerId, insurer: (p as any).insurer }];
  });
  const togglePerson = (k: string) => setPeople((ps) => (ps.includes(k) ? ps.filter((x) => x !== k) : [...ps, k]));

  const next = async () => {
    if (step === 1) { if (!customerIdRef.current) return setError('Choose a policy holder.'); setError(null); setStep(2); }
    else if (step === 2) { if (mode === 'SINGLE') navigation.replace('QuoteBuilder', { customerId: customerIdRef.current ?? undefined, customerName: customerLabel }); else { setError(null); setStep(3); } }
    else if (step === 3) { if (!typeId) return setError('Choose an insurance type.'); if (await save()) setStep(4); }
    else if (step === 4) { if (options.length < 2) return setError('Pick at least two options.'); if (await save()) setStep(5); }
    else if (step === 5) { if (!people.length || !sumInsured) return setError('Select people and sum insured.'); if (await save()) setStep(6); }
    else if (step === 6) { if (await save()) setStep(7); }
    else if (step === 7) { if (!recommendId) return setError('Pick the recommended option.'); if (await save({ recommend: true })) { setStep(8); runPreview(); } }
  };

  const peopleRows = customer ? [{ key: `C:${customer.id}`, name: customer.name, dob: (customer as any).dob }, ...(customer.family ?? []).map((m: any) => ({ key: `F:${m.id}`, name: m.name, dob: m.dob }))] : [];
  const who = (customerLabel.split(' · ')[0] || 'the customer');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}><Text style={styles.navTitle}>New comparison</Text>{customerLabel ? <Text style={styles.navSub} numberOfLines={1}>{who}</Text> : null}</View>
      </View>
      <View style={styles.progress}>{Array.from({ length: 8 }).map((_, i) => <View key={i} style={[styles.seg, i < step ? styles.segOn : styles.segOff]} />)}</View>

      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.stepLabel}>Step {step} of 8 · {['Customer', 'Type', 'Insurance', 'Options', 'Details', 'Premiums', 'Recommend', 'Review'][step - 1]}</Text>

          {step === 1 && (
            <>
              <Text style={styles.h1}>Who is it for?</Text>
              <Dropdown value={customerLabel} placeholder="Choose policy holder" options={customers.map((c) => ({ label: `${c.name} · ${c.number}`, id: c.id }))}
                onSelect={(o: any) => { customerIdRef.current = o.id; setCustomerLabel(o.label); fetchCustomer(o.id); }} />
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.h1}>Comparison quotation</Text>
              {[{ k: 'SINGLE', t: 'Single quotation', s: 'One product' }, { k: 'COMPARISON', t: 'Comparison', s: '2–3 options side by side · no payment link' }].map((o) => { const on = o.k === mode; return (
                <Pressable key={o.k} style={[styles.opt, on && styles.optOn]} onPress={() => setMode(o.k as any)}>
                  <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                  <View style={{ flex: 1 }}><Text style={styles.optTitle}>{o.t}</Text><Text style={styles.optSub}>{o.s}</Text></View>
                </Pressable>
              ); })}
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.h1}>Insurance type</Text>
              {types.map((t) => { const on = t.id === typeId; return (
                <Pressable key={t.id} style={[styles.opt, on && styles.optOn]} onPress={() => { setTypeId(t.id); loadProducts(t.id); }}>
                  <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                  <Text style={styles.optTitle}>{t.name}</Text>
                </Pressable>
              ); })}
            </>
          )}

          {step === 4 && (
            <>
              <Text style={styles.h1}>Pick 2 to 3 options</Text>
              {products.length ? products.map((p) => { const idx = options.findIndex((o) => o.productId === p.id); const on = idx >= 0; return (
                <Pressable key={p.id} style={[styles.rowOpt, on && styles.optOn]} onPress={() => toggleOption(p)}>
                  {on ? <View style={[styles.rankNum, { backgroundColor: RANK_BG[idx % RANK_BG.length] }]}><Text style={styles.rankNumText}>{idx + 1}</Text></View>
                    : <View style={styles.rankEmpty} />}
                  <View style={{ flex: 1 }}><Text style={styles.optTitle} numberOfLines={1}>{p.name}{(p as any).defaultVariant ? ` · ${(p as any).defaultVariant}` : ''}</Text>{(p as any).insurer ? <Text style={styles.optSub}>{(p as any).insurer}</Text> : null}</View>
                </Pressable>
              ); }) : <EmptyState icon="box" title="No products" subtitle="No products available for this type to compare." />}
              <View style={styles.blueNote}><Icon name="layers" size={15} color={colors.blue} /><Text style={styles.blueText}>{options.length} of 3 used. Variants count as separate options.</Text></View>
            </>
          )}

          {step === 5 && (
            <>
              <Text style={styles.h1}>Same for every option</Text>
              {peopleRows.map((pr) => { const on = people.includes(pr.key); const a = age(pr.dob); return (
                <Pressable key={pr.key} style={[styles.rowOpt, on && styles.optOn]} onPress={() => (pr.dob ? togglePerson(pr.key) : undefined)}>
                  <View style={[styles.check, on && styles.checkOn]}>{on ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
                  <Text style={styles.optTitle}>{pr.name}{a != null ? ` · ${a}` : ' · add DOB'}</Text>
                </Pressable>
              ); })}
              <View style={styles.row2}>
                <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Sum insured</Text><Dropdown value={siLabel} placeholder="Cover" options={siOptions} onSelect={(o: any) => { setSiLabel(o.label); setSumInsured(o.value); }} /></View>
                <View style={{ flex: 1, gap: 8 }}><Text style={styles.label}>Term</Text><Dropdown value={termLabel} placeholder="Term" options={termOptions} onSelect={(o: any) => { setTermLabel(o.label); setPolicyTerm(o.value); }} /></View>
              </View>
              <View style={{ gap: 8 }}><Text style={styles.label}>Start date</Text><DateField value={startStr} onChange={setStartStr} /></View>
            </>
          )}

          {step === 6 && (
            <>
              <Text style={styles.h1}>Enter each premium</Text>
              {options.map((o, i) => (
                <View key={o.productId} style={{ gap: 8 }}>
                  <Text style={styles.label}>{o.name} · base premium</Text>
                  <View style={styles.premInput}>
                    <Text style={styles.cur}>₹</Text>
                    <TextInput keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.muted} style={styles.premField} selectionColor={colors.blue}
                      value={o.typedBasePremium ? String(o.typedBasePremium) : ''}
                      onChangeText={(t) => setOptions((os) => os.map((x, j) => (j === i ? { ...x, typedBasePremium: Number(t.replace(/[^\d]/g, '')) || undefined } : x)))} />
                  </View>
                </View>
              ))}
              {people.length > 1 ? <View style={styles.amberNote}><Icon name="edit-3" size={14} color="#8a5a12" /><Text style={styles.amberText}>Several people: copy each price from the insurer portal.</Text></View> : null}
            </>
          )}

          {step === 7 && (
            <>
              <Text style={styles.h1}>Recommend one</Text>
              {options.map((o) => { const on = o.productId === recommendId; return (
                <Pressable key={o.productId} style={[styles.opt, on && styles.optOn]} onPress={() => setRecommendId(o.productId)}>
                  <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                  <View style={{ flex: 1 }}><Text style={styles.optTitle}>{o.name}{o.typedBasePremium ? ` · ${rupees(o.typedBasePremium)}` : ''}</Text></View>
                </Pressable>
              ); })}
              <Text style={styles.label}>Why (printed on the comparison) *</Text>
              <TextInput value={reason} onChangeText={setReason} placeholder="e.g. No room-rent limit and unlimited restore suit a young family." placeholderTextColor={colors.muted} style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]} multiline selectionColor={colors.blue} />
            </>
          )}

          {step === 8 && (() => {
            const list: any[] = (priced && priced.length ? priced : options) as any[];
            const rec = list.find((o) => o.productId === recommendId) ?? list[0];
            const others = list.filter((o) => o !== rec);
            return (
              <>
                <Text style={styles.h1}>Exactly what {who} sees</Text>
                {rec ? (
                  <View style={styles.recCard}>
                    <Text style={styles.recLabel} numberOfLines={2}>Recommended · {rec.name}</Text>
                    <Text style={styles.recSub}>{rupees(rec.premium ?? rec.total ?? rec.typedBasePremium)}</Text>
                  </View>
                ) : null}
                {others.map((o: any, i: number) => (
                  <View key={o.productId ?? i} style={styles.optRow}>
                    <View style={styles.rankNum}><Text style={styles.rankNumText}>{i + 2}</Text></View>
                    <View style={{ flex: 1 }}><Text style={styles.optRowTitle} numberOfLines={1}>{o.name}</Text><Text style={styles.optRowSub}>{rupees(o.premium ?? o.total ?? o.typedBasePremium)}</Text></View>
                  </View>
                ))}
                {loading && !priced ? <Text style={styles.pricing}>Pricing options…</Text> : null}
                <View style={styles.cmpNote}><Icon name="alert-circle" size={16} color={colors.blue} /><Text style={styles.cmpNoteText}>Comparisons never carry a payment link.</Text></View>
              </>
            );
          })()}
        </ScrollView>

        {error ? <View style={styles.footerErrWrap}><Icon name="alert-circle" size={15} color={colors.red} /><Text style={styles.footerErr}>{error}</Text></View> : null}
        <View style={styles.footer}>
          {step < 8 ? (
            <Pressable style={[styles.cta, shadow.button, loading && { opacity: 0.6 }]} disabled={loading} onPress={next}>
              <Icon name="arrow-right" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{loading ? 'Saving…' : `Next: ${STEPS[step - 1]}`}</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.cta, shadow.button, loading && { opacity: 0.6 }]} disabled={loading} onPress={runGenerate}>
              <Icon name="check" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{loading ? 'Generating…' : 'Generate comparison'}</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  progress: { flexDirection: 'row', gap: 4, paddingHorizontal: 16, paddingBottom: 12 },
  seg: { flex: 1, height: 4, borderRadius: 2 },
  segOn: { backgroundColor: colors.navy },
  segOff: { backgroundColor: colors.border },
  body: { padding: 16, gap: 12, paddingBottom: 24 },
  stepLabel: { fontSize: 12, fontFamily: family.semibold, color: colors.muted },
  h1: { fontSize: 22, fontFamily: family.bold, color: colors.text, letterSpacing: -0.22 },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  row2: { flexDirection: 'row', gap: 10 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14 },
  rowOpt: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14 },
  optOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  optTitle: { flex: 1, fontSize: 14, fontFamily: family.bold, color: colors.text },
  optSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  rankNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  rankNumText: { fontSize: 13, fontFamily: family.bold, color: colors.navy },
  rankEmpty: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#c3ccd8' },
  premInput: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 50, backgroundColor: colors.bg, borderRadius: 16, borderWidth: 2, borderColor: colors.blue, paddingHorizontal: 16 },
  cur: { fontSize: 15, fontFamily: family.bold, color: colors.text },
  premField: { flex: 1, fontSize: 15, fontFamily: family.bold, color: colors.text, padding: 0 },
  input: { backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  amberNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fbf1e1', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  amberText: { flex: 1, fontSize: 12, fontFamily: family.semibold, color: '#8a5a12' },
  blueNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e8f0fd', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  blueText: { flex: 1, fontSize: 12, fontFamily: family.semibold, color: colors.blue },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  recCard: { backgroundColor: colors.navy, borderRadius: 22, padding: 16, gap: 6 },
  recLabel: { fontSize: 16, lineHeight: 22, fontFamily: family.bold, color: colors.onPrimary },
  recSub: { fontSize: 13, fontFamily: family.semibold, color: '#c9d6ea' },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  optRowTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  optRowSub: { fontSize: 12, fontFamily: family.semibold, color: colors.muted, marginTop: 2 },
  pricing: { fontSize: 13, fontFamily: family.medium, color: colors.muted, textAlign: 'center' },
  cmpNote: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f0fd', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  cmpNoteText: { flex: 1, fontSize: 13, fontFamily: family.semibold, color: colors.blue },
  footer: { padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  footerErrWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 6, backgroundColor: colors.surface },
  footerErr: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.red },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
