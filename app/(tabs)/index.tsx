import { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing } from '@/src/config/theme';
import { CATEGORIES } from '@/src/config/categories';
import { CategoryConfig, UserCategory } from '@/src/types';
import ChildSwitcher from '@/src/components/ChildSwitcher';
import { TodaySummary } from '@/src/components/TodaySummary';
import { CategoryCard } from '@/src/components/CategoryCard';
import { SimpleCategoryCard } from '@/src/components/SimpleCategoryCard';
import { MaskingTapeHeader } from '@/src/components/ui';
import { useChildStore } from '@/src/stores/childStore';
import { useChildren } from '@/src/hooks/useChildren';
import { useUserCategories } from '@/src/hooks/useUserCategories';
import { useEntries } from '@/src/hooks/useEntries';

type CategoryItem =
  | { type: 'hardcoded'; data: CategoryConfig }
  | { type: 'user'; data: UserCategory };

export default function HomeScreen() {
  const { activeChildId, loadActiveChild, setActiveChild } = useChildStore();
  const { data: children } = useChildren();
  const { data: userCategories } = useUserCategories();
  const { data: allEntries } = useEntries(activeChildId ?? null);
  const router = useRouter();

  useEffect(() => {
    loadActiveChild();
  }, []);

  useEffect(() => {
    if (!activeChildId && children && children.length > 0) {
      setActiveChild(children[0].id);
    }
  }, [activeChildId, children]);

  const activeChild = children?.find((c) => c.id === activeChildId);

  // Build category list: prefer user categories if any exist, else fall back to hardcoded
  const hasUserCategories = userCategories && userCategories.length > 0;

  const categoryItems: CategoryItem[] = hasUserCategories
    ? userCategories.map((uc) => ({ type: 'user' as const, data: uc }))
    : CATEGORIES.map((c) => ({ type: 'hardcoded' as const, data: c }));

  // Count entries per user category
  const entryCounts: Record<string, number> = {};
  if (allEntries && hasUserCategories) {
    for (const entry of allEntries) {
      if (entry.user_category_id) {
        entryCounts[entry.user_category_id] = (entryCounts[entry.user_category_id] ?? 0) + 1;
      }
    }
  }

  const handlePress = (item: CategoryItem) => {
    const id = item.type === 'user' ? item.data.id : item.data.id;
    router.push(`/log/${id}`);
  };

  const handleLongPress = (item: CategoryItem) => {
    const id = item.type === 'user' ? item.data.id : item.data.id;
    router.push(`/category/${id}`);
  };

  const renderItem = ({ item, index }: { item: CategoryItem; index: number }) => {
    if (item.type === 'user') {
      return (
        <SimpleCategoryCard
          category={item.data}
          entryCount={entryCounts[item.data.id] ?? 0}
          onPress={() => handlePress(item)}
          onLongPress={() => handleLongPress(item)}
        />
      );
    }
    return (
      <CategoryCard
        category={item.data}
        index={index}
        onPress={() => handlePress(item)}
        onLongPress={() => handleLongPress(item)}
      />
    );
  };

  const ListHeader = () => (
    <View>
      <ChildSwitcher />

      {activeChild ? (
        <>
          <TodaySummary child={activeChild} />
          <View style={styles.sectionHeader}>
            <MaskingTapeHeader title="Categories" />
            <Text style={styles.hint}>Tap to log  |  Long press to view timeline</Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyContent}>
          <Text style={styles.emoji}>{'\uD83D\uDC4B'}</Text>
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
          data={categoryItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.data.id}
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
  hint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#B0A89A',
    textAlign: 'center',
    marginTop: -spacing.sm,
    marginBottom: spacing.xs,
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
