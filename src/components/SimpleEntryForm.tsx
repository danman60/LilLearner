import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '../config/theme';
import { CraftButton } from './ui/CraftButton';
import { useAddEntry } from '../hooks/useEntries';

interface SimpleEntryFormProps {
  categoryId: string;
  childId: string;
  userCategoryId?: string;
}

export function SimpleEntryForm({ categoryId, childId, userCategoryId }: SimpleEntryFormProps) {
  const [lessonNumber, setLessonNumber] = useState('');
  const [notes, setNotes] = useState('');
  const addEntry = useAddEntry();

  const handleLog = () => {
    const parsed = lessonNumber.trim() ? parseInt(lessonNumber, 10) : undefined;
    addEntry.mutate(
      {
        child_id: childId,
        category_id: categoryId,
        skill_id: '_none',
        entry_type: 'activity',
        notes: notes.trim() || undefined,
        lesson_number: parsed && !isNaN(parsed) ? parsed : undefined,
        user_category_id: userCategoryId,
      },
      {
        onSuccess: () => {
          setLessonNumber('');
          setNotes('');
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Lesson #</Text>
      <TextInput
        style={styles.numberInput}
        placeholder="e.g. 58"
        placeholderTextColor="#B0A89A"
        value={lessonNumber}
        onChangeText={setLessonNumber}
        keyboardType="numeric"
        returnKeyType="next"
      />

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="What did you work on?"
        placeholderTextColor="#B0A89A"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <CraftButton
        title={addEntry.isPending ? 'Logging...' : 'Log Entry'}
        onPress={handleLog}
        color={colors.craftGreen}
        size="large"
        disabled={addEntry.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.pencilGray,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  numberInput: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.pencilGray,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(74, 74, 74, 0.15)',
    ...shadows.small,
  },
  notesInput: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.pencilGray,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    minHeight: 80,
    borderWidth: 1,
    borderColor: 'rgba(74, 74, 74, 0.15)',
    marginBottom: spacing.lg,
    ...shadows.small,
  },
});
