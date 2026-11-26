import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from './Icon';
import { colors, family } from '../theme/theme';

let DTP: any = null;
try { DTP = require('@react-native-community/datetimepicker').default; } catch { DTP = null; }

const pad = (n: number) => String(n).padStart(2, '0');
const fromDate = (d: Date) => `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
const toDate = (s: string) => { const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : new Date(1990, 0, 1); };

export function DateField({ value, onChange, placeholder = 'DD-MM-YYYY' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  if (!DTP) {
    return (
      <View style={styles.field}>
        <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.muted} keyboardType="numbers-and-punctuation" style={styles.text} selectionColor={colors.blue} />
        <Icon name="calendar" size={18} color={colors.muted} />
      </View>
    );
  }
  return (
    <>
      <Pressable style={styles.field} onPress={() => setShow(true)}>
        <Text style={[styles.text, !value && { color: colors.muted }]}>{value || placeholder}</Text>
        <Icon name="calendar" size={18} color={colors.muted} />
      </Pressable>
      {show ? (
        <DTP
          value={value ? toDate(value) : new Date(1990, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(_e: any, d?: Date) => { setShow(Platform.OS === 'ios'); if (d) onChange(fromDate(d)); if (Platform.OS !== 'ios') setShow(false); }}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 50, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16 },
  text: { flex: 1, fontSize: 14, fontFamily: family.semibold, color: colors.text, padding: 0 },
});
