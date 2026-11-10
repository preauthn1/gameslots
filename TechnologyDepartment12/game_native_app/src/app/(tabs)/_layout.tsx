import { Tabs } from 'expo-router';

import { AppTabBar } from '@/components/app-tab-bar';
import { HomeDrawer } from '@/components/global-nav';
import { colors } from '@/theme/colors';

export default function TabsLayout() {
  return (
    <HomeDrawer>
      <Tabs
        tabBar={(props) => <AppTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.bg },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="recharge" options={{ title: 'Deposit' }} />
        <Tabs.Screen name="spin" options={{ title: 'Get Cash' }} />
        <Tabs.Screen name="welfare-center" options={{ title: 'Rewards' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </HomeDrawer>
  );
}
