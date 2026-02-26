import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CategoryConfig } from '../types';
import { CraftCard } from './ui';
import { fonts, spacing } from '../config/theme';

interface CategoryCardProps {
  category: CategoryConfig;
  index: number;
  onPress: () => void;
  onLongPress?: () => void;
}

// Alternating large/small pattern: 0=large, 1,2=small, 3=large, 4,5=small, ...
function isLargeCard(index: number): boolean {
  const pos = index % 4;
  return pos === 0 || pos === 3;
}

export function CategoryCard({ category, index, onPress, onLongPress }: CategoryCardProps) {
  const large = isLargeCard(index);

  return (
    <View style={styles.wrapper}>
      <CraftCard
        color={category.color}
        index={index}
        onPress={onPress}
        onLongPress={onLongPress}
        style={large ? styles.cardLarge : styles.cardSmall}
      >
        <Text style={styles.icon}>{category.icon}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {category.name}
        </Text>
        <Text style={styles.skillCount}>
          {category.skills.length} skills
        </Text>
      </CraftCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  cardLarge: {
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardSmall: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 2,
  },
  skillCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#8B7E6A',
    textAlign: 'center',
  },
});
