import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import { ProPaywall } from '../components/ProPaywall';
import { usePro } from '../hooks/usePro';

const SETTINGS_KEY = '@countdown_settings';

interface Settings {
  showSeconds: boolean;
  showPastEvents: boolean;
  defaultTheme: string;
}

const DEFAULT_SETTINGS: Settings = {
  showSeconds: true,
  showPastEvents: true,
  defaultTheme: 'pink-purple',
};

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPro, purchasePro, purchaseTip, restorePurchases } = usePro();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    }
  };

  const updateSetting = async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  const handleTip = async (tier: 'coffee' | 'cupcake' | 'pizza') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await purchaseTip(tier);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Thank you! 💜', 'Your support means the world.');
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const restored = await restorePurchases();
    if (restored) {
      Alert.alert('Restored!', 'Your PRO purchase has been restored.');
    } else {
      Alert.alert('Nothing to restore', 'No previous purchases found.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Display */}
        <Text style={styles.sectionTitle}>Display</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Show seconds</Text>
              <Text style={styles.settingDesc}>Live seconds ticker on detail view</Text>
            </View>
            <Switch
              value={settings.showSeconds}
              onValueChange={(v) => updateSetting('showSeconds', v)}
              trackColor={{ false: '#e5e7eb', true: '#c4b5fd' }}
              thumbColor={settings.showSeconds ? '#a855f7' : '#f3f4f6'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Show past events</Text>
              <Text style={styles.settingDesc}>Keep expired countdowns visible</Text>
            </View>
            <Switch
              value={settings.showPastEvents}
              onValueChange={(v) => updateSetting('showPastEvents', v)}
              trackColor={{ false: '#e5e7eb', true: '#c4b5fd' }}
              thumbColor={settings.showPastEvents ? '#a855f7' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* PRO */}
        <Text style={styles.sectionTitle}>PRO</Text>
        <View style={styles.card}>
          {isPro ? (
            <View style={styles.proActive}>
              <Text style={styles.proActiveIcon}>✨</Text>
              <Text style={styles.proActiveText}>PRO is active!</Text>
              <Text style={styles.proActiveDesc}>You have access to everything.</Text>
            </View>
          ) : (
            <Pressable onPress={() => setShowPaywall(true)} style={styles.upgradeRow}>
              <View>
                <Text style={styles.upgradeLabel}>Upgrade to PRO</Text>
                <Text style={styles.upgradeDesc}>Unlimited countdowns, all themes, photos, recurring</Text>
              </View>
              <Text style={styles.upgradePrice}>$2.99</Text>
            </Pressable>
          )}
          <View style={styles.divider} />
          <Pressable onPress={handleRestore} style={styles.settingRow}>
            <Text style={styles.settingLabel}>Restore purchases</Text>
          </Pressable>
        </View>

        {/* Tip Jar */}
        <Text style={styles.sectionTitle}>Support the App</Text>
        <View style={styles.card}>
          <Text style={styles.tipIntro}>Love DaysPop? Leave a tip!</Text>
          <View style={styles.tipGrid}>
            <Pressable onPress={() => handleTip('coffee')} style={styles.tipBtn}>
              <Text style={styles.tipEmoji}>☕</Text>
              <Text style={styles.tipAmount}>$1</Text>
            </Pressable>
            <Pressable onPress={() => handleTip('cupcake')} style={styles.tipBtn}>
              <Text style={styles.tipEmoji}>🧁</Text>
              <Text style={styles.tipAmount}>$3</Text>
            </Pressable>
            <Pressable onPress={() => handleTip('pizza')} style={styles.tipBtn}>
              <Text style={styles.tipEmoji}>🍕</Text>
              <Text style={styles.tipAmount}>$5</Text>
            </Pressable>
          </View>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Made with 💜</Text>
          </View>
        </View>

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>

      <ProPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={purchasePro}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF0FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backText: {
    fontSize: 16,
    color: '#a855f7',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  settingDesc: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  settingValue: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
  },
  proActive: {
    alignItems: 'center',
    padding: 20,
  },
  proActiveIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  proActiveText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#a855f7',
  },
  proActiveDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  upgradeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#a855f7',
  },
  upgradeDesc: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
    maxWidth: 240,
  },
  upgradePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#a855f7',
  },
  tipIntro: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  tipGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
  },
  tipBtn: {
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    gap: 4,
  },
  tipEmoji: {
    fontSize: 28,
  },
  tipAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7c3aed',
  },
});
