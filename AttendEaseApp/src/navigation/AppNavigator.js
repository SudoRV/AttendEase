import React, { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, Pressable, Platform, SafeAreaView, View } from "react-native";

import TimeTableScreen from "../screens/TimeTableScreen";
import LeaveScreen from "../screens/LeaveScreen";
import AlertsScreen from "../screens/AlertsScreen";
import ProfileScreen from "../screens/ProfileScreen";

import { AppStates } from "../context/AppStates";
import AnimatedTabIcon from "../components/ui/AnimatedTabIcon";

const Tab = createBottomTabNavigator();

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#ffffff",
  },
};

export default function AppNavigator({ onLogout }) {
  const { logout } = AppStates();

  useEffect(() => {
    if (logout && onLogout) {
      onLogout();
    }
  }, [logout]);

  return (
    <View style={{ flex: 1}}>
      <NavigationContainer theme={AppTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            lazy: true,
            freezeOnBlur: true,
            detachInactiveScreens: true,

            tabBarStyle: {
              height: Platform.OS === 'ios' ? 88 : 70,
              paddingBottom: Platform.OS === 'ios' ? 28 : 12,
              paddingTop: 0,
              paddingHorizontal: 10,
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#f1f5f9',
              elevation: 0, // Removes Android shadow clipping layout glitches
              shadowOpacity: 0, // Removes iOS shadow clipping layout glitches
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

            tabBarActiveTintColor: "#4F6EF7",
            tabBarInactiveTintColor: "#444",

            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  color: focused ? "#4F6EF7" : "#444",
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