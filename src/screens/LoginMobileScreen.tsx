import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { api } from '../api/endpoints';
import { ApiError } from '../api/client';
import { normalizeMobile } from '../lib/phone';
import { colors, spacing, radius, family } from '../theme/theme';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginMobile'>;

// M01 · Login — Mobile number
export function LoginMobileScreen({ navigation }: Props) {
  const [digits, setDigits] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !!normalizeMobile(digits) && !loading;

  const onContinue = async () => {
    const mobile = normalizeMobile(digits);
    if (!mobile) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.auth.loginOtp({ mobile });
      navigation.navigate('LoginOtp', {
        mobile,
        maskedMobile: data.maskedMobile,
        codeLength: data.codeLength,
        resendAfterSeconds: data.resendAfterSeconds,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.fieldErrors.mobile || e.message : 'Could not send the code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Badge size={64} />
          <Text style={styles.title}>Log in</Text>
          <Text style={styles.subtitle}>We’ll send a 6-digit code by SMS. No password needed.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Mobile number *</Text>
            <View style={[styles.inputWrap, error ? styles.inputErr : null]}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                value={digits}
                onChangeText={(t) => {
                  setDigits(t.replace(/[^\d]/g, '').slice(0, 10));
                  if (error) setError(null);
                }}
                placeholder="98450 12345"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
                autoFocus
                maxLength={10}
                returnKeyType="go"
                onSubmitEditing={() => canSubmit && onContinue()}
                style={styles.input}
                selectionColor={colors.blue}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <Button label="Send OTP" icon="send" onPress={onContinue} loading={loading} disabled={!canSubmit} />

          <View style={styles.newRow}>
            <Text style={styles.newText}>New here?</Text>
            <Pressable hitSlop={6} onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.newLink}>Start free trial</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: spacing.xxl, paddingTop: spacing.xxl * 1.5, gap: spacing.xl },
  title: { fontSize: 32, fontFamily: family.bold, color: colors.text, letterSpacing: -0.64 },
  subtitle: { fontSize: 15, fontFamily: family.medium, color: colors.muted, lineHeight: 22, marginTop: -spacing.md },
  field: { gap: spacing.md },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.blue,
    borderRadius: radius.input,
    paddingHorizontal: spacing.xl,
    height: 50,
  },
  inputErr: { borderColor: colors.red },
  prefix: { fontSize: 14, fontFamily: family.medium, color: colors.muted },
  input: { flex: 1, fontSize: 14, fontFamily: family.medium, color: colors.text, letterSpacing: 1 },
  errorText: { color: colors.red, fontSize: 13, fontFamily: family.medium },
  newRow: { flexDirection: 'row', gap: spacing.sm, marginTop: -spacing.xs },
  newText: { fontSize: 14, fontFamily: family.medium, color: colors.muted },
  newLink: { fontSize: 14, fontFamily: family.bold, color: colors.blue },
});
