import React, { useEffect } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, Pressable, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from 'nativewind';
import { createNavigationContainerRef } from "@react-navigation/native";

import TimeTableScreen from "../screens/TimeTableScreen";
import LeaveScreen from "../screens/LeaveScreen";
import AlertsScreen from "../screens/AlertsScreen";
import ProfileScreen from "../screens/ProfileScreen";

import { AppStates } from "../context/AppStates";
import AnimatedTabIcon from "../components/ui/AnimatedTabIcon";

const Tab = createBottomTabNavigator();
export const navigationRef = createNavigationContainerRef();

export default function AppNavigator({ onLogout }) {
  const { logout } = AppStates();
  const insets = useSafeAreaInsets();
  
  // 1. Listen to NativeWind's active state ('light' | 'dark')
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 2. Generate a dynamic screen background container theme configuration
  const DynamicAppTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: isDark ? "#171717" : "#ffffff", // neutral-900 vs white
    },
  };

  useEffect(() => {
    if (logout && onLogout) {
      onLogout();
    }
  }, [logout]);

  return (
    // Dynamic surrounding flexbox prevents viewport clipping glitches
    <View style={{ flex: 1, backgroundColor: isDark ? "#171717" : "#ffffff" }}>
      <NavigationContainer ref={navigationRef} theme={DynamicAppTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            lazy: true,
            freezeOnBlur: false,
            detachInactiveScreens: false,

            tabBarStyle: {
              height: Platform.OS === 'ios' ? 88 : 70 + (insets.bottom > 0 ? insets.bottom : 8),
              paddingBottom: Platform.OS === 'ios' ? 28 : (insets.bottom > 0 ? insets.bottom : 8),
              paddingTop: 0,
              paddingHorizontal: 10,
              
              // 3. Dynamic Navigator Bar Palette Shifts
              backgroundColor: isDark ? '#171717' : '#ffffff', 
              borderTopWidth: 1,
              borderTopColor: isDark ? '#262626' : '#f1f5f9', 
              
              elevation: 0, 
              shadowOpacity: 0, 
            },

            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              switch (route.name) {
                case "Timetable": iconName = "calendar-outline"; break;
                case "Leave": iconName = "document-text-outline"; break;
                case "Alerts": iconName = "notifications-outline"; break;
                case "Profile": iconName = "person-outline"; break;
              }
              return (
                <AnimatedTabIcon
                  focused={focused}
                  iconName={iconName}
                  size={size}
                  color={color}
                />
              );
            },

            // 4. Dynamic Tinting Shifts for Active Elements
            tabBarActiveTintColor: isDark ? "#7086f8" : "#4F6EF7", 
            tabBarInactiveTintColor: isDark ? "#ccc" : "#444444",

            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  color: focused 
                    ? (isDark ? "#7086f8" : "#4F6EF7") 
                    : (isDark ? "#ccc" : "#444444"),
                  fontWeight: focused ? "700" : "500",
                  fontSize: 14,
                  marginTop: 8
                }}
              >
                {route.name}
              </Text>
            ),

            tabBarButton: (props) => (
              <Pressable 
                {...props} 
                style={[props.style, { flex: 1 }]} 
                android_ripple={null}
              />
            ),
          })}
        >
          <Tab.Screen name="Timetable" component={TimeTableScreen} />
          <Tab.Screen name="Leave" component={LeaveScreen} />
          <Tab.Screen name="Alerts" component={AlertsScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

export function getCurrentTab() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
}