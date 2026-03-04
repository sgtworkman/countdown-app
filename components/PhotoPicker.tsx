import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

interface Props {
  photoUri?: string;
  onPick: (uri: string | undefined) => void;
  isPro: boolean;
  onProRequired: () => void;
}

export function PhotoPicker({ photoUri, onPick, isPro, onProRequired }: Props) {
  const handlePick = async () => {
    if (!isPro) {
      onProRequired();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onPick(result.assets[0].uri);
    }
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPick(undefined);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Background photo</Text>
        {!isPro && <Text style={styles.proBadge}>PRO</Text>}
      </View>

      {photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <Pressable onPress={handleRemove} style={styles.removeBtn}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={handlePick} style={[styles.pickBtn, !isPro && styles.locked]}>
          <Text style={styles.pickIcon}>📷</Text>
          <Text style={styles.pickText}>Choose from camera roll</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  proBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a855f7',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  locked: {
    opacity: 0.5,
  },
  pickIcon: {
    fontSize: 24,
  },
  pickText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  previewContainer: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: 14,
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
