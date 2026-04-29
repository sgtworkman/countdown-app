import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Appearance } from 'react-native';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';

// Force light mode at the system level to prevent iOS from
// overriding text colors (white-on-white TextInput bug)
Appearance.setColorScheme('light');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#FDF0FF' },
        }}
      />
    </>
  );
}
