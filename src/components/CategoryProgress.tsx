import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CATEGORIES } from '../config/categories';
import { colors, fonts, spacing, borderRadius } from '../config/theme';
import { CraftCard } from './ui/CraftCard';
import { useCategoryStats, useSkillProgress } from '../hooks/useProgress';

interface CategoryProgressProps {
  childId: string;
}

interface CategoryRowProps {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  entryCount: number;
  completedMilestones: number;
  totalMilestones: number;
  index: number;
  skillBreakdown: Record<string, number>;
  skills: { id: string; name: string; milestones?: (string | number)[]; items?: string[]; tracking_type: string }[];
}

function CategoryRow({
  categoryName,
  categoryIcon,
  categoryColor,
  entryCount,
  completedMilestones,
  totalMilestones,
  index,
  skillBreakdown,
  skills,
}: CategoryRowProps) {
  const progress = totalMilestones > 0 ? completedMilestones / totalMilestones : 0;
  const progressPercent = Math.round(progress * 100);

  const handlePress = () => {
    const lines = skills.map((skill) => {
      const milestoneCount = skill.milestones?.length ?? skill.items?.length ?? 0;
      const completed = skillBreakdown[skill.id] ?? 0;

      if (skill.tracking_type === 'activity_log' || skill.tracking_type === 'observation_log' || skill.tracking_type === 'topic_log') {
        return `  ${skill.name}: activity log`;
      }
      if (milestoneCount > 0) {
        return `  ${skill.name}: ${completed}/${milestoneCount}`;
      }
      return `  ${skill.name}: in progress`;
    });

    Alert.alert(
      `${categoryIcon} ${categoryName}`,
      `${entryCount} entries logged\n\nSkill Breakdown:\n${lines.join('\n')}`
    );
  };

  return (
    <CraftCard
      color={`${categoryColor}80`}
      index={index + 10}
      onPress={handlePress}
      style={styles.rowCard}
    >
      <View style={styles.row}>
        {/* Left: icon + name */}
        <View style={styles.leftSection}>
          <Text style={styles.categoryIcon}>{categoryIcon}</Text>
          <Text style={styles.categoryName} numberOfLines={1}>
            {categoryName}
          </Text>
        </View>

        {/* Middle: progress bar */}
        <View style={styles.barSection}>
          <View style={styles.barBackground}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.max(progressPercent, 2)}%` as any,
                  backgroundColor: categoryColor === '#fcefc2' ? colors.craftYellow : categoryColor,
                },
              ]}
            />
          </View>
          <Text style={styles.percentLabel}>
            {totalMilestones > 0 ? `${progressPercent}%` : '--'}
          </Text>
        </View>

        {/* Right: entry count */}
        <Text style={styles.entryCount}>
          {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
        </Text>
      </View>
    </CraftCard>
  );
}

export function CategoryProgress({ childId }: CategoryProgressProps) {
  const { data: categoryCounts } = useCategoryStats(childId);
  // Fetch all skill progress at once (passing empty string to get all milestones)
  const { data: skillProgress } = useSkillProgress(childId, '');

  return (
    <View style={styles.container}>
      {CATEGORIES.map((category, index) => {
        const entryCount = categoryCounts?.[category.id] ?? 0;

        // Calculate total milestones for this category
        let totalMilestones = 0;
        category.skills.forEach((skill) => {
          const count = skill.milestones?.length ?? skill.items?.length ?? 0;
          totalMilestones += count;
        });

        // Calculate completed milestones for this category
        let completedMilestones = 0;
        category.skills.forEach((skill) => {
          completedMilestones += skillProgress?.[skill.id] ?? 0;
        });

        return (
          <CategoryRow
            key={category.id}
            categoryId={category.id}
            categoryName={category.name}
            categoryIcon={category.icon}
            categoryColor={category.color}
            entryCount={entryCount}
            completedMilestones={completedMilestones}
            totalMilestones={totalMilestones}
            index={index}
            skillBreakdown={skillProgress ?? {}}
            skills={category.skills}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },
  rowCard: {
    marginVertical: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 110,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  categoryName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.pencilGray,
    flex: 1,
  },
  barSection: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  barBackground: {
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  barFill: {
    height: '100%',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 4,
    minWidth: 3,
  },
  percentLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.pencilGray,
    marginTop: 2,
    textAlign: 'center',
  },
  entryCount: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.pencilGray,
    width: 60,
    textAlign: 'right',
  },
});
