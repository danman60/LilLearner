import { Stack } from 'expo-router';
import { colors, fonts } from '@/src/config/theme';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.linedPaper,
        },
        headerTitleStyle: {
          fontFamily: fonts.displayBold,
          fontSize: 22,
          color: colors.pencilGray,
        },
        headerShadowVisible: false,
        headerTintColor: colors.craftBlue,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="add-child"
        options={{
          title: 'Add Learner',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="edit-child"
        options={{
          title: 'Edit Learner',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Stack>
  );
}
