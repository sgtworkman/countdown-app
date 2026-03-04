import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

import { EmojiPicker } from '../components/EmojiPicker';
import { ThemePicker } from '../components/ThemePicker';
import { PhotoPicker } from '../components/PhotoPicker';
import { ProPaywall } from '../components/ProPaywall';
import { useCountdowns } from '../hooks/useCountdowns';
import { usePro } from '../hooks/usePro';
import type { ColorTheme } from '../constants/themes';

export default function AddScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addEvent } = useCountdowns();
  const { isPro, purchasePro } = usePro();

  const [name, setName] = useState('');
  const [targetDate, setTargetDate] = useState(new Date());
  const [emoji, setEmoji] = useState('🎉');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('pink-purple');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [recurring, setRecurring] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Hold on!', 'Give your countdown a name first.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const dateStr = targetDate.toISOString().split('T')[0];

    await addEvent({
      name: name.trim(),
      targetDate: dateStr,
      emoji,
      colorTheme,
      photoUri: isPro ? photoUri : undefined,
      recurring: isPro && recurring ? 'annual' : undefined,
    });

    router.back();
  };

  const handleRecurringToggle = (value: boolean) => {
    if (!isPro) {
      setShowPaywall(true);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRecurring(value);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>New Countdown</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <Text style={styles.label}>What are you counting down to?</Text>
        <TextInput
          style={styles.input}
          placeholder='Disney Trip! 🏰'
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
          maxLength={50}
          autoFocus
        />

        {/* Date */}
        <Text style={styles.label}>When is it?</Text>
        {Platform.OS === 'android' && (
          <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateBtn}>
            <Text style={styles.dateBtnText}>
              📅 {targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </Pressable>
        )}
        {showDatePicker && (
          <DateTimePicker
            value={targetDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, date) => {
              if (Platform.OS === 'android') setShowDatePicker(false);
              if (date) {
                Haptics.selectionAsync();
                setTargetDate(date);
              }
            }}
            style={styles.datePicker}
            accentColor="#a855f7"
          />
        )}

        {/* Emoji */}
        <EmojiPicker selected={emoji} onSelect={setEmoji} />

        {/* Theme */}
        <ThemePicker selected={colorTheme} onSelect={setColorTheme} isPro={isPro} />

        {/* Photo */}
        <PhotoPicker
          photoUri={photoUri}
          onPick={setPhotoUri}
          isPro={isPro}
          onProRequired={() => setShowPaywall(true)}
        />

        {/* Recurring */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Repeat annually</Text>
            <Text style={styles.toggleDesc}>Auto-repeat every year (birthdays, etc.)</Text>
          </View>
          <View style={styles.toggleRight}>
            {!isPro && <Text style={styles.proBadge}>PRO</Text>}
            <Switch
              value={recurring}
              onValueChange={handleRecurringToggle}
              trackColor={{ false: '#e5e7eb', true: '#c4b5fd' }}
              thumbColor={recurring ? '#a855f7' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Save */}
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
        >
          <Text style={styles.saveBtnText}>Save Countdown</Text>
        </Pressable>

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>

      <ProPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={purchasePro}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fafafa',
  },
  backBtn: {
    width: 60,
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
  form: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  dateBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  dateBtnText: {
    fontSize: 16,
    color: '#374151',
  },
  datePicker: {
    marginBottom: 24,
    alignSelf: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 32,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  toggleDesc: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  toggleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  saveBtn: {
    backgroundColor: '#a855f7',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
