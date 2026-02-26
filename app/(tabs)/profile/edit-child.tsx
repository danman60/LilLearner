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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, fonts, spacing, borderRadius, shadows } from '@/src/config/theme';
import { useUpdateChild } from '@/src/hooks/useChildren';

export default function EditChildScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    childId: string;
    childName: string;
    childBirthdate: string;
  }>();
  const updateChild = useUpdateChild();

  const [name, setName] = useState(params.childName ?? '');
  const [birthdateText, setBirthdateText] = useState(params.childBirthdate ?? '');
  const [error, setError] = useState('');

  const validateDate = (text: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(text)) return false;
    const date = new Date(text);
    return !isNaN(date.getTime()) && date <= new Date();
  };

  const formatDateInput = (text: string): string => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  };

  const handleDateChange = (text: string) => {
    const formatted = formatDateInput(text);
    setBirthdateText(formatted);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a name for your little learner.');
      return;
    }

    if (!birthdateText) {
      setError('Please enter a birthdate.');
      return;
    }

    if (!validateDate(birthdateText)) {
      setError('Please enter a valid date (YYYY-MM-DD) that is not in the future.');
      return;
    }

    try {
      await updateChild.mutateAsync({
        id: params.childId!,
        name: trimmedName,
        birthdate: birthdateText,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.paper}>
          {/* Lined paper decoration */}
          <View style={styles.redLine} />

          <Text style={styles.header}>Edit Learner</Text>

          <View style={styles.defaultAvatar}>
            <Text style={styles.defaultAvatarText}>
              {(name || '?').charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Name input */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError('');
            }}
            placeholder="e.g. Emma"
            placeholderTextColor="#C0B8A8"
            autoCapitalize="words"
            autoFocus
          />

          {/* Birthdate input */}
          <Text style={styles.label}>Birthdate</Text>
          <TextInput
            style={styles.input}
            value={birthdateText}
            onChangeText={handleDateChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#C0B8A8"
            keyboardType="number-pad"
            maxLength={10}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Save button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              updateChild.isPending && styles.saveButtonDisabled,
            ]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={updateChild.isPending}
          >
            {updateChild.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.6}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.linedPaper,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  paper: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    paddingLeft: spacing.lg + 20,
    ...shadows.medium,
    position: 'relative',
    overflow: 'hidden',
  },
  redLine: {
    position: 'absolute',
    left: 32,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.eraserPink,
    opacity: 0.5,
  },
  header: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.pencilGray,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.craftPurple,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  defaultAvatarText: {
    fontFamily: fonts.bodyBold,
    fontSize: 32,
    color: colors.white,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.pencilGray,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.pencilGray,
    borderBottomWidth: 2,
    borderBottomColor: colors.pencilGray,
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    marginBottom: spacing.md,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.craftRed,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.craftGreen,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.small,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.white,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  cancelText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.craftBlue,
  },
});
