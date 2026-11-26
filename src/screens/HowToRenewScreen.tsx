import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'HowToRenew'>;
const CHOICES = [
  { key: 'SAME', title: 'Renew the same policy', desc: 'Same product and people. Type the renewal premium.' },
  { key: 'NEW', title: 'New quotation', desc: 'Change product, insurer or people.' },
  { key: 'COMPARE', title: 'Compare options', desc: '2–3 options side by side.' },
];

export function HowToRenewScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [sel, setSel] = useState('SAME');
  const close = () => navigation.goBack();

  const onContinue = () => {
    close();
    setTimeout(() => {
      if (sel === 'SAME' && params?.id) navigation.navigate('RenewalSameQuote', { id: params.id, name: params.subtitle });
      else if (sel === 'COMPARE') navigation.navigate('ComparisonBuilder');
      else if (params?.id) navigation.navigate('RenewalNewQuote', { id: params.id }); else navigation.navigate('QuoteBuilder');
    }, 50);
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>How do you want to renew?</Text>
            {params?.subtitle ? <Text style={styles.sub}>{params.subtitle}</Text> : null}
          </View>
          <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
        </View>

        {CHOICES.map((c) => {
          const on = c.key === sel;
          return (
            <Pressable key={c.key} style={[styles.choice, on && styles.choiceOn]} onPress={() => setSel(c.key)}>
              <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.choiceTitle}>{c.title}</Text>
                <Text style={styles.choiceDesc}>{c.desc}</Text>
              </View>
            </Pressable>
          );
        })}

        <Pressable style={[styles.continue, shadow.button]} onPress={onContinue}>
          <Icon name="arrow-right" size={18} color={colors.onPrimary} />
          <Text style={styles.continueText}>Continue</Text>
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
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: 'transparent', backgroundColor: colors.bg },
  choiceOn: { backgroundColor: '#f3f7ff', borderColor: colors.blue },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c3ccd8', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  choiceTitle: { fontSize: 14, fontFamily: family.bold, color: colors.text },
  choiceDesc: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  continue: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  continueText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
