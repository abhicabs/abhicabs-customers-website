import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { Dropdown } from '../components/form';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerSummary, CustomerDetail } from '../api/types';

type R = RouteProp<AppStackParamList, 'BestFit'>;
const siOptions = [
  { label: '₹5 lakh', value: 500000 }, { label: '₹10 lakh', value: 1000000 }, { label: '₹15 lakh', value: 1500000 },
  { label: '₹25 lakh', value: 2500000 }, { label: '₹50 lakh', value: 5000000 }, { label: '₹1 crore', value: 10000000 },
];
const MUSTS = ['No room-rent limit', 'Maternity cover', 'OPD cover'];

export function BestFitScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [types, setTypes] = useState<{ typeId: string; name: string }[]>([]);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const customerIdRef = useRef<string | null>(params?.customerId ?? null);
  const [customerLabel, setCustomerLabel] = useState(params?.customerName ?? '');
  const [typeId, setTypeId] = useState<string | null>(null);
  const [typeName, setTypeName] = useState('');
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [people, setPeople] = useState<string[]>([]);
  const [siLabel, setSiLabel] = useState('');
  const [sumInsured, setSumInsured] = useState<number | null>(null);
  const [budget, setBudget] = useState('');
  const [musts, setMusts] = useState<string[]>(['No room-rent limit']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idem = useRef(newIdempotencyKey());

  useEffect(() => {
    api.customers.list({ status: 'ACTIVE', limit: 100 }).then((r) => setCustomers(r.data)).catch(() => undefined);
    api.dashboard.catalogueSummary().then((r) => setTypes(r.data.types)).catch(() => undefined);
    if (customerIdRef.current) fetchCustomer(customerIdRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCustomer = async (id: string) => {
    try { const { data } = await api.customers.get(id); setCustomer(data); setPeople([`C:${data.id}`]); } catch { /* */ }
  };

  const peopleRows = customer
    ? [{ key: `C:${customer.id}`, name: customer.name, sub: 'Self' }, ...(customer.family ?? []).map((m) => ({ key: `F:${m.id}`, name: m.name, sub: m.relationship }))]
    : [];
  const peopleSummary = peopleRows.filter((p) => people.includes(p.key)).map((p) => p.name.split(' ')[0]).join(', ') || 'Choose people';
  const togglePerson = (k: string) => setPeople((ps) => (ps.includes(k) ? ps.filter((x) => x !== k) : [...ps, k]));
  const toggleMust = (m: string) => setMusts((xs) => (xs.includes(m) ? xs.filter((x) => x !== m) : [...xs, m]));

  const find = async () => {
    const cid = customerIdRef.current;
    if (!cid) { setError('Choose a policy holder.'); return; }
    if (!typeId) { setError('Choose an insurance type.'); return; }
    if (!people.length) { setError('Select at least one person.'); return; }
    if (!sumInsured) { setError('Choose a sum insured.'); return; }
    const b = Number(budget);
    if (!b) { setError('Enter a budget.'); return; }
    setError(null); setSaving(true);
    try {
      const { data } = await api.bestfit.rank(cid, { typeId, people, budget: b, priority: 'BEST_COVERAGE', sumInsured }, { idempotencyKey: idem.current });
      navigation.navigate('BestFitResults', { result: data, customerName: customerLabel.split(' · ')[0], customerId: cid });
    } catch (e) {
      idem.current = newIdempotencyKey();
      setError(e instanceof ApiError ? (Object.values(e.fieldErrors)[0] || e.message) : 'Could not rank products.');
    } finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Best fit</Text>
          <Text style={styles.navSub}>Rank products for a customer</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label="Policy holder">
            <Dropdown value={customerLabel} placeholder="Choose policy holder"
              options={customers.map((c) => ({ label: `${c.name} · ${c.number}`, id: c.id }))}
              onSelect={(o: any) => { customerIdRef.current = o.id; setCustomerLabel(o.label); fetchCustomer(o.id); }} />
          </Field>

          <View style={styles.pills}>
            {types.map((t) => {
              const on = t.typeId === typeId;
              return (
                <Pressable key={t.typeId} style={[styles.pill, on ? styles.pillOn : styles.pillOff]} onPress={() => { setTypeId(t.typeId); setTypeName(t.name); }}>
                  <Text style={[styles.pillText, { color: on ? colors.onPrimary : colors.muted3 }]}>{t.name}</Text>
                </Pressable>
              );
            })}
          </View>

          <Field label="People">
            <Pressable style={styles.input} onPress={() => setPeopleOpen((o) => !o)}>
              <Text style={[styles.inputText, !people.length && { color: colors.muted }]} numberOfLines={1}>{peopleSummary}</Text>
              <Icon name={peopleOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
            </Pressable>
            {peopleOpen ? (
              <View style={styles.peopleList}>
                {peopleRows.length ? peopleRows.map((pp) => {
                  const on = people.includes(pp.key);
                  return (
                    <Pressable key={pp.key} style={styles.pRow} onPress={() => togglePerson(pp.key)}>
                      <View style={[styles.check, on && styles.checkOn]}>{on ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
                      <Text style={styles.pName}>{pp.name}</Text>
                      <Text style={styles.pSub}>{pp.sub}</Text>
                    </Pressable>
                  );
                }) : <Text style={styles.muted}>Choose a policy holder first.</Text>}
              </View>
            ) : null}
          </Field>

          <View style={styles.row2}>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={styles.label}>Sum insured</Text>
              <Dropdown value={siLabel} placeholder="Cover" options={siOptions} onSelect={(o: any) => { setSiLabel(o.label); setSumInsured(o.value); }} />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={styles.label}>Budget</Text>
              <View style={styles.input}>
                <Text style={styles.cur}>₹</Text>
                <TextInput value={budget} onChangeText={(t) => setBudget(t.replace(/[^\d]/g, ''))} keyboardType="number-pad" placeholder="20,000" placeholderTextColor={colors.muted} style={styles.budgetField} selectionColor={colors.blue} />
              </View>
            </View>
          </View>

          <Text style={styles.label}>Must have</Text>
          {MUSTS.map((m) => {
            const on = musts.includes(m);
            return (
              <Pressable key={m} style={[styles.mustRow, on && styles.mustRowOn]} onPress={() => toggleMust(m)}>
                <View style={[styles.check, on && styles.checkOn]}>{on ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}</View>
                <Text style={styles.mustText}>{m}</Text>
              </Pressable>
            );
          })}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={[styles.cta, shadow.button, saving && { opacity: 0.6 }]} disabled={saving} onPress={find}>
            <Icon name="zap" size={18} color={colors.onPrimary} />
            <Text style={styles.ctaText}>{saving ? 'Ranking…' : 'Find best fit'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={{ gap: 8 }}><Text style={styles.label}>{label}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex1: { flex: 1 },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  navSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 1 },
  body: { padding: 16, gap: 12, paddingBottom: 24 },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  pillOn: { backgroundColor: colors.navy },
  pillOff: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pillText: { fontSize: 12, fontFamily: family.semibold },
  input: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16 },
  inputText: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  cur: { fontSize: 14, fontFamily: family.semibold, color: colors.muted },
  budgetField: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 },
  peopleList: { backgroundColor: colors.bg, borderRadius: 16, padding: 8, gap: 2 },
  pRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 8 },
  pName: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text },
  pSub: { fontSize: 12, fontFamily: family.medium, color: colors.muted },
  muted: { fontSize: 13, fontFamily: family.medium, color: colors.muted, padding: 8 },
  row2: { flexDirection: 'row', gap: 10 },
  mustRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 14, padding: 12 },
  mustRowOn: { backgroundColor: '#f3f7ff' },
  mustText: { fontSize: 13, fontFamily: family.bold, color: colors.text },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.checkboxBorder, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  footer: { padding: 16, paddingBottom: 30, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  cta: { height: 46, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
});
