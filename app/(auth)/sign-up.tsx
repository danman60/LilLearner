import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { colors, fonts, spacing, borderRadius } from '@/src/config/theme';

const LINE_HEIGHT = 32;
const LINE_COLOR = 'rgba(173, 206, 240, 0.3)';

export default function SignUpScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signUp, loading } = useAuthStore();

  const handleSignUp = async () => {
    setError(null);
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const result = await signUp(email.trim(), password, displayName.trim());
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Lined paper background lines */}
        <View style={styles.linesContainer} pointerEvents="none">
          {Array.from({ length: 25 }).map((_, i) => (
            <View
              key={i}
              style={[styles.line, { top: 120 + i * LINE_HEIGHT }]}
            />
          ))}
          {/* Red margin line */}
          <View style={styles.marginLine} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Join the{'\n'}Adventure!</Text>
          <Text style={styles.subtitle}>Create your account</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#B0A89A"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#B0A89A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="min. 6 characters"
              placeholderTextColor="#B0A89A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.linkAction}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linedPaper,
  },
  scrollContent: {
    flexGrow: 1,
  },
  linesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: LINE_COLOR,
  },
  marginLine: {
    position: 'absolute',
    left: 40,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(232, 93, 93, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 42,
    color: colors.pencilGray,
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: '#8B7E6A',
    marginBottom: spacing.xl,
  },
  errorContainer: {
    backgroundColor: 'rgba(232, 93, 93, 0.1)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: colors.craftRed,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.craftRed,
  },
  inputGroup: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: '#8B7E6A',
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.pencilGray,
    borderBottomWidth: 2,
    borderBottomColor: '#C5B9A8',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  button: {
    backgroundColor: colors.craftGreen,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.white,
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  linkText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: '#8B7E6A',
  },
  linkAction: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.craftBlue,
  },
});
