import React from 'react';
import { Tabs } from 'expo-router';
import { colors, fonts } from '@/src/config/theme';
import { CraftTabBar } from '@/src/components/ui/CraftTabBar';
import { useFeature } from '@/src/stores/featureStore';

export default function TabLayout() {
  const scrapbook = useFeature('SCRAPBOOK_THEME');

  return (
    <Tabs
      tabBar={scrapbook ? (props) => <CraftTabBar {...props} /> : undefined}
      screenOptions={{
        headerStyle: {
          backgroundColor: scrapbook ? colors.linedPaper : colors.warmWhite,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          fontFamily: scrapbook ? fonts.displayBold : fonts.bodyBold,
          fontSize: 22,
          color: scrapbook ? colors.pencilGray : '#333333',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
