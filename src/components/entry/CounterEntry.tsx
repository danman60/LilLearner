import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SkillConfig } from '../../types';
import { CraftCard, CraftButton } from '../ui';
import { colors, fonts, spacing } from '../../config/theme';
import { useAddEntry } from '../../hooks/useEntries';
import { useRecentEntries } from '../../hooks/useEntries';

interface CounterEntryProps {
  skill: SkillConfig;
  categoryId: string;
  categoryColor: string;
  childId: string;
}

export function CounterEntry({
  skill,
  categoryId,
  categoryColor,
  childId,
}: CounterEntryProps) {
  const [editing, setEditing] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const addEntry = useAddEntry();
  const { data: recentEntries } = useRecentEntries(childId, skill.id, 1);

  // Get the latest value from recent entries
  const latestValue = recentEntries?.[0]?.value ?? '0';

  const handleIncrement = () => {
    const newValue = String(Number(latestValue) + 1);
    addEntry.mutate({
      child_id: childId,
      category_id: categoryId,
      skill_id: skill.id,
      entry_type: 'counter',
      value: newValue,
    });
  };

  const handleManualSubmit = () => {
    if (!manualValue.trim()) return;
    addEntry.mutate(
      {
        child_id: childId,
        category_id: categoryId,
        skill_id: skill.id,
        entry_type: 'counter',
        value: manualValue.trim(),
      },
      {
        onSuccess: () => {
          setManualValue('');
          setEditing(false);
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

      <View style={styles.counterRow}>
        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.editInput}
              value={manualValue}
              onChangeText={setManualValue}
              keyboardType="numeric"
              placeholder="Value"
              placeholderTextColor="#B0A89A"
              autoFocus
            />
            <CraftButton
              title="Set"
              onPress={handleManualSubmit}
              color={colors.craftGreen}
              size="small"
              disabled={!manualValue.trim()}
            />
            <TouchableOpacity
              onPress={() => setEditing(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>X</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.valueDisplay}>{latestValue}</Text>
            </TouchableOpacity>
            {skill.unit && (
              <Text style={styles.unitLabel}>{skill.unit}</Text>
            )}
            <CraftButton
              title="+1"
              onPress={handleIncrement}
              color={colors.craftGreen}
              size="small"
              loading={addEntry.isPending}
              style={styles.incrementButton}
            />
          </>
        )}
      </View>

      {skill.target && (
        <View style={styles.targetRow}>
          <View style={styles.targetBar}>
            <View
              style={[
                styles.targetFill,
                {
                  width: `${Math.min((Number(latestValue) / skill.target) * 100, 100)}%`,
                  backgroundColor: categoryColor,
                },
              ]}
            />
          </View>
          <Text style={styles.targetText}>
            {latestValue} / {skill.target}
          </Text>
        </View>
      )}
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
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  valueDisplay: {
    fontFamily: fonts.accent,
    fontSize: 32,
    color: colors.pencilGray,
  },
  unitLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
  },
  incrementButton: {
    marginLeft: 'auto',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  editInput: {
    fontFamily: fonts.accent,
    fontSize: 24,
    color: colors.pencilGray,
    borderBottomWidth: 2,
    borderBottomColor: colors.craftBlue,
    paddingVertical: spacing.xs,
    minWidth: 80,
    textAlign: 'center',
  },
  cancelButton: {
    padding: spacing.sm,
  },
  cancelText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: '#8B7E6A',
  },
  targetRow: {
    marginTop: spacing.sm,
  },
  targetBar: {
    height: 6,
    backgroundColor: 'rgba(74, 74, 74, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  targetFill: {
    height: '100%',
    borderRadius: 3,
  },
  targetText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#8B7E6A',
    textAlign: 'right',
    marginTop: 2,
  },
});
