import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChildStore } from '@/src/stores/childStore';
import { useChildren } from '@/src/hooks/useChildren';
import { useReports, useGenerateReport } from '@/src/hooks/useReports';
import { CraftButton, CraftCard, MaskingTapeHeader, ScissorDivider } from '@/src/components/ui';
import { CategoryPieChart, ActivityHeatmap, TrendChart } from '@/src/components/analytics';
import {
  getWeekRange,
  getMonthRange,
  getSeasonRange,
  SEASONS,
} from '@/src/utils/reportGenerator';
import { colors, fonts, spacing, shadows } from '@/src/config/theme';
import { Report, Season } from '@/src/types';

type TabMode = 'reports' | 'analytics';

interface ReportOption {
  label: string;
  type: 'weekly' | 'monthly' | 'seasonal';
  season?: Season;
}

const REPORT_OPTIONS: ReportOption[] = [
  { label: 'This Week', type: 'weekly' },
  { label: 'This Month', type: 'monthly' },
  { label: 'Spring', type: 'seasonal', season: 'spring' },
  { label: 'Summer', type: 'seasonal', season: 'summer' },
  { label: 'Fall', type: 'seasonal', season: 'fall' },
  { label: 'Winter', type: 'seasonal', season: 'winter' },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
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

// Group reports by type
function groupReports(reports: Report[]) {
  const weekly: Report[] = [];
  const monthly: Report[] = [];
  const seasonal: Report[] = [];

  reports.forEach((r) => {
    switch (r.report_type) {
      case 'weekly':
        weekly.push(r);
        break;
      case 'monthly':
        monthly.push(r);
        break;
      case 'seasonal':
        seasonal.push(r);
        break;
    }
  });

  return { weekly, monthly, seasonal };
}

export default function ReportsScreen() {
  const router = useRouter();
  const activeChildId = useChildStore((s) => s.activeChildId);
  const { data: children } = useChildren();
  const child = children?.find((c) => c.id === activeChildId);

  const {
    data: reports,
    isLoading: reportsLoading,
  } = useReports(activeChildId);
  const generateReport = useGenerateReport();

  const [activeTab, setActiveTab] = useState<TabMode>('reports');
  const [showOptions, setShowOptions] = useState(false);

  // Empty state: no child selected
  if (!activeChildId || !child) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📋</Text>
        <Text style={styles.emptyTitle}>No Child Selected</Text>
        <Text style={styles.emptySubtitle}>
          Select a child from the profile tab to see reports
        </Text>
      </View>
    );
  }

  const handleGenerateReport = useCallback(
    async (option: ReportOption) => {
      setShowOptions(false);

      let range: { start: string; end: string };
      if (option.type === 'weekly') {
        range = getWeekRange();
      } else if (option.type === 'monthly') {
        range = getMonthRange();
      } else {
        range = getSeasonRange(option.season!);
      }

      try {
        const report = await generateReport.mutateAsync({
          childId: activeChildId,
          reportType: option.type,
          periodStart: range.start,
          periodEnd: range.end,
          season: option.season,
        });
        // Navigate to the new report
        router.push(`/report/${report.id}`);
      } catch (err) {
        Alert.alert(
          'Error',
          'Failed to generate report. Please try again.'
        );
      }
    },
    [activeChildId, generateReport, router]
  );

  const handleViewReport = useCallback(
    (reportId: string) => {
      router.push(`/report/${reportId}`);
    },
    [router]
  );

  const grouped = groupReports(reports ?? []);

  // Compute entries_by_category across all reports (use most recent report for pie chart, or aggregate from all)
  const latestReport = reports?.[0];
  const entriesByCategory = latestReport?.data_json?.entries_by_category ?? {};

  return (
    <View style={styles.root}>
      {/* Tab Toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleButton,
            activeTab === 'reports' && styles.toggleActive,
          ]}
          onPress={() => setActiveTab('reports')}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === 'reports' && styles.toggleTextActive,
            ]}
          >
            Reports
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleButton,
            activeTab === 'analytics' && styles.toggleActive,
          ]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === 'analytics' && styles.toggleTextActive,
            ]}
          >
            Analytics
          </Text>
        </Pressable>
      </View>

      {activeTab === 'reports' ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Generate button */}
          <View style={styles.generateArea}>
            <CraftButton
              title={
                generateReport.isPending
                  ? 'Generating...'
                  : 'Generate Report'
              }
              onPress={() => setShowOptions(true)}
              loading={generateReport.isPending}
              color={colors.craftBlue}
              size="large"
            />
          </View>

          {reportsLoading ? (
            <View style={styles.loadingArea}>
              <ActivityIndicator
                size="large"
                color={colors.craftBlue}
              />
            </View>
          ) : !reports || reports.length === 0 ? (
            <View style={styles.noReports}>
              <Text style={styles.noReportsEmoji}>📊</Text>
              <Text style={styles.noReportsText}>
                No reports yet
              </Text>
              <Text style={styles.noReportsSubtext}>
                Tap "Generate Report" to create your first one!
              </Text>
            </View>
          ) : (
            <>
              {/* Weekly Reports */}
              {grouped.weekly.length > 0 && (
                <>
                  <MaskingTapeHeader title="Weekly Reports" />
                  {grouped.weekly.map((report, i) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      index={i}
                      onPress={() => handleViewReport(report.id)}
                    />
                  ))}
                </>
              )}

              {/* Monthly Reports */}
              {grouped.monthly.length > 0 && (
                <>
                  <MaskingTapeHeader title="Monthly Reports" />
                  {grouped.monthly.map((report, i) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      index={i + 10}
                      onPress={() => handleViewReport(report.id)}
                    />
                  ))}
                </>
              )}

              {/* Seasonal Reports */}
              {grouped.seasonal.length > 0 && (
                <>
                  <MaskingTapeHeader title="Seasonal Reports" />
                  {grouped.seasonal.map((report, i) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      index={i + 20}
                      onPress={() => handleViewReport(report.id)}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.analyticsChildName}>
            {child.name}'s Activity
          </Text>

          {/* Category Distribution */}
          <View style={styles.sectionHeader}>
            <View style={styles.tapeStrip} />
            <Text style={styles.sectionTitle}>
              Category Distribution
            </Text>
          </View>
          <View style={[styles.analyticsCard, shadows.small]}>
            <CategoryPieChart
              entriesByCategory={entriesByCategory}
            />
          </View>

          <ScissorDivider />

          {/* Activity Heatmap */}
          <View style={styles.sectionHeader}>
            <View style={styles.tapeStrip} />
            <Text style={styles.sectionTitle}>Activity Heatmap</Text>
          </View>
          <View style={[styles.analyticsCard, shadows.small]}>
            <ActivityHeatmap childId={activeChildId} />
          </View>

          <ScissorDivider />

          {/* Weekly Trends */}
          <View style={styles.sectionHeader}>
            <View style={styles.tapeStrip} />
            <Text style={styles.sectionTitle}>Weekly Trends</Text>
          </View>
          <View style={[styles.analyticsCard, shadows.small]}>
            <TrendChart childId={activeChildId} />
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}

      {/* Generate Options Modal */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowOptions(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generate Report</Text>
            <Text style={styles.modalSubtitle}>
              Choose a time period
            </Text>

            {REPORT_OPTIONS.map((option) => (
              <Pressable
                key={option.label}
                style={styles.optionButton}
                onPress={() => handleGenerateReport(option)}
              >
                <View
                  style={[
                    styles.optionDot,
                    {
                      backgroundColor: getTypeBadgeColor(option.type),
                    },
                  ]}
                />
                <Text style={styles.optionText}>{option.label}</Text>
              </Pressable>
            ))}

            <Pressable
              style={styles.cancelButton}
              onPress={() => setShowOptions(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// Report card sub-component
function ReportCard({
  report,
  index,
  onPress,
}: {
  report: Report;
  index: number;
  onPress: () => void;
}) {
  const typeLabel =
    report.report_type.charAt(0).toUpperCase() +
    report.report_type.slice(1);
  const totalEntries = report.data_json?.total_entries ?? 0;

  return (
    <CraftCard index={index} onPress={onPress}>
      <View style={cardStyles.container}>
        <View style={cardStyles.topRow}>
          <View
            style={[
              cardStyles.badge,
              {
                backgroundColor: getTypeBadgeColor(
                  report.report_type
                ),
              },
            ]}
          >
            <Text style={cardStyles.badgeText}>
              {typeLabel}
              {report.season
                ? ` - ${report.season.charAt(0).toUpperCase() + report.season.slice(1)}`
                : ''}
            </Text>
          </View>
          <Text style={cardStyles.entries}>
            {totalEntries} entries
          </Text>
        </View>
        <Text style={cardStyles.period}>
          {formatDate(report.period_start)} -{' '}
          {formatDate(report.period_end)}
        </Text>
        <Text style={cardStyles.tapHint}>Tap to view</Text>
      </View>
    </CraftCard>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    paddingVertical: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.white,
  },
  entries: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: '#8B7E6A',
  },
  period: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.pencilGray,
    marginBottom: 2,
  },
  tapHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#B0A89A',
    fontStyle: 'italic',
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.linedPaper,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.linedPaper,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.pencilGray,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: '#8B7E6A',
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: '#F0EDE8',
    borderRadius: 12,
    padding: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: colors.white,
    ...shadows.small,
  },
  toggleText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: '#8B7E6A',
  },
  toggleTextActive: {
    color: colors.craftBlue,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  generateArea: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loadingArea: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  noReports: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  noReportsEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  noReportsText: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.pencilGray,
    marginBottom: spacing.xs,
  },
  noReportsSubtext: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
    textAlign: 'center',
  },
  analyticsChildName: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.pencilGray,
    textAlign: 'center',
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
  analyticsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.linedPaper,
    borderRadius: 16,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 340,
    ...shadows.lifted,
  },
  modalTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.pencilGray,
    textAlign: 'center',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(173, 206, 240, 0.3)',
  },
  optionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  optionText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.pencilGray,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.craftRed,
  },
});
