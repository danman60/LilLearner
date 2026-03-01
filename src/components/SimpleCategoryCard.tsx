import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '../config/theme';
import { UserCategory } from '../types';

interface SimpleCategoryCardProps {
  category: UserCategory;
  entryCount?: number;
  onPress: () => void;
  onLongPress?: () => void;
}

export function SimpleCategoryCard({ category, entryCount, onPress, onLongPress }: SimpleCategoryCardProps) {
  const progressText = category.total_lessons
    ? `${entryCount ?? 0} / ${category.total_lessons}`
    : `${entryCount ?? 0} logged`;

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.wrapper}>
      <View style={[styles.card, { borderLeftColor: category.color }]}>
        <Text style={styles.icon}>{category.icon || '\uD83D\uDCDA'}</Text>
        <Text style={styles.name} numberOfLines={1}>{category.name}</Text>
        <Text style={styles.progress}>{progressText}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    maxWidth: '50%',
    padding: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderLeftWidth: 4,
    ...shadows.small,
  },
  icon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  progress: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#8B7E6A',
  },
});
