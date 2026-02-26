import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/src/config/theme';
import ChildSwitcher from '@/src/components/ChildSwitcher';
import { useChildStore } from '@/src/stores/childStore';
import { useChildren } from '@/src/hooks/useChildren';

export default function HomeScreen() {
  const { activeChildId, loadActiveChild, setActiveChild } = useChildStore();
  const { data: children } = useChildren();

  // Load persisted active child on mount
  useEffect(() => {
    loadActiveChild();
  }, []);

  // Auto-select first child if none is active
  useEffect(() => {
    if (!activeChildId && children && children.length > 0) {
      setActiveChild(children[0].id);
    }
  }, [activeChildId, children]);

  const activeChild = children?.find((c) => c.id === activeChildId);

  return (
    <View style={styles.container}>
      <ChildSwitcher />
      <View style={styles.content}>
        {activeChild ? (
          <>
            <Text style={styles.emoji}>🏠</Text>
            <Text style={styles.title}>
              Hi, {activeChild.name}!
            </Text>
            <Text style={styles.subtitle}>
              Your dashboard is coming soon!
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>
              Add a child to start tracking their learning journey.
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linedPaper,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    color: colors.pencilGray,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: '#8B7E6A',
    textAlign: 'center',
  },
});
