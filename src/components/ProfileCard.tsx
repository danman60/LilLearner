import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '@/src/config/theme';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/lib/supabase';

export function ProfileCard() {
  const user = useAuthStore((s) => s.user);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name ?? ''
  );
  const [saving, setSaving] = useState(false);

  const email = user?.email ?? '';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  const handleSave = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await supabase.auth.updateUser({
        data: { full_name: displayName.trim() },
      });
      setEditing(false);
    } catch {
      // silent fail
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* Avatar circle */}
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(displayName || email).charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Name row */}
      <View style={styles.nameRow}>
        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.nameInput}
              value={displayName}
              onChangeText={setDisplayName}
              autoFocus
              placeholder="Your name"
              placeholderTextColor="#C0B8A8"
            />
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveBtn}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.craftGreen} />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setDisplayName(user?.user_metadata?.full_name ?? '');
                setEditing(false);
              }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.displayRow}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName || 'Parent'}
            </Text>
            <TouchableOpacity
              onPress={() => setEditing(true)}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Info rows */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
          {email}
        </Text>
      </View>

      {memberSince ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Member since</Text>
          <Text style={styles.infoValue}>{memberSince}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  avatarRow: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.craftBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.craftYellow,
  },
  avatarText: {
    fontFamily: fonts.bodyBold,
    fontSize: 28,
    color: colors.white,
  },
  nameRow: {
    marginBottom: spacing.md,
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.pencilGray,
    textAlign: 'center',
  },
  editBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(91, 155, 213, 0.12)',
    borderRadius: borderRadius.sm,
  },
  editBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.craftBlue,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nameInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.pencilGray,
    borderBottomWidth: 2,
    borderBottomColor: colors.craftBlue,
    paddingVertical: spacing.xs,
  },
  saveBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(107, 191, 107, 0.15)',
    borderRadius: borderRadius.sm,
  },
  saveBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.craftGreen,
  },
  cancelBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  cancelBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: '#8B7E6A',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(173, 206, 240, 0.3)',
  },
  infoLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: '#8B7E6A',
  },
  infoValue: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.pencilGray,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.sm,
  },
});
