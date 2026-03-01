import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '../config/theme';
import { ParsedEntry } from '../types/voice';
import { useBulkAddEntries } from '../hooks/useBulkAddEntries';
import { useChildren } from '../hooks/useChildren';
import { useUserCategories } from '../hooks/useUserCategories';
import { CATEGORIES } from '../config/categories';
import { useChildStore } from '../stores/childStore';

interface VoiceReviewScreenProps {
  entries: ParsedEntry[];
  onDone: () => void;
  onCancel: () => void;
}

export function VoiceReviewScreen({ entries: initialEntries, onDone, onCancel }: VoiceReviewScreenProps) {
  const [entries, setEntries] = useState(initialEntries.map((e, i) => ({ ...e, selected: true, id: i })));
  const bulkAdd = useBulkAddEntries();
  const { data: children } = useChildren();
  const { data: userCategories } = useUserCategories();
  const activeChildId = useChildStore((s) => s.activeChildId);

  const toggleEntry = (id: number) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, selected: !e.selected } : e))
    );
  };

  const updateNotes = (id: number, notes: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, notes } : e))
    );
  };

  const handleSave = async () => {
    const selected = entries.filter((e) => e.selected);
    if (selected.length === 0) {
      Alert.alert('No entries selected');
      return;
    }

    // Resolve child IDs and category IDs
    const resolvedEntries = selected.map((entry) => {
      // Find child by name
      const child = children?.find(
        (c) => c.name.toLowerCase() === entry.childName.toLowerCase()
      );
      const childId = child?.id ?? activeChildId ?? '';

      // Find category by name — try user categories first, then hardcoded
      const userCat = userCategories?.find(
        (c) => c.name.toLowerCase() === entry.categoryName.toLowerCase()
      );
      const hardcodedCat = CATEGORIES.find(
        (c) => c.name.toLowerCase() === entry.categoryName.toLowerCase()
      );

      return {
        child_id: childId,
        category_id: userCat?.id ?? hardcodedCat?.id ?? '_unknown',
        skill_id: '_none',
        entry_type: 'activity' as const,
        notes: entry.notes,
        lesson_number: entry.lessonNumber,
        user_category_id: userCat?.id,
      };
    });

    try {
      await bulkAdd.mutateAsync(resolvedEntries);
      onDone();
    } catch {
      Alert.alert('Error', 'Could not save entries. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Review Entries</Text>
        <Text style={styles.subtitle}>
          {entries.filter((e) => e.selected).length} of {entries.length} selected
        </Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {entries.map((entry) => (
          <Pressable
            key={entry.id}
            onPress={() => toggleEntry(entry.id)}
            style={[styles.entryCard, !entry.selected && styles.entryCardDeselected]}
          >
            <View style={styles.entryHeader}>
              <View style={[styles.checkbox, entry.selected && styles.checkboxChecked]}>
                {entry.selected && <Text style={styles.checkmark}>{'\u2713'}</Text>}
              </View>
              <View style={styles.entryMeta}>
                <Text style={styles.entryChild}>{entry.childName}</Text>
                <Text style={styles.entryCategory}>{entry.categoryName}</Text>
              </View>
              {entry.lessonNumber != null && (
                <View style={styles.lessonBadge}>
                  <Text style={styles.lessonBadgeText}>#{entry.lessonNumber}</Text>
                </View>
              )}
            </View>

            {/* Confidence indicator */}
            {entry.confidence < 0.7 && (
              <Text style={styles.lowConfidence}>Low confidence — please verify</Text>
            )}

            {/* Editable notes */}
            <TextInput
              style={styles.notesInput}
              value={entry.notes ?? ''}
              onChangeText={(text) => updateNotes(entry.id, text)}
              placeholder="Add notes..."
              placeholderTextColor="#B0A89A"
              multiline
              numberOfLines={2}
            />
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          style={[styles.saveButton, bulkAdd.isPending && styles.saveButtonDisabled]}
          disabled={bulkAdd.isPending}
        >
          <Text style={styles.saveButtonText}>
            {bulkAdd.isPending ? 'Saving...' : `Save ${entries.filter((e) => e.selected).length} Entries`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 24,
    color: '#333333',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
    marginTop: 2,
  },
  list: {
    flex: 1,
    padding: spacing.md,
  },
  entryCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  entryCardDeselected: {
    opacity: 0.4,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: '#5B9BD5',
    borderColor: '#5B9BD5',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  entryMeta: {
    flex: 1,
  },
  entryChild: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: '#333333',
  },
  entryCategory: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#8B7E6A',
  },
  lessonBadge: {
    backgroundColor: '#5B9BD5',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  lessonBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  lowConfidence: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.craftOrange,
    marginBottom: spacing.xs,
  },
  notesInput: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#333333',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: spacing.xs,
    minHeight: 36,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  cancelText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: '#8B7E6A',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#333333',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
