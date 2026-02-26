import { Stack } from 'expo-router';
import { colors, fonts } from '@/src/config/theme';

export default function LogLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.linedPaper,
        },
        headerTitleStyle: {
          fontFamily: fonts.displayBold,
          fontSize: 20,
          color: colors.pencilGray,
        },
        headerShadowVisible: false,
        headerTintColor: colors.craftBlue,
      }}
    >
      <Stack.Screen
        name="[categoryId]"
        options={{
          headerTitle: 'Quick Log',
        }}
      />
    </Stack>
  );
}
