import React, { useMemo, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { colors, radius, family } from '../theme/theme';

interface Props {
  length: number; // backend CFG-01 (6)
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  error?: boolean;
  autoFocus?: boolean;
}

// OTP boxes: light-gray fill, number in navy; the active (next-to-fill) box
// gets a blue outline — matches M02.
export function OtpInput({ length, value, onChange, onComplete, error, autoFocus }: Props) {
  const refs = useRef<(TextInput | null)[]>([]);
  const chars = useMemo(() => {
    const arr = value.split('').slice(0, length);
    while (arr.length < length) arr.push('');
    return arr;
  }, [value, length]);
  const activeIndex = Math.min(value.length, length - 1);

  const setAt = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return;
    if (digits.length > 1) {
      const next = (value + digits).replace(/\D/g, '').slice(0, length);
      onChange(next);
      refs.current[Math.min(next.length, length - 1)]?.focus();
      if (next.length === length) onComplete?.(next);
      return;
    }
    const arr = chars.slice();
    arr[index] = digits;
    const next = arr.join('').slice(0, length);
    onChange(next);
    if (index < length - 1) refs.current[index + 1]?.focus();
    if (next.length === length) onComplete?.(next);
  };

  const onKeyPress = (index: number) => (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key !== 'Backspace') return;
    const arr = chars.slice();
    if (arr[index]) {
      arr[index] = '';
      onChange(arr.join(''));
    } else if (index > 0) {
      arr[index - 1] = '';
      onChange(arr.join(''));
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {chars.map((c, i) => {
        const active = i === activeIndex && !error;
        return (
          <TextInput
            key={i}
            ref={(r) => {
              refs.current[i] = r;
            }}
            value={c}
            onChangeText={(t) => setAt(i, t)}
            onKeyPress={onKeyPress(i)}
            keyboardType="number-pad"
            maxLength={length}
            autoFocus={autoFocus && i === 0}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            selectionColor={colors.blue}
            style={[styles.box, c ? styles.filled : null, active ? styles.active : null, error ? styles.err : null]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  box: {
    flex: 1,
    height: 58,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.bg,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: family.bold,
    color: colors.text,
  },
  filled: { backgroundColor: colors.bg },
  active: { borderColor: colors.blue, backgroundColor: colors.surface },
  err: { borderColor: colors.red },
});
