import React from 'react';
import { Tabs } from 'expo-router';
import { colors, fonts } from '@/src/config/theme';
import { CraftTabBar } from '@/src/components/ui/CraftTabBar';
import { FEATURES } from '@/src/config/features';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={FEATURES.SCRAPBOOK_THEME ? (props) => <CraftTabBar {...props} /> : undefined}
      screenOptions={{
        headerStyle: {
          backgroundColor: FEATURES.SCRAPBOOK_THEME ? colors.linedPaper : '#FFFFFF',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          fontFamily: FEATURES.SCRAPBOOK_THEME ? fonts.displayBold : fonts.bodyBold,
          fontSize: 22,
          color: FEATURES.SCRAPBOOK_THEME ? colors.pencilGray : '#333333',
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
