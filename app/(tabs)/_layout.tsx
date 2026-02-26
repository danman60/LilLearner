import React from 'react';
import { Tabs } from 'expo-router';
import { colors, fonts } from '@/src/config/theme';
import { CraftTabBar } from '@/src/components/ui/CraftTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CraftTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.linedPaper,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          fontFamily: fonts.displayBold,
          fontSize: 22,
          color: colors.pencilGray,
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
