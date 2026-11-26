import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerSummary, CustomerDetail, ProductRow } from '../api/types';

type R = RouteProp<AppStackParamList, 'QuoteBuilder'>;
const STEP_LABELS = ['Customer', 'Product', 'Cover', 'Premium', 'Review'];
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');
const siOptions = [
  { label: '₹5 lakh', value: 500000 }, { label: '₹10 lakh', value: 1000000 }, { label: '₹15 lakh', value: 1500000 },
  { label: '₹25 lakh', value: 2500000 }, { label: '₹50 lakh', value: 5000000 }, { label: '₹1 crore', value: 10000000 },
];
const pad = (n: number) => String(n).padStart(2, '0');
function startPresets() {
  const now = new Date();
  const d = (a: number) => { const x = new Date(now); x.setDate(now.getDate() + a); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; };
  return [{ label: 'Today', value: d(0) }, { label: 'Tomorrow', value: d(1) }, { label: 'In a week', value: d(7) }, { label: 'In 15 days', value: d(15) }, { label: 'In a month', value: d(30) }];
}
const AV = ['#fbd5dd', '#d9eafd', '#d4f1e7', '#fde8c9', '#e9e3fc'];
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

export function QuoteBuilderScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const starts = startPresets();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);

  const draftId = useRef<string | null>(params?.quotationId ?? null);
  const version = useRef<number>(0);
  const customerIdRef = useRef<string | null>(params?.customerId ?? null);
  const idem = useRef(newIdempotencyKey());

  const [inputs, setInputs] = useState<any>({ mode: 'SINGLE' });
  const [calc, setCalc] = useState<any>(null);
  const [customerLabel, setCustomerLabel] = useState(params?.customerName ?? '');
  const [typeLabel, setTypeLabel] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [siLabel, setSiLabel] = useState('');
  const [startLabel, setStartLabel] = useState('');
  const [people, setPeople] = useState<string[]>([]);
  const [riders, setRiders] = useState<string[]>([]);
  const [basePremium, setBasePremium] = useState('');

  useEffect(() => {
    api.customers.list({ status: 'ACTIVE', limit: 100 }).then((r) => setCustomers(r.data)).catch(() => undefined);
    api.quotations.choices().then((r) => setTypes(r.data.types)).catch(() => undefined);
    if (customerIdRef.current) fetchCustomer(customerIdRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCustomer = async (id: string) => { try { const { data } = await api.customers.get(id); setCustomer(data); } catch { /* */ } };
  const loadProducts = async (typeId: string) => { try { const { data } = await api.products.list({ typeId }); setProducts(data); } catch { /* */ } };

  const selectedProduct = products.find((p) => p.id === inputs.productId);
  const addOns: { name: string; price: number }[] = Array.isArray(selectedProduct?.addOns as any)
    ? (selectedProduct as any).addOns.map((a: any) => (typeof a === 'string' ? { name: a, price: 0 } : { name: a.name ?? String(a), price: Number(a.price ?? 0) }))
    : [];

  const ALLOWED_INPUT_KEYS = ['typeId', 'insurerId', 'productId', 'people', 'sumInsured', 'policyTerm', 'startDate', 'answers', 'riders', 'override', 'discount', 'manual', 'paymentLink', 'renewalOf', 'variantId', 'typedBasePremium', 'riderPrices', 'customAddOns', 'benefits'];
  const save = async (nextStep: number, patch: any) => {
    const merged = { ...inputs, ...patch };
    setInputs(merged); setError(null); setLoading(true);
    const clean: any = {}; for (const k of ALLOWED_INPUT_KEYS) if (merged[k] !== undefined) clean[k] = merged[k];
    try {
      if (!draftId.current) {
        if (!customerIdRef.current) { setError('Choose a policy holder.'); setLoading(false); return; }
        const { data } = await api.quotations.start(customerIdRef.current, { idempotencyKey: idem.current });
        draftId.current = data.id; version.current = data.version;
      }
      const { data } = await api.quotations.save(draftId.current!, { version: version.current, step: nextStep, inputs: clean });
      version.current = data.version;
      setStep(nextStep);
    } catch (e) {
      if (e instanceof ApiError) { setError(Object.values(e.fieldErrors)[0] || e.message); if (e.details?.quotation?.version) version.current = e.details.quotation.version; }
      else setError('Could not save this step.');
    } finally { setLoading(false); }
  };

  const runCalculate = async () => {
    if (!draftId.current) return;
    setLoading(true); setError(null);
    try { const { data } = await api.quotations.calculate(draftId.current); setCalc(data.calc); version.current = data.version; }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not calculate the premium.'); }
    finally { setLoading(false); }
  };
  const runGenerate = async () => {
    if (!draftId.current) return;
    setLoading(true); setError(null);
    try { const { data } = await api.quotations.generate(draftId.current, { idempotencyKey: newIdempotencyKey() });
      navigation.replace('QuoteDetail', { id: data.id, number: data.number ?? undefined, customerName: customerLabel.split(' · ')[0] });
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not generate the quotation.'); setLoading(false); }
  };

  const togglePerson = (k: string) => setPeople((ps) => (ps.includes(k) ? ps.filter((x) => x !== k) : [...ps, k]));
  const toggleRider = (n: string) => setRiders((rs) => (rs.includes(n) ? rs.filter((x) => x !== n) : [...rs, n]));
  const soon = (title: string) => navigation.navigate('ComingSoon', { title });

  const peopleRows = customer
    ? [{ key: `C:${customer.id}`, name: customer.name, rel: 'Self', age: customer.age, ok: true },
       ...(customer.family ?? []).map((m) => ({ key: `F:${m.id}`, name: m.name, rel: m.relationship, age: m.age, ok: !!m.age }))]
    : [];
  const base = Number(basePremium || 0);
  const addonTotal = riders.reduce((s, n) => s + (addOns.find((a) => a.name === n)?.price ?? 0), 0);
  const gst = Math.round((base + addonTotal) * 0.18);
  const previewTotal = base + addonTotal + gst;
  const filteredProducts = products.filter((p) => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>New quotation</Text>
          <Text style={styles.navSub}>Step {step} of 5 · {STEP_LABELS[step - 1]}</Text>
        </View>
        <Pressable hitSlop={8} onPress={() => navigation.goBack()}><Text style={styles.save}>Save</Text></Pressable>
      </View>
      <View style={styles.progress}>
        {STEP_LABELS.map((_, i) => <View key={i} style={[styles.seg, i < step ? styles.segOn : styles.segOff]} />)}
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <>
            <Text style={styles.h1}>Who is it for?</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Policy holder</Text>
              <Dropdown value={customerLabel} placeholder="Choose policy holder"
                options={customers.map((c) => ({ label: `${c.name} · ${c.number}`, id: c.id }))}
                onSelect={(o: any) => { customerIdRef.current = o.id; setCustomerLabel(o.label); fetchCustomer(o.id); }} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Type</Text>
              {[{ k: 'SINGLE', t: 'Single quotation', d: 'Can carry a payment link' }, { k: 'COMPARISON', t: 'Comparison', d: '2–3 options side by side' }].map((o) => {
                const on = inputs.mode === o.k;
                return (
                  <Pressable key={o.k} style={[styles.radioCard, on && styles.radioCardOn]} onPress={() => setInputs((p: any) => ({ ...p, mode: o.k }))}>
                    <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.radioTitle}>{o.t}</Text>
                      <Text style={styles.radioDesc}>{o.d}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Insurance</Text>
              <View style={styles.chips}>
                {types.map((t) => {
                  const on = t.id === inputs.typeId;
                  return (
                    <Pressable key={t.id} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                      onPress={() => { setInputs((p: any) => ({ ...p, typeId: t.id })); setTypeLabel(t.name); loadProducts(t.id); }}>
                      <Text style={[styles.chipText, { color: on ? colors.onPrimary : colors.muted3 }]}>{t.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.h1}>Pick a product</Text>
            <View style={styles.search}>
              <Icon name="search" size={17} color={colors.grayBar} />
              <TextInput value={productSearch} onChangeText={setProductSearch} placeholder="Search products" placeholderTextColor={colors.grayBar} style={styles.searchInput} selectionColor={colors.blue} />
            </View>
            {filteredProducts.map((pr) => {
              const on = pr.id === inputs.productId;
              return (
                <Pressable key={pr.id} style={[styles.radioCard, on && styles.radioCardOn]}
                  onPress={() => setInputs((p: any) => ({ ...p, productId: pr.id, insurerId: pr.insurerId, variantName: pr.defaultVariant ?? undefined }))}>
                  <View style={styles.prodRow}>
                    <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.radioTitle}>{pr.name}</Text>
                      <Text style={styles.radioDesc}>{[pr.insurer, pr.code].filter(Boolean).join(' · ')}</Text>
                    </View>
                  </View>
                  {on && pr.variants?.length ? (
                    <View style={{ marginTop: 10, marginLeft: 34 }}>
                      <Dropdown value={inputs.variantName ?? ''} placeholder="Variant"
                        options={pr.variants.map((v) => ({ label: v }))}
                        onSelect={(o: any) => setInputs((p: any) => ({ ...p, variantName: o.label }))} />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
            <Pressable style={styles.bestfit} onPress={() => navigation.navigate('BestFit', customerIdRef.current ? { customerId: customerIdRef.current, customerName: customerLabel } : undefined)}>
              <Icon name="target" size={16} color={colors.blue} />
              <Text style={styles.bestfitText}>Not sure? Run Best fit.</Text>
            </Pressable>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.h1}>People and cover</Text>
            {peopleRows.map((pr, i) => {
              const on = people.includes(pr.key);
              return (
                <Pressable key={pr.key} disabled={!pr.ok} style={[styles.person, on && styles.personOn, !pr.ok && { opacity: 0.6 }]} onPress={() => pr.ok && togglePerson(pr.key)}>
                  <View style={[styles.pAvatar, { backgroundColor: AV[i % AV.length] }]}><Text style={styles.pAvatarText}>{initials(pr.name)}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName}>{pr.name}</Text>
                    <Text style={styles.personSub}>{pr.rel}{pr.age ? ` ${pr.age}` : ' · add DOB'}</Text>
                  </View>
                  <View style={[styles.check, on && styles.checkOn]}>{on ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
                </Pressable>
              );
            })}
            {people.length ? <View style={styles.okNote}><Icon name="check-circle" size={14} color={colors.green} /><Text style={styles.okNoteText}>All {people.length} within the age limits.</Text></View> : null}
            <View style={styles.field}>
              <Text style={styles.label}>Sum insured *</Text>
              <Dropdown value={siLabel} placeholder="Choose cover" options={siOptions}
                onSelect={(o: any) => { setInputs((p: any) => ({ ...p, sumInsured: o.value })); setSiLabel(o.label); }} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Start date *</Text>
              <Dropdown value={startLabel} placeholder="Choose start date" options={starts}
                onSelect={(o: any) => { setInputs((p: any) => ({ ...p, startDate: o.value })); setStartLabel(o.label); }} />
            </View>
          </>
        )}

        {step === 4 && (
          <>
            <Text style={styles.h1}>Premium</Text>
            {people.length > 1 ? (
              <View style={styles.amberNote}><Icon name="edit-3" size={14} color="#8a5a12" /><Text style={styles.amberNoteText}>{people.length} people: enter it from the insurer portal</Text></View>
            ) : null}
            <View style={styles.field}>
              <Text style={styles.label}>Base premium before GST *</Text>
              <View style={styles.premInput}>
                <Text style={styles.premCur}>₹</Text>
                <TextInput value={basePremium} onChangeText={(t) => setBasePremium(t.replace(/[^\d]/g, ''))} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.muted} style={styles.premField} selectionColor={colors.blue} />
              </View>
            </View>
            {addOns.length ? (
              <View style={styles.field}>
                <Text style={styles.label}>Add-ons</Text>
                {addOns.map((a) => {
                  const on = riders.includes(a.name);
                  return (
                    <Pressable key={a.name} style={styles.addon} onPress={() => toggleRider(a.name)}>
                      <View style={[styles.check, on && styles.checkOn]}>{on ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
                      <Text style={[styles.addonName, { flex: 1 }]}>{a.name}</Text>
                      <Text style={styles.addonPrice}>{a.price ? rupees(a.price) : '—'}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
            <Pressable style={styles.addOwn} onPress={() => Alert.alert('Add-ons', 'Add-ons and riders come from the selected product. Pick a product with add-ons to include them.')}>
              <Icon name="plus" size={15} color={colors.blue} />
              <Text style={styles.addOwnText}>Add your own add-on</Text>
            </Pressable>
            <View style={styles.breakdown}>
              <BreakRow label="Base premium" value={rupees(base)} />
              <BreakRow label="Add-ons" value={rupees(addonTotal)} />
              <BreakRow label="GST 18%" value={rupees(gst)} />
              <View style={styles.breakTotal}><Text style={styles.breakTotalLabel}>Total</Text><Text style={styles.breakTotalValue}>{rupees(previewTotal)}</Text></View>
            </View>
          </>
        )}

        {step === 5 && (
          <>
            <Text style={styles.h1}>Review</Text>
            <View style={styles.card}>
              <SummaryRow label="Policy holder" value={customerLabel.split(' · ')[0] || '—'} />
              <SummaryRow label="Product" value={[selectedProduct?.name, inputs.variantName].filter(Boolean).join(' · ') || '—'} />
              <SummaryRow label="People" value={String(people.length)} />
              <SummaryRow label="Sum insured" value={siLabel || '—'} />
              <SummaryRow label="Start" value={startLabel || '—'} />
              {riders.length ? <SummaryRow label="Add-ons" value={riders.join(', ')} /> : null}
            </View>
            <View style={styles.total}>
              <Text style={styles.totalLabel}>Total payable</Text>
              <Text style={styles.totalValue}>{calc?.breakdown?.final ? rupees(calc.breakdown.final) : rupees(previewTotal)}</Text>
            </View>
            {!calc ? (
              <Pressable style={styles.ghostBtn} onPress={runCalculate}>
                <Icon name="refresh-cw" size={16} color={colors.text} />
                <Text style={styles.ghostText}>{loading ? 'Calculating…' : 'Calculate premium'}</Text>
              </Pressable>
            ) : null}
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        {step < 5 ? (
          <Pressable style={[styles.next, shadow.button, loading && { opacity: 0.6 }]} disabled={loading} onPress={() => {
            if (step === 1) { if (!inputs.typeId) return setError('Choose an insurance type.'); save(2, {}); }
            else if (step === 2) { if (!inputs.productId) return setError('Choose a product.'); save(3, { insurerId: inputs.insurerId, productId: inputs.productId }); }
            else if (step === 3) { if (!people.length) return setError('Select at least one person.'); if (!inputs.sumInsured) return setError('Choose the sum insured.'); save(4, { people, sumInsured: inputs.sumInsured, startDate: inputs.startDate }); }
            else if (step === 4) { save(5, { typedBasePremium: base || undefined, riders }); }
          }}>
            <Icon name="arrow-right" size={18} color={colors.onPrimary} />
            <Text style={styles.nextText}>{loading ? 'Saving…' : 'Next'}</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.next, shadow.button, (loading || !calc) && { opacity: 0.6 }]} disabled={loading || !calc} onPress={runGenerate}>
            <Icon name="check" size={18} color={colors.onPrimary} />
            <Text style={styles.nextText}>{loading ? 'Generating…' : 'Generate'}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.sumRow}><Text style={styles.sumLabel}>{label}</Text><Text style={styles.sumValue} numberOfLines={2}>{value}</Text></View>;
}
function BreakRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.breakRow}><Text style={styles.breakLabel}>{label}</Text><Text style={styles.breakValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  save: { fontSize: 13, fontFamily: family.bold, color: colors.blue, paddingHorizontal: 10, paddingVertical: 6 },
  progress: { flexDirection: 'row', gap: 4, paddingHorizontal: 16, paddingBottom: 8 },
  seg: { flex: 1, height: 4, borderRadius: 2 },
  segOn: { backgroundColor: colors.navy },
  segOff: { backgroundColor: colors.border },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 14 },
  h1: { fontSize: 22, fontFamily: family.bold, color: colors.text, letterSpacing: -0.22 },
  field: { gap: 8 },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  radioCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bg, borderRadius: 16, borderWidth: 1, borderColor: 'transparent', padding: 14 },
  radioCardOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  prodRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  radioTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  radioDesc: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.bg },
  chipText: { fontSize: 13, fontFamily: family.semibold },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 46, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.text, padding: 0 },
  bestfit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f3f7ff', borderRadius: 16, paddingVertical: 14 },
  bestfitText: { fontSize: 13, fontFamily: family.bold, color: colors.blue },
  person: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.bg, borderRadius: 16, borderWidth: 1.5, borderColor: 'transparent', padding: 12 },
  personOn: { borderColor: colors.blue, backgroundColor: '#f3f7ff' },
  pAvatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  pAvatarText: { fontSize: 11, fontFamily: family.bold, color: colors.navy },
  personName: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  personSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  okNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e7f4ee', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  okNoteText: { fontSize: 12, fontFamily: family.semibold, color: colors.green },
  amberNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fbf1e1', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  amberNoteText: { fontSize: 12, fontFamily: family.semibold, color: '#8a5a12' },
  premInput: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 50, backgroundColor: colors.bg, borderRadius: 16, borderWidth: 2, borderColor: colors.blue, paddingHorizontal: 16 },
  premCur: { fontSize: 15, fontFamily: family.bold, color: colors.text },
  premField: { flex: 1, fontSize: 15, fontFamily: family.bold, color: colors.text, padding: 0 },
  addon: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bg, borderRadius: 14, padding: 12 },
  addonName: { fontSize: 14, fontFamily: family.semibold, color: colors.text },
  addonPrice: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  addOwn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, borderColor: colors.blue, borderStyle: 'dashed', paddingVertical: 12 },
  addOwnText: { fontSize: 13, fontFamily: family.bold, color: colors.blue },
  breakdown: { backgroundColor: '#fde8ec', borderRadius: 16, padding: 14, gap: 8 },
  breakRow: { flexDirection: 'row', alignItems: 'center' },
  breakLabel: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.renewalText },
  breakValue: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  breakTotal: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(139,58,76,0.2)' },
  breakTotalLabel: { flex: 1, fontSize: 14, fontFamily: family.bold, color: colors.renewalText },
  breakTotalValue: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  card: { backgroundColor: colors.bg, borderRadius: 18, padding: 16, gap: 12 },
  sumRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  sumLabel: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.muted },
  sumValue: { flex: 1.3, textAlign: 'right', fontSize: 13, fontFamily: family.bold, color: colors.text },
  total: { backgroundColor: colors.navy, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center' },
  totalLabel: { flex: 1, fontSize: 14, fontFamily: family.bold, color: '#fff' },
  totalValue: { fontSize: 20, fontFamily: family.bold, color: '#fff' },
  ghostBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18 },
  ghostText: { fontSize: 14, fontFamily: family.semibold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  next: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  nextText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
