import { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing } from '@/src/config/theme';
import { CATEGORIES } from '@/src/config/categories';
import { CategoryConfig } from '@/src/types';
import ChildSwitcher from '@/src/components/ChildSwitcher';
import { TodaySummary } from '@/src/components/TodaySummary';
import { CategoryCard } from '@/src/components/CategoryCard';
import { MaskingTapeHeader } from '@/src/components/ui';
import { useChildStore } from '@/src/stores/childStore';
import { useChildren } from '@/src/hooks/useChildren';

export default function HomeScreen() {
  const { activeChildId, loadActiveChild, setActiveChild } = useChildStore();
  const { data: children } = useChildren();
  const router = useRouter();

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

  const handleCategoryPress = (category: CategoryConfig) => {
    router.push(`/log/${category.id}`);
  };

  const renderCategoryCard = ({ item, index }: { item: CategoryConfig; index: number }) => (
    <CategoryCard
      category={item}
      index={index}
      onPress={() => handleCategoryPress(item)}
    />
  );

  const ListHeader = () => (
    <View>
      <ChildSwitcher />

      {activeChild ? (
        <>
          <TodaySummary child={activeChild} />
          <View style={styles.sectionHeader}>
            <MaskingTapeHeader title="Categories" />
          </View>
        </>
      ) : (
        <View style={styles.emptyContent}>
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>
            Add a child to start tracking their learning journey.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {activeChild ? (
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={<View style={{ height: spacing.xxl }} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
        />
      ) : (
        <ListHeader />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linedPaper,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
  },
  row: {
    paddingHorizontal: spacing.sm,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
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
