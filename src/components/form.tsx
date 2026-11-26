import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from './Icon';
import { colors, radius, family, spacing } from '../theme/theme';

export function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string | null; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function Input({
  value,
  onChangeText,
  placeholder,
  prefix,
  keyboardType,
  error,
  onBlur,
  maxLength,
  autoFocus,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  prefix?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  error?: boolean;
  onBlur?: () => void;
  maxLength?: number;
  autoFocus?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={[styles.input, focus && styles.inputFocus, error && styles.inputErr]}>
      {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoFocus={autoFocus}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setFocus(false);
          onBlur?.();
        }}
        selectionColor={colors.blue}
        style={styles.inputText}
      />
    </View>
  );
}

export function Dropdown<T extends { label: string }>({
  value,
  options,
  placeholder,
  onSelect,
  error,
}: {
  value?: string;
  options: T[];
  placeholder: string;
  onSelect: (opt: T) => void;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable style={[styles.input, error && styles.inputErr]} onPress={() => setOpen(true)}>
        <Text style={[styles.inputText, !value && { color: colors.muted }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Icon name="chevron-down" size={18} color={colors.muted} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <Text style={styles.sheetTitle}>{placeholder}</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {options.map((o) => (
                <Pressable
                  key={o.label}
                  style={styles.option}
                  onPress={() => {
                    onSelect(o);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{o.label}</Text>
                  {value === o.label ? <Icon name="check" size={18} color={colors.blue} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} style={[styles.segmentItem, on && styles.segmentItemOn]} onPress={() => onChange(o.value)}>
            <Text style={[styles.segmentText, { color: on ? colors.onPrimary : colors.muted2 }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.md },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 50,
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: radius.input,
    paddingHorizontal: spacing.xl,
  },
  inputFocus: { borderColor: colors.blue, backgroundColor: colors.surface },
  inputErr: { borderColor: colors.red },
  prefix: { fontSize: 14, fontFamily: family.medium, color: colors.muted },
  inputText: { flex: 1, fontSize: 14, fontFamily: family.medium, color: colors.text, paddingVertical: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.sm },
  sheetTitle: { fontSize: 16, fontFamily: family.bold, color: colors.text, marginBottom: spacing.sm },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionText: { fontSize: 15, fontFamily: family.medium, color: colors.text },
  segment: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.bg, borderRadius: radius.input, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.chip },
  segmentItemOn: { backgroundColor: colors.navy },
  segmentText: { fontSize: 14, fontFamily: family.semibold },
});
