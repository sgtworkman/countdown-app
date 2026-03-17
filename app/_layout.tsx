import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Appearance } from 'react-native';
import 'react-native-reanimated';

// Force light mode at the system level to prevent iOS from
// overriding text colors (white-on-white TextInput bug)
Appearance.setColorScheme('light');

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
