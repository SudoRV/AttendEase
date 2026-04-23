import React, { useState, useEffect, RootProvider } from "react";
import { View, Vibration, StatusBar } from "react-native";
import Sound from 'react-native-sound';
import AppNavigator from "./src/navigation/AppNavigator";
import { GlobalProvider } from "./src/context/AppStates";
import PopupNotification from "./src/components/ui/PopupNotification";
import notifee from '@notifee/react-native';

// Firebase imports
import { getMessaging, onMessage } from '@react-native-firebase/messaging';

import "./global.css";

const checkBattery = async () => {
  const settings = await notifee.getNotificationSettings();

  // If the user hasn't ignored battery optimizations
  if (settings.android.alarm === 0) {
    // You can open the system settings page directly for them:
    await notifee.openBatteryOptimizationSettings();
  }
};

export default function App() {
  const [notification, setNotification] = useState(null);
  const [sessionKey, setSessionKey] = useState(0);

  const handleLogout = () => {
    // console.log(sessionKey)
    setSessionKey(prev => prev + 1);
  };

  useEffect(() => {
    async function requestPermission() {
      // This triggers the system "Allow AttendEase to send notifications?" popup
      await notifee.requestPermission();
    }
    requestPermission();
    checkBattery();

    const messagingInstance = getMessaging();

    // Listen for foreground messages
    const unsubscribe = onMessage(messagingInstance, async (remoteMessage) => {
      // play sound
      const popSound = new Sound('notification.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) console.log(error)
        if (!error) {
          popSound.play(() => popSound.release());
        }
      });

      // 2. TRIGGER THE VIBRATION
      const longPattern = [0, 600, 200, 600];
      Vibration.vibrate(longPattern);

      // Trigger the popup
      setNotification({
        title: remoteMessage?.data?.title || remoteMessage.notification?.data?.title || "New Update",
        body: remoteMessage.notification?.body || remoteMessage?.data?.body || "Check your app for new info."
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="rgba(0,0,0,0.2)"
        translucent={true}
        animated={true}
      />

      {/* Your standard app tree */}
      <GlobalProvider key={sessionKey} >
        <AppNavigator onLogout={handleLogout} />
      </GlobalProvider>

      {/* 🔴 GLOBAL POPUP: Only renders if notification state exists */}
      {notification && (
        <PopupNotification
          title={notification.title}
          body={notification.body}
          onClose={() => setNotification(null)}
        />
      )}
    </View>
  );
}