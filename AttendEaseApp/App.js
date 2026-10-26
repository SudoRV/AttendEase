import React, { useState } from "react";
import { GlobalProvider } from "./src/context/AppStates";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDBConnection } from "./src/database/database";

<<<<<<< HEAD
// Firebase imports
import { getMessaging, onMessage, deleteToken } from '@react-native-firebase/messaging';
=======
import AppShell from "./src/components/AppShell";
>>>>>>> 1fa71a41be916b06753d934546128a577bf1a41a

import "./global.css";

export default function App() {
  const database = getDBConnection();
<<<<<<< HEAD
  const messagingInstance = getMessaging();

  const handleLogout = async () => {
    // console.log(sessionKey)
    await AsyncStorage.removeItem("user_creds");
    await AsyncStorage.removeItem("classes");
    await AsyncStorage.removeItem("attendance_report");
=======
  const [sessionKey, setSessionKey] = useState(0);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user_creds");
    await AsyncStorage.removeItem("attendance_report");
    await AsyncStorage.removeItem("fcm_token");
    await AsyncStorage.removeItem("session_token");
>>>>>>> 1fa71a41be916b06753d934546128a577bf1a41a

    database.execute("delete from timetable");
    database.execute("delete from notifications");

    setSessionKey(prev => prev + 1);
  };

<<<<<<< HEAD
  useEffect(() => {
    async function requestPermission() {
      // This triggers the system "Allow AttendEase to send notifications?" popup
      await notifee.requestPermission();
    }
    requestPermission();
    checkBattery();

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

=======
>>>>>>> 1fa71a41be916b06753d934546128a577bf1a41a
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GlobalProvider key={sessionKey} >
  
            <AppShell handleLogout={handleLogout} />
        
        </GlobalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}