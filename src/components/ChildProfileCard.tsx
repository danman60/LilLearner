import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, borderRadius, shadows } from '@/src/config/theme';
import { Child } from '@/src/types';
import { useDeleteChild } from '@/src/hooks/useChildren';
import { useChildLevel } from '@/src/hooks/useProgress';
import { useEntries } from '@/src/hooks/useEntries';
import { getLevelTitle } from '@/src/config/xp';
import { XpBadge } from '@/src/components/ui/XpBadge';

// Rotating pastel background colors for child avatars
const avatarColors = [
  colors.craftRed,
  colors.craftBlue,
  colors.craftGreen,
  colors.craftPurple,
  colors.craftOrange,
];

function calculateAge(birthdate: string): number {
  return Math.floor(
    (Date.now() - new Date(birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
}

interface ChildProfileCardProps {
  child: Child;
  index: number;
}

export function ChildProfileCard({ child, index }: ChildProfileCardProps) {
  const router = useRouter();
  const deleteChild = useDeleteChild();
  const { data: levelData } = useChildLevel(child.id);
  const { data: entries } = useEntries(child.id);

  const age = calculateAge(child.birthdate);
  const level = levelData?.current_level ?? 1;
  const title = getLevelTitle(level);
  const entryCount = entries?.length ?? 0;
  const bgColor = avatarColors[index % avatarColors.length];
  const initial = child.name.charAt(0).toUpperCase();

  const handleDelete = () => {
    Alert.alert(
      'Remove Learner',
      `Are you sure you want to remove ${child.name}? This will delete all their entries and progress. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteChild.mutate(child.id),
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push({
      pathname: '/(tabs)/profile/edit-child',
      params: { childId: child.id, childName: child.name, childBirthdate: child.birthdate },
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleEdit}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: bgColor }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {child.name}
          </Text>
          <Text style={styles.age}>
            {age} year{age !== 1 ? 's' : ''} old
          </Text>
          <Text style={styles.stats}>
            {entryCount} entr{entryCount !== 1 ? 'ies' : 'y'} logged
          </Text>
        </View>

        {/* Level badge */}
        <View style={styles.badgeContainer}>
          <XpBadge level={level} size="small" />
          <Text style={styles.levelTitle}>{title}</Text>
        </View>
      </View>

      {/* Bottom action row */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.pencilGray,
  },
  avatarText: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: colors.white,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.pencilGray,
  },
  age: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#8B7E6A',
    marginTop: 1,
  },
  stats: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.craftBlue,
    marginTop: 2,
  },
  badgeContainer: {
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  levelTitle: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#8B7E6A',
    marginTop: 2,
    textAlign: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(173, 206, 240, 0.3)',
    gap: spacing.md,
  },
  editBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(91, 155, 213, 0.12)',
    borderRadius: borderRadius.sm,
  },
  editBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.craftBlue,
  },
  deleteBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(232, 93, 93, 0.1)',
    borderRadius: borderRadius.sm,
  },
  deleteBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.craftRed,
  },
});
