import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useReport } from '@/src/hooks/useReports';
import { useChildren } from '@/src/hooks/useChildren';
import { useChildStore } from '@/src/stores/childStore';
import { CATEGORIES } from '@/src/config/categories';
import { generateNarrative } from '@/src/utils/reportGenerator';
import { generateAndSharePdf } from '@/src/utils/reportPdf';
import { CraftButton, GoldStar, ScissorDivider } from '@/src/components/ui';
import { colors, fonts, spacing, shadows } from '@/src/config/theme';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getTypeBadgeColor(type: string): string {
  switch (type) {
    case 'weekly':
      return colors.craftBlue;
    case 'monthly':
      return colors.craftPurple;
    case 'seasonal':
      return colors.craftGreen;
    default:
      return colors.craftBlue;
  }
}

export default function ReportViewerScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const { data: report, isLoading } = useReport(reportId ?? null);
  const activeChildId = useChildStore((s) => s.activeChildId);
  const { data: children } = useChildren();
  const child = children?.find((c) => c.id === activeChildId);
  const childName = child?.name ?? 'Child';

  const [sharing, setSharing] = React.useState(false);

  if (isLoading || !report) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.craftBlue} />
        <Text style={styles.loadingText}>Loading report...</Text>
      </View>
    );
  }

  const data = report.data_json;
  const typeLabel =
    report.report_type.charAt(0).toUpperCase() +
    report.report_type.slice(1);
  const narrative = generateNarrative(childName, data);

  // Build sorted categories with counts
  const categoriesWithCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: data.entries_by_category[cat.id] ?? 0,
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const maxCatCount = Math.max(
    ...categoriesWithCounts.map((c) => c.count),
    1
  );

  const handleSharePdf = async () => {
    setSharing(true);
    try {
      await generateAndSharePdf(
        childName,
        report.report_type,
        report.period_start,
        report.period_end,
        data
      );
    } catch (err) {
      // Sharing may be cancelled — that's ok
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.childName}>{childName}'s Report</Text>
        <Text style={styles.period}>
          {formatDate(report.period_start)} -{' '}
          {formatDate(report.period_end)}
        </Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: getTypeBadgeColor(report.report_type) },
          ]}
        >
          <Text style={styles.badgeText}>
            {typeLabel}
            {report.season
              ? ` - ${report.season.charAt(0).toUpperCase() + report.season.slice(1)}`
              : ''}
          </Text>
        </View>
      </View>

      <ScissorDivider />

      {/* Stats Overview */}
      <View style={[styles.section, shadows.small]}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{data.total_entries}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{data.xp_earned}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{data.streak_days}</Text>
            <Text style={styles.statLabel}>Active Days</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {data.milestones_reached.length}
            </Text>
            <Text style={styles.statLabel}>Milestones</Text>
          </View>
        </View>
      </View>

      {/* Category Bar Chart */}
      <View style={styles.sectionHeader}>
        <View style={styles.tapeStrip} />
        <Text style={styles.sectionTitle}>Activity by Category</Text>
      </View>
      <View style={[styles.section, shadows.small]}>
        {categoriesWithCounts.length === 0 ? (
          <Text style={styles.emptyText}>No entries this period</Text>
        ) : (
          categoriesWithCounts.map((cat) => {
            const barWidth = (cat.count / maxCatCount) * 100;
            return (
              <View key={cat.id} style={styles.barRow}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.barIcon}>{cat.icon}</Text>
                  <Text style={styles.barName}>{cat.name}</Text>
                  <Text style={styles.barCount}>{cat.count}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: cat.color,
                        width: `${Math.max(barWidth, 5)}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Milestones Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.tapeStrip} />
        <Text style={styles.sectionTitle}>Milestones Reached</Text>
      </View>
      <View style={[styles.section, shadows.small]}>
        {data.milestones_reached.length === 0 ? (
          <Text style={styles.emptyText}>
            No new milestones this period
          </Text>
        ) : (
          data.milestones_reached.map((m, i) => {
            const parts = m.split(':');
            const skillId = parts[0];
            const milestoneKey = parts[1] ?? '';
            return (
              <View key={i} style={styles.milestoneRow}>
                <GoldStar size={20} />
                <Text style={styles.milestoneText}>
                  {skillId.replace(/_/g, ' ')} -{' '}
                  {milestoneKey.replace(/_/g, ' ')}
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* XP Summary */}
      <View style={styles.sectionHeader}>
        <View style={styles.tapeStrip} />
        <Text style={styles.sectionTitle}>XP Summary</Text>
      </View>
      <View style={[styles.xpSection, shadows.small]}>
        <Text style={styles.xpAmount}>{data.xp_earned} XP</Text>
        <Text style={styles.xpSubtext}>earned this period</Text>
      </View>

      {/* Narrative */}
      <View style={styles.sectionHeader}>
        <View style={styles.tapeStrip} />
        <Text style={styles.sectionTitle}>Summary</Text>
      </View>
      <View style={[styles.narrativeSection, shadows.small]}>
        <Text style={styles.narrativeText}>{narrative}</Text>
      </View>

      {/* Export Button */}
      <View style={styles.exportArea}>
        <CraftButton
          title={sharing ? 'Preparing PDF...' : 'Share PDF'}
          onPress={handleSharePdf}
          loading={sharing}
          color={colors.craftGreen}
          size="large"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with love using Little Learner Tracker
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.linedPaper,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.linedPaper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
    marginTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingTop: spacing.md,
  },
  childName: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    color: colors.pencilGray,
    marginBottom: 4,
  },
  period: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.white,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  tapeStrip: {
    height: 3,
    backgroundColor: 'rgba(210, 180, 140, 0.5)',
    borderRadius: 2,
    marginBottom: 4,
    marginHorizontal: -4,
  },
  sectionTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: '#8B7355',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: fonts.accent,
    fontSize: 28,
    color: colors.craftBlue,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#8B7E6A',
    marginTop: -2,
  },
  barRow: {
    marginBottom: 10,
  },
  barLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  barIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  barName: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.pencilGray,
    flex: 1,
  },
  barCount: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: '#8B7E6A',
  },
  barTrack: {
    height: 16,
    backgroundColor: '#F5F0E8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
  },
  milestoneText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.pencilGray,
    flex: 1,
    textTransform: 'capitalize',
  },
  xpSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  xpAmount: {
    fontFamily: fonts.accent,
    fontSize: 42,
    color: colors.craftYellow,
  },
  xpSubtext: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
  },
  narrativeSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(228, 93, 93, 0.3)',
  },
  narrativeText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.pencilGray,
    lineHeight: 24,
  },
  exportArea: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(173, 206, 240, 0.3)',
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#B0A89A',
  },
});
