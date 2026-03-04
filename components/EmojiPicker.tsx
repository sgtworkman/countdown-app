import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { EMOJI_SET } from '../constants/emojis';

interface Props {
  selected: string;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ selected, onSelect }: Props) {
  const handleSelect = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(emoji);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pick an emoji</Text>
      <View style={styles.grid}>
        {EMOJI_SET.map((emoji) => (
          <Pressable
            key={emoji}
            onPress={() => handleSelect(emoji)}
            style={[
              styles.emojiCell,
              selected === emoji && styles.emojiSelected,
            ]}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiCell: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiSelected: {
    backgroundColor: '#e0e7ff',
    borderWidth: 2,
    borderColor: '#818cf8',
  },
  emojiText: {
    fontSize: 28,
  },
});
