import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '@/src/config/theme';
import { Entry, EntryType } from '@/src/types';
import { getSkillById } from '@/src/config/categories';
import { XP_VALUES } from '@/src/config/xp';

const ENTRY_TYPE_EMOJI: Record<EntryType, string> = {
  activity: '\u270F\uFE0F',
  photo: '\uD83D\uDCF8',
  note: '\uD83D\uDCDD',
  milestone: '\uD83C\uDFC5',
  counter: '\uD83D\uDD22',
};

function getXpForType(type: EntryType): number {
  switch (type) {
    case 'photo':
      return XP_VALUES.ADD_PHOTO;
    case 'note':
      return XP_VALUES.WRITE_NOTE;
    case 'milestone':
      return XP_VALUES.COMPLETE_MILESTONE;
    default:
      return XP_VALUES.LOG_ACTIVITY;
  }
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface EntryCardProps {
  entry: Entry;
  categoryColor: string;
}

export function EntryCard({ entry, categoryColor }: EntryCardProps) {
  const skill = getSkillById(entry.category_id, entry.skill_id);
  const typeEmoji = ENTRY_TYPE_EMOJI[entry.entry_type] ?? '\u270F\uFE0F';
  const xp = getXpForType(entry.entry_type);
  const hasPhoto = entry.media_urls && entry.media_urls.length > 0;
  const displayText = entry.notes || entry.value || '';

  return (
    <View style={styles.card}>
      {/* Color accent left border */}
      <View style={[styles.accentBorder, { backgroundColor: categoryColor }]} />

      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={styles.typeEmoji}>{typeEmoji}</Text>
          <Text style={styles.skillName} numberOfLines={1}>
            {skill?.name ?? entry.skill_id}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(entry.logged_at)}</Text>
        </View>

        {/* Content row */}
        {displayText ? (
          <Text style={styles.displayText} numberOfLines={2}>
            {displayText}
          </Text>
        ) : null}

        {/* Photo thumbnail */}
        {hasPhoto ? (
          <View style={styles.photoRow}>
            <Image
              source={{ uri: entry.media_urls[0] }}
              style={styles.thumbnail}
            />
            {entry.media_urls.length > 1 ? (
              <Text style={styles.morePhotos}>
                +{entry.media_urls.length - 1} more
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* XP badge in corner */}
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{xp} XP</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    ...shadows.small,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  accentBorder: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typeEmoji: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  skillName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.pencilGray,
    flex: 1,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#B0A89A',
    marginLeft: spacing.sm,
  },
  displayText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#6B6358',
    lineHeight: 18,
    marginTop: 2,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.notebookBlue,
  },
  morePhotos: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.craftBlue,
  },
  xpBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(242, 201, 76, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  xpText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: '#B8960A',
  },
});
