import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SkillConfig } from '../../types';
import { CraftCard, GoldStar } from '../ui';
import { colors, fonts, spacing } from '../../config/theme';
import { useMilestones, useToggleMilestone } from '../../hooks/useMilestones';

interface MilestoneEntryProps {
  skill: SkillConfig;
  categoryId: string;
  categoryColor: string;
  childId: string;
}

function formatLabel(key: string | number): string {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function MilestoneEntry({
  skill,
  categoryId,
  categoryColor,
  childId,
}: MilestoneEntryProps) {
  const { data: milestones } = useMilestones(childId, skill.id);
  const toggleMilestone = useToggleMilestone();

  // Get the items list — could be milestones or items depending on tracking_type
  const items = skill.milestones ?? skill.items ?? [];

  const isCompleted = (key: string | number): boolean => {
    return milestones?.some(
      (m) => m.milestone_key === String(key) && m.completed
    ) ?? false;
  };

  const handleToggle = (key: string | number) => {
    const completed = !isCompleted(key);
    toggleMilestone.mutate({
      childId,
      skillId: skill.id,
      milestoneKey: String(key),
      completed,
    });
  };

  const completedCount = items.filter((item) => isCompleted(item)).length;

  return (
    <CraftCard color={categoryColor + '40'} index={skill.id.length} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.skillName}>{skill.name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {skill.description}
          </Text>
        </View>
        <Text style={styles.progressBadge}>
          {completedCount}/{items.length}
        </Text>
      </View>

      <View style={styles.itemList}>
        {items.map((item) => {
          const completed = isCompleted(item);
          return (
            <TouchableOpacity
              key={String(item)}
              style={styles.itemRow}
              onPress={() => handleToggle(item)}
              activeOpacity={0.7}
            >
              <View style={styles.checkbox}>
                {completed ? (
                  <GoldStar size={22} />
                ) : (
                  <View style={styles.emptyCircle} />
                )}
              </View>
              <Text
                style={[
                  styles.itemLabel,
                  completed && styles.itemLabelCompleted,
                ]}
              >
                {formatLabel(item)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </CraftCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
    marginRight: spacing.sm,
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
  },
  progressBadge: {
    fontFamily: fonts.accent,
    fontSize: 14,
    color: colors.craftGreen,
    backgroundColor: 'rgba(107, 191, 107, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  itemList: {
    gap: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  emptyCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(74, 74, 74, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  itemLabel: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.pencilGray,
    flex: 1,
  },
  itemLabelCompleted: {
    color: '#8B7E6A',
    textDecorationLine: 'line-through',
  },
});
