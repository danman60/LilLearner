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
import { SimpleCategoryTimeline } from '@/src/components/SimpleCategoryTimeline';
import { useUserCategories } from '@/src/hooks/useUserCategories';
import { useFeature } from '@/src/stores/featureStore';

function isUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

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
  const skillsTracking = useFeature('SKILLS_TRACKING');
  const { data: userCategories } = useUserCategories();

  const isUserCat = isUUID(categoryId ?? '');
  const userCategory = isUserCat
    ? userCategories?.find((c) => c.id === categoryId)
    : null;
  const category = isUserCat ? null : getCategoryById(categoryId ?? '');

  const { data: skillProgress } = useSkillProgress(
    activeChildId,
    !isUserCat ? (categoryId ?? '') : ''
  );

  // User category — show simple timeline
  if (isUserCat) {
    if (!activeChildId) {
      return (
        <>
          <Stack.Screen options={{ headerTitle: 'Category' }} />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Please select a child first</Text>
          </View>
        </>
      );
    }

    const title = userCategory
      ? `${userCategory.icon || ''} ${userCategory.name}`.trim()
      : 'Category';

    return (
      <>
        <Stack.Screen options={{ headerTitle: title }} />
        <View style={styles.container}>
          <View style={styles.topSection}>
            <MaskingTapeHeader title={title} />
            <ScissorDivider />
          </View>
          <SimpleCategoryTimeline
            childId={activeChildId}
            categoryId={categoryId ?? ''}
            totalLessons={userCategory?.total_lessons}
            categoryColor={userCategory?.color}
          />
        </View>
      </>
    );
  }

  // Hardcoded category
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

  // When skills tracking is off, show simple timeline
  if (!skillsTracking) {
    return (
      <>
        <Stack.Screen
          options={{ headerTitle: `${category.icon} ${category.name}` }}
        />
        <View style={styles.container}>
          <View style={styles.topSection}>
            <MaskingTapeHeader title={`${category.icon} ${category.name}`} />
            <ScissorDivider />
          </View>
          <SimpleCategoryTimeline
            childId={activeChildId}
            categoryId={category.id}
          />
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

          <ScissorDivider />
        </View>

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
