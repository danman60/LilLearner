import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { colors, fonts, spacing, borderRadius, shadows } from '@/src/config/theme';
import { getCategoryById } from '@/src/config/categories';
import { useChildStore } from '@/src/stores/childStore';
import { useSkillProgress } from '@/src/hooks/useProgress';
import { MaskingTapeHeader, ScissorDivider } from '@/src/components/ui';
import { EntryTimeline } from '@/src/components/EntryTimeline';
import { FEATURES } from '@/src/config/features';

function SkillMiniBadge({
  name,
  completed,
  total,
  isLogType,
  color,
}: {
  name: string;
  completed: number;
  total: number;
  isLogType: boolean;
  color: string;
}) {
  const progress = total > 0 ? completed / total : 0;
  const isDone = !isLogType && total > 0 && completed >= total;

  return (
    <View
      style={[
        styles.miniBadge,
        { backgroundColor: color },
        isDone && styles.miniBadgeDone,
      ]}
    >
      <Text style={styles.miniBadgeName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.miniBadgeProgress}>
        {isLogType ? `${completed} logged` : `${completed}/${total}`}
      </Text>
      {isDone && <Text style={styles.miniBadgeCheck}>{'\u2705'}</Text>}
    </View>
  );
}

export default function CategoryDeepDiveScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const activeChildId = useChildStore((s) => s.activeChildId);
  const category = getCategoryById(categoryId ?? '');
  const { data: skillProgress } = useSkillProgress(activeChildId, categoryId ?? '');

  if (!category) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: 'Category' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Category not found</Text>
        </View>
      </>
    );
  }

  if (!activeChildId) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: category.name }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please select a child first</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `${category.icon} ${category.name}`,
        }}
      />
      <View style={styles.container}>
        <View style={styles.topSection}>
          <MaskingTapeHeader title={`${category.icon} ${category.name}`} />

          {/* Skill badges — only when skills tracking is on */}
          {FEATURES.SKILLS_TRACKING && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgeScroll}
            >
              {category.skills.map((skill) => {
                const isLogType =
                  skill.tracking_type === 'activity_log' ||
                  skill.tracking_type === 'observation_log' ||
                  skill.tracking_type === 'topic_log';

                const milestoneTotal =
                  skill.milestones?.length ?? skill.items?.length ?? 0;
                const completed = skillProgress?.[skill.id] ?? 0;
                const total = isLogType ? completed : milestoneTotal;

                return (
                  <SkillMiniBadge
                    key={skill.id}
                    name={skill.name}
                    completed={completed}
                    total={total}
                    isLogType={isLogType}
                    color={category.color}
                  />
                );
              })}
            </ScrollView>
          )}

          <ScissorDivider />
        </View>

        {/* Timeline — entry list with lesson numbers */}
        <EntryTimeline
          childId={activeChildId}
          categoryId={category.id}
          categoryColor={category.color}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linedPaper,
  },
  topSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  badgeScroll: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  miniBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    minWidth: 100,
    ...shadows.small,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    position: 'relative',
  },
  miniBadgeDone: {
    borderColor: colors.craftGreen,
    borderWidth: 2,
  },
  miniBadgeName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.pencilGray,
    textAlign: 'center',
  },
  miniBadgeProgress: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#8B7E6A',
    marginTop: 2,
  },
  miniBadgeCheck: {
    position: 'absolute',
    top: -4,
    right: -4,
    fontSize: 12,
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
});
