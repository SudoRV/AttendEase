import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Announce from "../components/Announce";
import Announcements from "../components/Announcements";
import NotSignedIn from "../components/NotSignedIn";
import { AppStates } from "../context/AppStates";
import { getMessaging, onMessage } from '@react-native-firebase/messaging';

const AlertsScreen = () => {
  const { userData, buildUrl } = AppStates();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (userData?.role !== "Teacher") {
      loadAnnouncements(userData);
    }

    const messagingInstance = getMessaging();
    // 2. Set up the foreground listener
    const unsubscribe = onMessage(messagingInstance, async (remoteMessage) => {
      if (userData.role !== "Teacher") {
        loadAnnouncements();
      }
    });

    // 3. Clean up the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [userData])

  const loadAnnouncements = async (userData) => {
    if (!userData?.year) return;

    try {
      const endpoint = `/announcements?year=${userData.year}&branch=${userData.branch_id}&section=${userData.section}`;
      
      const response = await fetch(buildUrl(endpoint));
      const json = await response.json();
      
      if (json?.data) setAnnouncements(json.data);
    } catch (err) {
      console.log("Announcements error:", err);
    }
  };

  if (userData?.role === "Student") {
    return <Announcements announcements={announcements} />;
  }

  if (userData?.role === "Teacher") {
    return <Announce />;
  }

  return <NotSignedIn />;
};

export default AlertsScreen;