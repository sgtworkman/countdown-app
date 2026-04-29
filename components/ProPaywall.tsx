import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPurchase: () => Promise<boolean>;
}

const FEATURES = [
  { icon: '♾️', label: 'Unlimited countdowns' },
  { icon: '🎨', label: 'All 8 color themes' },
  { icon: '📷', label: 'Custom photo backgrounds' },
  { icon: '🔄', label: 'Recurring annual events' },
  { icon: '🔔', label: 'Custom reminder schedules' },
];

export function ProPaywall({ visible, onClose, onPurchase }: Props) {
  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await onPurchase();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Pressable onPress={onClose} style={styles.closeArea}>
            <View style={styles.handle} />
          </Pressable>

          <Text style={styles.sparkle}>✨</Text>
          <Text style={styles.title}>Unlock Everything</Text>
          <Text style={styles.subtitle}>One time. Forever. No subscription.</Text>

          <View style={styles.features}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          <Pressable onPress={handlePurchase}>
            <LinearGradient
              colors={['#ec4899', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.purchaseBtn}
            >
              <Text style={styles.purchaseBtnText}>Get PRO — $2.99</Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.finePrint}>One-time purchase. No recurring charges.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingBottom: 48,
    paddingTop: 12,
    alignItems: 'center',
  },
  closeArea: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
  },
  sparkle: {
    fontSize: 48,
    marginTop: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 24,
  },
  features: {
    alignSelf: 'stretch',
    gap: 14,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  featureLabel: {
    fontSize: 17,
    color: '#374151',
    fontWeight: '600',
  },
  purchaseBtn: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  purchaseBtnText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
  },
  finePrint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 14,
    fontWeight: '500',
  },
});
