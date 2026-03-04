import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { THEMES, type ColorTheme, type ThemeConfig } from '../constants/themes';

interface Props {
  selected: ColorTheme;
  onSelect: (theme: ColorTheme) => void;
  isPro: boolean;
}

export function ThemePicker({ selected, onSelect, isPro }: Props) {
  const handleSelect = (theme: ThemeConfig) => {
    if (theme.isPro && !isPro) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(theme.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Color theme</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {THEMES.map((theme) => {
          const isLocked = theme.isPro && !isPro;
          const isSelected = selected === theme.id;

          return (
            <Pressable
              key={theme.id}
              onPress={() => handleSelect(theme)}
              style={[styles.themeItem, isLocked && styles.locked]}
            >
              <View style={[styles.swatch, isSelected && styles.swatchSelected]}>
                <LinearGradient
                  colors={theme.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientSwatch}
                >
                  {isLocked && (
                    <View style={styles.lockOverlay}>
                      <Text style={styles.lockIcon}>🔒</Text>
                    </View>
                  )}
                </LinearGradient>
              </View>
              <Text style={[styles.themeLabel, isSelected && styles.themeLabelSelected]}>
                {theme.icon} {theme.label}
              </Text>
              {isLocked && <Text style={styles.proBadge}>PRO</Text>}
            </Pressable>
          );
        })}
      </ScrollView>
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
  scroll: {
    gap: 12,
    paddingRight: 20,
  },
  themeItem: {
    alignItems: 'center',
    gap: 6,
  },
  locked: {
    opacity: 0.5,
  },
  swatch: {
    width: 64,
    height: 64,
    borderRadius: 18,
    padding: 3,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: '#818cf8',
    borderRadius: 20,
  },
  gradientSwatch: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14,
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 18,
  },
  themeLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  themeLabelSelected: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  proBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#a855f7',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
