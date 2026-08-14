import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 7,
          paddingBottom: bottomPadding,
          height: tabBarHeight + 2,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
        tabBarItemStyle: { paddingVertical: 1 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.1 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Plan",
          tabBarAccessibilityLabel: "Plan and onboarding",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Track",
          tabBarAccessibilityLabel: "Progress overview",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Meals",
          tabBarAccessibilityLabel: "Meal plans and grocery list",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="fork.knife" color={color} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarAccessibilityLabel: "Workout sessions",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="dumbbell.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="move"
        options={{
          title: "Extras",
          tabBarAccessibilityLabel: "Extras and wellness tools",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="figure.run" color={color} />,
        }}
      />
      <Tabs.Screen name="tracker" options={{ href: null }} />
    </Tabs>
  );
}
