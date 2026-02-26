import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing } from '../config/theme';
import { useChildren } from '../hooks/useChildren';
import { useChildStore } from '../stores/childStore';
import { Child } from '../types';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Rotating pastel background colors for child avatars
const avatarColors = [
  colors.craftRed,
  colors.craftBlue,
  colors.craftGreen,
  colors.craftPurple,
  colors.craftOrange,
];

function ChildAvatar({
  child,
  isActive,
  index,
  onPress,
}: {
  child: Child;
  isActive: boolean;
  index: number;
  onPress: () => void;
}) {
  const bgColor = avatarColors[index % avatarColors.length];

  return (
    <TouchableOpacity
      style={[styles.avatarContainer, { opacity: isActive ? 1 : 0.6 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.avatarCircle,
          {
            backgroundColor: bgColor,
            borderColor: isActive ? colors.craftYellow : colors.pencilGray,
            borderWidth: isActive ? 3 : 2,
          },
        ]}
      >
        <Text style={styles.avatarText}>{getInitials(child.name)}</Text>
        {isActive && (
          <View style={styles.starBadge}>
            <Text style={styles.starEmoji}>⭐</Text>
          </View>
        )}
      </View>
      <Text style={[styles.childName]} numberOfLines={1}>
        {child.name}
      </Text>
    </TouchableOpacity>
  );
}

function AddChildButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.avatarContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.addCircle}>
        <Text style={styles.addPlus}>+</Text>
      </View>
      <Text style={styles.childName}>Add</Text>
    </TouchableOpacity>
  );
}

export default function ChildSwitcher() {
  const { data: children, isLoading } = useChildren();
  const activeChildId = useChildStore((s) => s.activeChildId);
  const setActiveChild = useChildStore((s) => s.setActiveChild);
  const router = useRouter();

  const handleAddChild = () => {
    router.push('/(tabs)/profile/add-child');
  };

  if (isLoading) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // No children yet — show friendly onboarding prompt
  if (!children || children.length === 0) {
    return (
      <View style={styles.emptyWrapper}>
        <TouchableOpacity
          style={styles.emptyAddButton}
          onPress={handleAddChild}
          activeOpacity={0.7}
        >
          <Text style={styles.emptyAddPlus}>+</Text>
        </TouchableOpacity>
        <Text style={styles.emptyTitle}>Add your first little learner!</Text>
        <Text style={styles.emptySubtitle}>
          Tap the button above to get started
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {children.map((child, index) => (
          <ChildAvatar
            key={child.id}
            child={child}
            isActive={child.id === activeChildId}
            index={index}
            onPress={() => setActiveChild(child.id)}
          />
        ))}
        <AddChildButton onPress={handleAddChild} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.linedPaper,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(173, 206, 240, 0.3)',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    width: 68,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.white,
  },
  starBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starEmoji: {
    fontSize: 14,
  },
  childName: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.pencilGray,
    marginTop: 4,
    textAlign: 'center',
  },
  addCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.craftBlue,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(91, 155, 213, 0.08)',
  },
  addPlus: {
    fontFamily: fonts.bodyBold,
    fontSize: 24,
    color: colors.craftBlue,
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  // Empty state styles
  emptyWrapper: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.linedPaper,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(173, 206, 240, 0.3)',
  },
  emptyAddButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.craftBlue,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(91, 155, 213, 0.08)',
    marginBottom: spacing.sm,
  },
  emptyAddPlus: {
    fontFamily: fonts.bodyBold,
    fontSize: 36,
    color: colors.craftBlue,
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.pencilGray,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
  },
});
