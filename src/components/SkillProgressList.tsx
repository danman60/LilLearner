import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../config/theme';
import { CategoryConfig } from '../types';
import { useSkillProgress } from '../hooks/useProgress';
import { useCategoryStats } from '../hooks/useProgress';

interface SkillProgressListProps {
  childId: string;
  category: CategoryConfig;
}

interface SkillRowProps {
  skillName: string;
  completed: number;
  total: number;
  isLogType: boolean;
  categoryColor: string;
}

function SkillRow({ skillName, completed, total, isLogType, categoryColor }: SkillRowProps) {
  const progress = total > 0 ? completed / total : 0;
  const barColor = categoryColor === '#fcefc2' ? colors.craftYellow : categoryColor;

  return (
    <View style={styles.skillRow}>
      <Text style={styles.skillName} numberOfLines={1}>
        {skillName}
      </Text>

      {isLogType ? (
        <View style={styles.logInfo}>
          <Text style={styles.logCount}>{completed} logged</Text>
        </View>
      ) : (
        <View style={styles.milestoneSection}>
          <View style={styles.barBackground}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.max(Math.round(progress * 100), total > 0 ? 3 : 0)}%` as any,
                  backgroundColor: barColor,
                },
              ]}
            />
          </View>
          <View style={styles.checkmarkRow}>
            <Text style={styles.milestoneCount}>
              {completed}/{total}
            </Text>
            {completed > 0 && <Text style={styles.checkmark}>{'\u2705'}</Text>}
          </View>
        </View>
      )}
    </View>
  );
}

export function SkillProgressList({ childId, category }: SkillProgressListProps) {
  const { data: skillProgress } = useSkillProgress(childId, category.id);
  const { data: categoryCounts } = useCategoryStats(childId);

  return (
    <View style={styles.container}>
      {category.skills.map((skill) => {
        const isLogType =
          skill.tracking_type === 'activity_log' ||
          skill.tracking_type === 'observation_log' ||
          skill.tracking_type === 'topic_log';

        const milestoneTotal = skill.milestones?.length ?? skill.items?.length ?? 0;
        const completed = isLogType
          ? (categoryCounts?.[category.id] ?? 0)
          : (skillProgress?.[skill.id] ?? 0);
        const total = isLogType ? completed : milestoneTotal;

        return (
          <SkillRow
            key={skill.id}
            skillName={skill.name}
            completed={completed}
            total={total}
            isLogType={isLogType}
            categoryColor={category.color}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  skillName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.pencilGray,
    width: 140,
  },
  milestoneSection: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  barBackground: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 3,
    minWidth: 2,
  },
  checkmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  milestoneCount: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.pencilGray,
  },
  checkmark: {
    fontSize: 10,
  },
  logInfo: {
    flex: 1,
    marginLeft: spacing.sm,
    alignItems: 'flex-start',
  },
  logCount: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.pencilGray,
    fontStyle: 'italic',
  },
});
