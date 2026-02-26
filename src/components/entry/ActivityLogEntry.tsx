import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SkillConfig } from '../../types';
import { CraftButton, CraftCard } from '../ui';
import { colors, fonts, spacing } from '../../config/theme';
import { useAddEntry } from '../../hooks/useEntries';
import { useRecentEntries } from '../../hooks/useEntries';

interface ActivityLogEntryProps {
  skill: SkillConfig;
  categoryId: string;
  categoryColor: string;
  childId: string;
}

export function ActivityLogEntry({
  skill,
  categoryId,
  categoryColor,
  childId,
}: ActivityLogEntryProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const addEntry = useAddEntry();
  const { data: recentEntries } = useRecentEntries(childId, skill.id, 3);

  const handleSubmit = () => {
    if (!notes.trim()) return;
    addEntry.mutate(
      {
        child_id: childId,
        category_id: categoryId,
        skill_id: skill.id,
        entry_type: notes.length > 20 ? 'note' : 'activity',
        notes: notes.trim(),
      },
      {
        onSuccess: () => {
          setNotes('');
          setModalVisible(false);
        },
      }
    );
  };

  return (
    <CraftCard color={categoryColor + '40'} index={skill.id.length} style={styles.card}>
      <Text style={styles.skillName}>{skill.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {skill.description}
      </Text>

      <CraftButton
        title="Log Activity"
        onPress={() => setModalVisible(true)}
        color={categoryColor}
        textColor={colors.pencilGray}
        size="small"
        style={styles.logButton}
      />

      {/* Recent entries */}
      {recentEntries && recentEntries.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentLabel}>Recent:</Text>
          {recentEntries.map((entry) => (
            <Text key={entry.id} style={styles.recentEntry} numberOfLines={1}>
              {new Date(entry.logged_at).toLocaleDateString()} -{' '}
              {entry.notes || entry.entry_type}
            </Text>
          ))}
        </View>
      )}

      {/* Note input modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log: {skill.name}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What did you observe? Any notes..."
              placeholderTextColor="#B0A89A"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setNotes('');
                  setModalVisible(false);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <CraftButton
                title="Save"
                onPress={handleSubmit}
                color={colors.craftGreen}
                size="small"
                loading={addEntry.isPending}
                disabled={!notes.trim()}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </CraftCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  skillName: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.pencilGray,
    marginBottom: 4,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#8B7E6A',
    marginBottom: spacing.sm,
  },
  logButton: {
    alignSelf: 'flex-start',
  },
  recentSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(74, 74, 74, 0.1)',
  },
  recentLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: '#8B7E6A',
    marginBottom: 4,
  },
  recentEntry: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#8B7E6A',
    marginBottom: 2,
  },
  // Modal styles
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
