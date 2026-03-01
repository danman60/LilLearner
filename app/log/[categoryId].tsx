import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { getCategoryById } from '@/src/config/categories';
import { useChildStore } from '@/src/stores/childStore';
import { colors, fonts, spacing } from '@/src/config/theme';
import { MaskingTapeHeader, CraftButton, ScissorDivider } from '@/src/components/ui';
import { ActivityLogEntry } from '@/src/components/entry/ActivityLogEntry';
import { CounterEntry } from '@/src/components/entry/CounterEntry';
import { MilestoneEntry } from '@/src/components/entry/MilestoneEntry';
import { PhotoEntry } from '@/src/components/entry/PhotoEntry';
import { SimpleEntryForm } from '@/src/components/SimpleEntryForm';
import { ActiveBooksList } from '@/src/components/ActiveBooksList';
import { useAddEntry } from '@/src/hooks/useEntries';
import { useUserCategories } from '@/src/hooks/useUserCategories';
import { SkillConfig, TrackingType } from '@/src/types';
import { FEATURES } from '@/src/config/features';

function SkillEntry({
  skill,
  categoryId,
  categoryColor,
  childId,
}: {
  skill: SkillConfig;
  categoryId: string;
  categoryColor: string;
  childId: string;
}) {
  const activityTypes: TrackingType[] = ['activity_log', 'observation_log', 'topic_log'];
  const counterTypes: TrackingType[] = ['count', 'numeric', 'cumulative'];
  const milestoneTypes: TrackingType[] = ['mastery', 'progress', 'checklist'];

  if (activityTypes.includes(skill.tracking_type)) {
    return (
      <ActivityLogEntry
        skill={skill}
        categoryId={categoryId}
        categoryColor={categoryColor}
        childId={childId}
      />
    );
  }

  if (counterTypes.includes(skill.tracking_type)) {
    return (
      <CounterEntry
        skill={skill}
        categoryId={categoryId}
        categoryColor={categoryColor}
        childId={childId}
      />
    );
  }

  if (milestoneTypes.includes(skill.tracking_type)) {
    return (
      <MilestoneEntry
        skill={skill}
        categoryId={categoryId}
        categoryColor={categoryColor}
        childId={childId}
      />
    );
  }

  return (
    <ActivityLogEntry
      skill={skill}
      categoryId={categoryId}
      categoryColor={categoryColor}
      childId={childId}
    />
  );
}

// Check if an ID is a UUID (user category) vs a hardcoded string ID
function isUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export default function CategoryLogScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const activeChildId = useChildStore((s) => s.activeChildId);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  const addEntry = useAddEntry();

  const { data: userCategories } = useUserCategories();
  const isUserCategory = isUUID(categoryId ?? '');
  const userCategory = isUserCategory
    ? userCategories?.find((c) => c.id === categoryId)
    : null;
  const category = isUserCategory ? null : getCategoryById(categoryId ?? '');

  // User category — show ActiveBooksList for book categories, then SimpleEntryForm
  if (isUserCategory && activeChildId) {
    const title = userCategory
      ? `${userCategory.icon || ''} ${userCategory.name}`.trim()
      : 'Log Entry';
    const isBookCategory = userCategory?.category_type === 'book';

    return (
      <>
        <Stack.Screen options={{ headerTitle: title }} />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {isBookCategory && (
            <ActiveBooksList
              childId={activeChildId}
              categoryId={categoryId ?? ''}
            />
          )}
          <SimpleEntryForm
            categoryId={categoryId ?? ''}
            childId={activeChildId}
            userCategoryId={categoryId}
          />
        </ScrollView>
      </>
    );
  }

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Category not found</Text>
      </View>
    );
  }

  if (!activeChildId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Please select a child first</Text>
      </View>
    );
  }

  // When skills tracking is off, show simple entry form instead
  if (!FEATURES.SKILLS_TRACKING) {
    return (
      <>
        <Stack.Screen
          options={{
            headerTitle: `${category.icon} ${category.name}`,
          }}
        />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <MaskingTapeHeader title={`${category.icon} ${category.name}`} />
          <SimpleEntryForm
            categoryId={category.id}
            childId={activeChildId}
          />
        </ScrollView>
      </>
    );
  }

  const handleQuickNote = () => {
    if (!quickNote.trim()) return;
    addEntry.mutate(
      {
        child_id: activeChildId,
        category_id: category.id,
        skill_id: category.skills[0].id,
        entry_type: 'note',
        notes: quickNote.trim(),
      },
      {
        onSuccess: () => {
          setQuickNote('');
          setNoteModalVisible(false);
        },
      }
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `${category.icon} ${category.name}`,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <MaskingTapeHeader title={`${category.icon} ${category.name}`} />

        {/* Skills list */}
        <View style={styles.skillsList}>
          {category.skills.map((skill, index) => (
            <React.Fragment key={skill.id}>
              <SkillEntry
                skill={skill}
                categoryId={category.id}
                categoryColor={category.color}
                childId={activeChildId}
              />
              {index < category.skills.length - 1 && (
                <ScissorDivider />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Bottom actions */}
        <View style={styles.bottomActions}>
          <ScissorDivider />

          {/* Photo capture — only when enabled */}
          {FEATURES.PHOTO_ENTRIES && (
            <View style={styles.actionSection}>
              <Text style={styles.actionLabel}>Add a Photo</Text>
              <PhotoEntry
                categoryId={category.id}
                childId={activeChildId}
                defaultSkillId={category.skills[0].id}
              />
            </View>
          )}

          {/* Quick note */}
          <View style={styles.actionSection}>
            <Text style={styles.actionLabel}>Quick Note</Text>
            <CraftButton
              title="Write a quick note..."
              onPress={() => setNoteModalVisible(true)}
              color={colors.craftOrange}
              size="small"
            />
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Quick note modal */}
      <Modal
        visible={noteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quick Note</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What did you notice today?"
              placeholderTextColor="#B0A89A"
              value={quickNote}
              onChangeText={setQuickNote}
              multiline
              numberOfLines={4}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setQuickNote('');
                  setNoteModalVisible(false);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <CraftButton
                title="Save Note"
                onPress={handleQuickNote}
                color={colors.craftGreen}
                size="small"
                loading={addEntry.isPending}
                disabled={!quickNote.trim()}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linedPaper,
  },
  contentContainer: {
    padding: spacing.md,
  },
  skillsList: {
    gap: spacing.xs,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.linedPaper,
  },
  errorText: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: '#8B7E6A',
  },
  bottomActions: {
    marginTop: spacing.md,
  },
  actionSection: {
    marginTop: spacing.md,
  },
  actionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.pencilGray,
    marginBottom: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.linedPaper,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.pencilGray,
    marginBottom: spacing.md,
  },
  textInput: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.pencilGray,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(74, 74, 74, 0.15)',
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cancelText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: '#8B7E6A',
  },
});
