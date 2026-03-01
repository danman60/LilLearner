import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, borderRadius, shadows } from '@/src/config/theme';
import { useBulkAddUserCategories } from '@/src/hooks/useUserCategories';

interface SuggestedCategory {
  name: string;
  icon: string;
  category_type: 'lesson' | 'journal' | 'book';
  color: string;
}

const SUGGESTED: SuggestedCategory[] = [
  { name: 'Reading Lessons', icon: '\uD83D\uDCD6', category_type: 'lesson', color: '#5B9BD5' },
  { name: 'Math Lessons', icon: '\uD83D\uDCCA', category_type: 'lesson', color: '#F2994A' },
  { name: 'Language Arts', icon: '\u270D\uFE0F', category_type: 'lesson', color: '#9B72CF' },
  { name: 'Printing', icon: '\u2712\uFE0F', category_type: 'lesson', color: '#E85D5D' },
  { name: 'Read Alouds', icon: '\uD83D\uDCDA', category_type: 'book', color: '#6BBF6B' },
  { name: 'Time Outside', icon: '\uD83C\uDF33', category_type: 'journal', color: '#6BBF6B' },
  { name: 'Field Trips', icon: '\uD83D\uDE8C', category_type: 'journal', color: '#F2C94C' },
  { name: 'Extras', icon: '\u2B50', category_type: 'journal', color: '#FFB5B5' },
];

export default function OnboardingCategoriesScreen() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customName, setCustomName] = useState('');
  const [customs, setCustoms] = useState<SuggestedCategory[]>([]);
  const bulkAdd = useBulkAddUserCategories();
  const router = useRouter();

  const toggle = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setSelected(next);
  };

  const addCustom = () => {
    const name = customName.trim();
    if (!name) return;
    if ([...SUGGESTED, ...customs].some((c) => c.name === name)) {
      Alert.alert('Already exists');
      return;
    }
    setCustoms([...customs, { name, icon: '\uD83D\uDCDD', category_type: 'lesson', color: '#5B9BD5' }]);
    setSelected(new Set([...selected, name]));
    setCustomName('');
  };

  const handleNext = async () => {
    if (selected.size === 0) {
      Alert.alert('Select at least one category');
      return;
    }

    const allCats = [...SUGGESTED, ...customs];
    const toInsert = allCats
      .filter((c) => selected.has(c.name))
      .map((c, i) => ({
        name: c.name,
        icon: c.icon,
        color: c.color,
        category_type: c.category_type,
        sort_order: i,
      }));

    try {
      await bulkAdd.mutateAsync(toInsert);
      router.push('/onboarding/preferences');
    } catch {
      Alert.alert('Error', 'Could not save categories. Please try again.');
    }
  };

  const allCats = [...SUGGESTED, ...customs];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What do you want to track?</Text>
        <Text style={styles.subtitle}>
          Select the subjects you teach. You can always add more later.
        </Text>

        <View style={styles.chipContainer}>
          {allCats.map((cat) => {
            const isSelected = selected.has(cat.name);
            return (
              <Pressable
                key={cat.name}
                onPress={() => toggle(cat.name)}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                  isSelected && { borderColor: cat.color },
                ]}
              >
                <Text style={styles.chipIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Add custom */}
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="Add your own..."
            placeholderTextColor="#B0A89A"
            value={customName}
            onChangeText={setCustomName}
            onSubmitEditing={addCustom}
            returnKeyType="done"
          />
          <Pressable onPress={addCustom} style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Next button */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleNext}
          style={[styles.nextButton, bulkAdd.isPending && styles.nextButtonDisabled]}
          disabled={bulkAdd.isPending}
        >
          <Text style={styles.nextButtonText}>
            {bulkAdd.isPending ? 'Saving...' : 'Next'}
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
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 28,
    color: '#333333',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: '#8B7E6A',
    marginBottom: spacing.xl,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.xl,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: '#E8F4FD',
  },
  chipIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  chipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: '#666666',
  },
  chipTextSelected: {
    color: '#333333',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  addInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5B9BD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 24,
    color: '#FFFFFF',
    marginTop: -2,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  nextButton: {
    backgroundColor: '#333333',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
});
