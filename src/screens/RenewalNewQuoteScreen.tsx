import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { EmptyState } from '../components/ui';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerDetail, ProductRow } from '../api/types';

type R = RouteProp<AppStackParamList, 'RenewalNewQuote'>;
const STEPS = ['Product', 'Details', 'Review'];
const rupees = (n?: number | null) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');
const siOptions = [
  { label: '₹5 lakh', value: 500000 }, { label: '₹10 lakh', value: 1000000 }, { label: '₹25 lakh', value: 2500000 },
  { label: '₹50 lakh', value: 5000000 }, { label: '₹1 crore', value: 10000000 },
];

export function RenewalNewQuoteScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [step, setStep] = useState(1);
  const [renewal, setRenewal] = useState<any>(null);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [productId, setProductId] = useState<string | null>(null);
  const [portability, setPortability] = useState(true);
  const [people, setPeople] = useState<string[]>([]);
  const [siLabel, setSiLabel] = useState('');
  const [sumInsured, setSumInsured] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());

  useEffect(() => {
    (async () => {
      try {
        const { data: rn } = await api.renewals.get(params.id);
        setRenewal(rn);
        if (rn.customer?.id) { const { data: c } = await api.customers.get(rn.customer.id); setCustomer(c); setPeople([`C:${c.id}`]); }
        const cs = await api.dashboard.catalogueSummary();
        const type = cs.data.types.find((t) => (rn.policy?.type ?? '').toLowerCase().includes(t.name.toLowerCase())) ?? cs.data.types[0];
        if (type) { const { data: pr } = await api.products.list({ typeId: type.typeId }); setProducts(pr); }
      } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not load renewal context.'); }
    })();
  }, [params.id]);

  const selectedProduct = products.find((p) => p.id === productId);
  const peopleRows = customer ? [{ key: `C:${customer.id}`, name: customer.name }, ...(customer.family ?? []).map((m) => ({ key: `F:${m.id}`, name: m.name }))] : [];
  const togglePerson = (k: string) => setPeople((ps) => (ps.includes(k) ? ps.filter((x) => x !== k) : [...ps, k]));

  const generate = async () => {
    setBusy(true); setError(null);
    try {
      const { data } = await api.renewals.renewalQuotation(params.id, {
        mode: 'NEW_QUOTATION', productId: productId ?? undefined, insurerId: selectedProduct?.insurerId,
        people, sumInsured: sumInsured ?? undefined,
      }, { idempotencyKey: idem.current });
      const q = data?.quotation ?? data;
      if (q?.id) navigation.replace('QuoteDetail', { id: q.id, number: q.number ?? undefined, customerName: renewal?.customer?.name });
      else navigation.goBack();
    } catch (e) { idem.current = newIdempotencyKey(); setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not generate the quotation.'); setBusy(false); }
  };

  const next = () => {
    if (step === 1) { if (!productId) return setError('Choose a product.'); setError(null); setStep(2); }
    else if (step === 2) { if (!people.length || !sumInsured) return setError('Select people and sum insured.'); setError(null); setStep(3); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}><Icon name="chevron-left" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>New quotation for renewal</Text>
          <Text style={styles.navSub} numberOfLines={1}>{renewal?.policy?.product ? `Replaces ${renewal.policy.product}` : `Step ${step} of 3 · ${STEPS[step - 1]}`}</Text>
        </View>
      </View>
      <View style={styles.progress}>{STEPS.map((_, i) => <View key={i} style={[styles.seg, i < step ? styles.segOn : styles.segOff]} />)}</View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>Step {step} of 3 · {STEPS[step - 1]}</Text>
        {step === 1 && (
          <>
            {products.length ? products.map((p) => { const on = p.id === productId; return (
              <Pressable key={p.id} style={[styles.opt, on && styles.optOn]} onPress={() => setProductId(p.id)}>
                <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                <View style={{ flex: 1 }}><Text style={styles.optTitle}>{p.name}{p.defaultVariant ? ` · ${p.defaultVariant}` : ''}</Text><Text style={styles.optSub}>{p.insurer ?? ''}</Text></View>
              </Pressable>
            ); }) : <EmptyState icon="box" title="No products" subtitle="No products available to renew into." />}
            {selectedProduct?.insurer ? (
              <Pressable style={[styles.portRow, portability && styles.portOn]} onPress={() => setPortability((v) => !v)}>
                <View style={[styles.check, portability && styles.checkOn]}>{portability ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
                <View style={{ flex: 1 }}><Text style={styles.portTitle}>Request portability from {selectedProduct.insurer}</Text><Text style={styles.portSub}>Served waiting periods carry over</Text></View>
              </Pressable>
            ) : null}
          </>
        )}
        {step === 2 && (
          <>
            {peopleRows.map((pr) => { const on = people.includes(pr.key); return (
              <Pressable key={pr.key} style={[styles.opt, on && styles.optOn]} onPress={() => togglePerson(pr.key)}>
                <View style={[styles.check, on && styles.checkOn]}>{on ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
                <Text style={styles.optTitle}>{pr.name}</Text>
              </Pressable>
            ); })}
            <Text style={styles.label}>Sum insured *</Text>
            <Dropdown value={siLabel} placeholder="Cover" options={siOptions} onSelect={(o: any) => { setSiLabel(o.label); setSumInsured(o.value); }} />
          </>
        )}
        {step === 3 && (
          <View style={styles.card}>
            <Row label="Product" value={selectedProduct?.name ?? '—'} />
            <Row label="Insurer" value={selectedProduct?.insurer ?? '—'} />
            <Row label="People" value={String(people.length)} />
            <Row label="Sum insured" value={siLabel || '—'} />
            <Row label="Portability" value={portability ? 'Requested' : 'No'} />
          </View>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        {step < 3 ? (
          <Pressable style={[styles.cta, shadow.button]} onPress={next}><Icon name="arrow-right" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>Next: {STEPS[step]}</Text></Pressable>
        ) : (
          <Pressable style={[styles.cta, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={generate}><Icon name="zap" size={18} color={colors.onPrimary} /><Text style={styles.ctaText}>{busy ? 'Generating…' : 'Generate quotation'}</Text></Pressable>
        )}
      </View>
    </SafeAreaView>
  );
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
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  progress: { flexDirection: 'row', gap: 4, paddingHorizontal: 16, paddingBottom: 12 },
  seg: { flex: 1, height: 4, borderRadius: 2 },
  segOn: { backgroundColor: colors.navy },
  segOff: { backgroundColor: colors.border },
  body: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  stepLabel: { fontSize: 12, fontFamily: family.semibold, color: colors.muted },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  optTitle: { flex: 1, fontSize: 14, fontFamily: family.bold, color: colors.text },
  optSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  portRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  portOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  portTitle: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  portSub: { fontSize: 11, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  card: { backgroundColor: colors.bg, borderRadius: 18, padding: 16, gap: 12 },
  sumRow: { flexDirection: 'row', gap: 12 },
  sumLabel: { flex: 1, fontSize: 13, fontFamily: family.medium, color: colors.muted },
  sumValue: { flex: 1.3, textAlign: 'right', fontSize: 13, fontFamily: family.bold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
