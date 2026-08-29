import React, { useState } from "react";
import { GlobalProvider } from "./src/context/AppStates";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDBConnection } from "./src/database/database";

import AppShell from "./src/components/AppShell";

import "./global.css";

export default function App() {
  const database = getDBConnection();
  const [sessionKey, setSessionKey] = useState(0);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user_creds");
    await AsyncStorage.removeItem("attendance_report");
    await AsyncStorage.removeItem("fcm_token");
    await AsyncStorage.removeItem("session_token");

    database.execute("delete from timetable");
    database.execute("delete from notifications");

    setSessionKey(prev => prev + 1);
  };

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