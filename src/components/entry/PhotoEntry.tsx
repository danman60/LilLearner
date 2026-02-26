import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CraftButton } from '../ui';
import { colors, fonts, spacing } from '../../config/theme';
import { supabase } from '../../lib/supabase';
import { useAddEntry } from '../../hooks/useEntries';
import { useAuthStore } from '../../stores/authStore';

interface PhotoEntryProps {
  categoryId: string;
  childId: string;
  defaultSkillId: string;
}

export function PhotoEntry({ categoryId, childId, defaultSkillId }: PhotoEntryProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const addEntry = useAddEntry();
  const user = useAuthStore((s) => s.user);

  const pickImage = async (useCamera: boolean) => {
    try {
      // Request permission
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera access is required to take photos.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Photo library access is required.');
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            allowsEditing: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            allowsEditing: true,
          });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      setPreview(asset.uri);
      setUploading(true);

      // Upload to Supabase Storage
      const timestamp = Date.now();
      const ext = asset.uri.split('.').pop() || 'jpg';
      const filePath = `${user!.id}/${childId}/${timestamp}.${ext}`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('ll-photos')
        .upload(filePath, blob, {
          contentType: `image/${ext}`,
          upsert: false,
        });

      if (uploadError) {
        // If storage bucket doesn't exist, just create entry without URL
        console.warn('Photo upload failed:', uploadError.message);
        addEntry.mutate({
          child_id: childId,
          category_id: categoryId,
          skill_id: defaultSkillId,
          entry_type: 'photo',
          notes: 'Photo captured (upload pending)',
        });
      } else {
        const { data: urlData } = supabase.storage
          .from('ll-photos')
          .getPublicUrl(filePath);

        addEntry.mutate({
          child_id: childId,
          category_id: categoryId,
          skill_id: defaultSkillId,
          entry_type: 'photo',
          media_urls: [urlData.publicUrl],
        });
      }

      setUploading(false);
      setPreview(null);
    } catch (err) {
      console.error('Photo error:', err);
      setUploading(false);
      setPreview(null);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {preview && (
        <Image source={{ uri: preview }} style={styles.preview} />
      )}
      <View style={styles.buttonRow}>
        <CraftButton
          title="Camera"
          onPress={() => pickImage(true)}
          color={colors.craftBlue}
          size="small"
          loading={uploading}
          style={styles.button}
        />
        <CraftButton
          title="Gallery"
          onPress={() => pickImage(false)}
          color={colors.craftPurple}
          size="small"
          loading={uploading}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  preview: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
});
