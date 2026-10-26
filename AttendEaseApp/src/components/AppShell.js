import React, { useState, useEffect } from "react";
import { View, Vibration, StatusBar } from "react-native";
import Sound from 'react-native-sound';
import AppNavigator from "../navigation/AppNavigator";
import PopupNotification from "./ui/PopupNotification";
import { useColorScheme } from "nativewind";
import { AppStates } from "../context/AppStates";

// Firebase imports
import { getMessaging, onMessage } from '@react-native-firebase/messaging';

export default function AppShell({ handleLogout }) {
    const { user } = AppStates()
    const [notification, setNotification] = useState(null);
    const { colorScheme } = useColorScheme();
    const messagingInstance = getMessaging();

    // useEffect(() => {
    //     // Listen for foreground messages
    //     const unsubscribe = onMessage(messagingInstance, async (remoteMessage) => {
    //         // play sound
    //         const popSound = new Sound('notification.mp3', Sound.MAIN_BUNDLE, (error) => {
    //             if (error) console.log(error)
    //             if (!error) {
    //                 popSound.play(() => popSound.release());
    //             }
    //         });

    //         // 2. TRIGGER THE VIBRATION
    //         const longPattern = [0, 600, 200, 600];
    //         Vibration.vibrate(longPattern);

    //         // Trigger the popup
    //         setNotification({
    //             title: remoteMessage?.data?.title || remoteMessage.notification?.data?.title || "New Update",
    //             body: remoteMessage.notification?.body || remoteMessage?.data?.body || "Open AttendEase for more info."
    //         });
    //     });

    //     // setNotification({title: "sample", body: "testing"})
        
    //     return () => {
    //         unsubscribe();
    //     };

    // }, [user]);

    return (
        <View className="flex-1">
            <StatusBar
                barStyle={colorScheme === "dark" ? "light" : "dark-content"}
                backgroundColor="transparent"
                translucent={true}
                animated={true}
            />

            <AppNavigator onLogout={handleLogout} />

            {/* GLOBAL POPUP */}
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