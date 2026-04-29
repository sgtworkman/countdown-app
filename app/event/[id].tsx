import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { CountdownNumber, CountdownTicker } from '../../components/CountdownNumber';
import { EmojiPicker } from '../../components/EmojiPicker';
import { ThemePicker } from '../../components/ThemePicker';
import { PhotoPicker } from '../../components/PhotoPicker';
import { NotificationPicker } from '../../components/NotificationPicker';
import { ProPaywall } from '../../components/ProPaywall';
import { useCountdowns } from '../../hooks/useCountdowns';
import { useCountdown } from '../../hooks/useCountdown';
import { usePro } from '../../hooks/usePro';
import { getTheme, type ColorTheme } from '../../constants/themes';
import type { NotificationInterval } from '../../constants/notifications';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getEvent, updateEvent, deleteEvent } = useCountdowns();
  const { isPro, purchasePro } = usePro();

  const event = getEvent(id ?? '');
  const [editing, setEditing] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('@countdown_settings').then((raw) => {
      try {
        if (raw) {
          const s = JSON.parse(raw);
          if (s.showSeconds === false) setShowSeconds(false);
        }
      } catch {
        // Corrupted storage — keep default
      }
    });
  }, []);

  // Edit state
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [editTheme, setEditTheme] = useState<ColorTheme>('pink-purple');
  const [editPhotoUri, setEditPhotoUri] = useState<string | undefined>();
  const [editRecurring, setEditRecurring] = useState(false);
  const [editNotification, setEditNotification] = useState<NotificationInterval>('none');

  useEffect(() => {
    if (event) {
      setEditName(event.name);
      setEditEmoji(event.emoji);
      setEditTheme(event.colorTheme);
      setEditPhotoUri(event.photoUri);
      setEditRecurring(event.recurring === 'annual');
      setEditNotification(event.notificationInterval ?? 'none');
    }
  }, [event]);

  const countdown = useCountdown(event?.targetDate ?? new Date().toISOString().split('T')[0], showSeconds);
  const theme = getTheme(event?.colorTheme ?? 'pink-purple');

  if (!event) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.notFoundText}>Event not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.goBackText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      Alert.alert('Hold on!', 'Give your countdown a name.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateEvent(event.id, {
      name: editName.trim(),
      emoji: editEmoji,
      colorTheme: editTheme,
      photoUri: isPro ? editPhotoUri : event.photoUri,
      recurring: isPro && editRecurring ? 'annual' : undefined,
      notificationInterval: editNotification,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete countdown?',
      `Are you sure you want to delete "${event.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteEvent(event.id);
            router.back();
          },
        },
      ]
    );
  };

  if (editing) {
    return (
      <KeyboardAvoidingView
        style={[styles.editContainer, { paddingTop: insets.top + 8 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.editHeader}>
          <Pressable onPress={() => setEditing(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.editHeaderTitle}>Edit</Text>
          <Pressable onPress={handleSaveEdit}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.editForm} showsVerticalScrollIndicator={false}>
          <Text style={styles.editLabel}>Name</Text>
          <TextInput
            style={styles.editInput}
            placeholder="Countdown name"
            placeholderTextColor="#9ca3af"
            selectionColor="#a855f7"
            keyboardAppearance="light"
            value={editName}
            onChangeText={setEditName}
            maxLength={50}
          />
          <EmojiPicker selected={editEmoji} onSelect={setEditEmoji} />
          <ThemePicker selected={editTheme} onSelect={setEditTheme} isPro={isPro} />
          <PhotoPicker
            photoUri={editPhotoUri}
            onPick={setEditPhotoUri}
            isPro={isPro}
            onProRequired={() => setShowPaywall(true)}
          />
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Repeat annually</Text>
              {!isPro && <Text style={styles.proBadge}>PRO</Text>}
            </View>
            <Switch
              value={editRecurring}
              onValueChange={(v) => {
                if (!isPro) {
                  setShowPaywall(true);
                  return;
                }
                setEditRecurring(v);
              }}
              trackColor={{ false: '#e5e7eb', true: '#c4b5fd' }}
              thumbColor={editRecurring ? '#a855f7' : '#f3f4f6'}
            />
          </View>
          <NotificationPicker
            selected={editNotification}
            onSelect={setEditNotification}
          />
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

  return (
    <View style={styles.detailContainer}>
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.detailGradient, { paddingTop: insets.top + 12 }]}
      >
        {event.photoUri && (
          <Image
            source={{ uri: event.photoUri }}
            style={styles.detailPhoto}
            blurRadius={6}
          />
        )}

        {/* Nav */}
        <View style={styles.detailNav}>
          <Pressable onPress={() => router.back()} style={styles.detailNavBtn}>
            <Text style={[styles.detailNavText, { color: theme.textColor }]}>← Back</Text>
          </Pressable>
          <View style={styles.detailNavActions}>
            <Pressable onPress={() => setEditing(true)} style={styles.detailNavBtn}>
              <Text style={[styles.detailNavText, { color: theme.textColor }]}>Edit</Text>
            </Pressable>
            <Pressable onPress={handleDelete} style={styles.detailNavBtn}>
              <Text style={[styles.detailNavText, { color: theme.textColor }]}>Delete</Text>
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View style={styles.detailContent}>
          <Animated.Text
            entering={FadeIn.delay(100)}
            style={styles.detailEmoji}
          >
            {event.emoji}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(200).springify()}
            style={[styles.detailName, { color: theme.textColor }]}
          >
            {event.name}
          </Animated.Text>

          {countdown.isToday ? (
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Text style={[styles.todayBanner, { color: theme.textColor }]}>
                🎉 Today's the day! 🎉
              </Text>
            </Animated.View>
          ) : (
            <>
              <CountdownNumber
                value={countdown.totalDays}
                label={countdown.isPast ? 'days ago' : countdown.totalDays === 1 ? 'day' : 'days'}
                color={theme.textColor}
                secondaryColor={theme.secondaryTextColor}
                large
              />
              {showSeconds && !countdown.isPast && (
                <CountdownTicker
                  hours={countdown.hours}
                  minutes={countdown.minutes}
                  seconds={countdown.seconds}
                  color={theme.textColor}
                  secondaryColor={theme.secondaryTextColor}
                />
              )}
            </>
          )}

          {event.recurring && (
            <Animated.View
              entering={FadeInDown.delay(500)}
              style={styles.recurringTag}
            >
              <Text style={styles.recurringTagText}>🔄 Repeats annually</Text>
            </Animated.View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF0FF',
    gap: 12,
  },
  notFoundText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
  goBackText: {
    fontSize: 16,
    color: '#a855f7',
    fontWeight: '600',
  },
  // Detail view
  detailContainer: {
    flex: 1,
  },
  detailGradient: {
    flex: 1,
    position: 'relative',
  },
  detailPhoto: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  detailNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  detailNavActions: {
    flexDirection: 'row',
    gap: 16,
  },
  detailNavBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  detailNavText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  detailEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  detailName: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
  },
  todayBanner: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  recurringTag: {
    marginTop: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recurringTagText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Edit view
  editContainer: {
    flex: 1,
    backgroundColor: '#FDF0FF',
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  editHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  saveText: {
    fontSize: 16,
    color: '#a855f7',
    fontWeight: '700',
  },
  editForm: {
    padding: 24,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  editInput: {
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  proBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a855f7',
    marginTop: 4,
  },
});
