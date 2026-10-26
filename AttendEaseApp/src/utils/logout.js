import { getMessaging, deleteToken } from '@react-native-firebase/messaging';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fetch } from "../services/api";
import { Alert } from "react-native";

export default async function logout(setLoading, user) {
    if (setLoading) setLoading(true);
    const messagingInstance = getMessaging();
    const token = await AsyncStorage.getItem("fcm_token");
    console.log(token)
    
    // ask for logout 
    const res = await Fetch("/api/auth/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({token: token})
    });
    const response = await res.json();
    const loggedOut = response.success;
    console.log(response)

    if (loggedOut) {
        try {
            await deleteToken(messagingInstance);
        } catch (tokenErr) {
            console.log("Push Token release warning:", tokenErr);
        }

        await AsyncStorage.clear();
        await new Promise(resolve => setTimeout(resolve, 1200));
        Alert.alert("AttendEase", response.message);
        if (setLoading) setLoading(false);
    };
}