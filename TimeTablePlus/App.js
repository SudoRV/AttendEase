import React, { useState, useEffect } from "react";
import { View, Vibration, StatusBar } from "react-native";
import Sound from 'react-native-sound';
import AppNavigator from "./src/navigation/AppNavigator";
import { GlobalProvider } from "./src/context/AppStates";
import PopupNotification from "./src/components/ui/PopupNotification";
// import notifee, { AndroidImportance } from '@notifee/react-native';

// async function createNotificationChannel() {
//   await notifee.createChannel({
//     id: 'push_notification',
//     name: 'Notifications',
//     sound: 'notification',
//     importance: AndroidImportance.HIGH,
//   });
// }

// Firebase imports
import { getMessaging, onMessage } from '@react-native-firebase/messaging';

import "./global.css";

export default function App() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // create notification channel
    // createNotificationChannel();

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
      const longPattern = [0, 800, 200, 800];
      Vibration.vibrate(longPattern);

      // Trigger the popup
      setNotification({
        title: remoteMessage.notification?.title || "New Update",
        body: remoteMessage.notification?.body || "Check your app for new info."
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
      <GlobalProvider>
        <AppNavigator />
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