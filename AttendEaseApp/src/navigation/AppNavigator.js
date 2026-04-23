import React, { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from 'react-native-vector-icons/Ionicons';

import TimeTableScreen from "../screens/TimeTableScreen";
import LeaveScreen from "../screens/LeaveScreen";
import AlertsScreen from "../screens/AlertsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { View, Text, Animated, Pressable } from "react-native";

import { AppStates } from "../context/AppStates";

import AnimatedTabIcon from "../components/ui/AnimatedTabIcon";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ----- Individual Stack Wrappers (Scalable Setup) ----- */

function TimeTableStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TimetableHome" component={TimeTableScreen} options={{ title: "Timetable" }} />
    </Stack.Navigator>
  );
}

function LeaveStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LeaveHome" component={LeaveScreen} options={{ title: "Leave" }} />
    </Stack.Navigator>
  );
}

function AlertsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AlertsHome" component={AlertsScreen} options={{ title: "Alerts" }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: "Profile" }} />
    </Stack.Navigator>
  );
}

/* ----- Main App Navigator ----- */

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#f5f6fa", // 👈 your screen bg color
  },
};

export default function AppNavigator({ onLogout }) {

  const { logout } = AppStates();

  useEffect(() => {
    if(logout && onLogout) {
      onLogout();
    }
  }, [logout])
  
  return (
    <NavigationContainer theme={AppTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          lazy: true,
          freezeOnBlur: true,
          detachInactiveScreens: true,

          tabBarStyle: {
            height: 112,
            paddingHorizontal: 10
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            switch (route.name) {
              case "Timetable":
                iconName = "calendar-outline";
                break;
              case "Leave":
                iconName = "document-text-outline";
                break;
              case "Alerts":
                iconName = "notifications-outline";
                break;
              case "Profile":
                iconName = "person-outline";
                break;
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

          tabBarActiveTintColor: "#4F6EF7",//"#4F6EF7",
          tabBarInactiveTintColor: "#444",

          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color: "#444",
                fontWeight: focused ? "700" : "500",
                fontSize: 14,
                marginTop: 10
              }}
            >
              {route.name}
            </Text>
          ),

          tabBarButton: (props) => (
            <Pressable {...props} android_ripple={null} />
          ),

        })}
      >
        <Tab.Screen name="Timetable" component={TimeTableStack} />
        <Tab.Screen name="Leave" component={LeaveStack} />
        <Tab.Screen name="Alerts" component={AlertsStack} />
        <Tab.Screen name="Profile" component={ProfileStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}