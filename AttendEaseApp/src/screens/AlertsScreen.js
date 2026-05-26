import React, { useEffect, useState } from "react";
import { View, FlatList, Text, TouchableOpacity, RefreshControl } from "react-native";
import Announce from "../components/Announce";
import Announcements from "../components/Announcements";
import NotSignedIn from "../components/NotSignedIn";
import { AppStates } from "../context/AppStates";
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AlertsScreen = () => {
  const { userData, buildUrl, formatDate } = AppStates();
  const [announcements, setAnnouncements] = useState([]);

  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  
  // State controller to switch between viewing feed and drafting an announcement
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);

  useEffect(() => {
    if (!userData) return;
    loadAnnouncements(userData);

    const messagingInstance = getMessaging();
    // Set up the foreground notification listener
    const unsubscribe = onMessage(messagingInstance, async (remoteMessage) => {
      loadAnnouncements(userData);
    });

    return () => {
      unsubscribe();
    };
  }, [userData]);

  const loadAnnouncements = async (user) => {
    try {
      const endpoint = `/announcements?role=${user?.role || "Student"}&teacher_id=${user?.teacher_id || null}&year=${user.year || ""}&branch=${user.branch_id || ""}&section=${user.section || ""}&time=${encodeURIComponent(formatDate(new Date()))}`;
      const response = await fetch(buildUrl(endpoint));
      const json = await response.json();

      if (json?.data) setAnnouncements(json.data);
    } catch (err) {
      console.log("Announcements network fetch error:", err);
    }
  };

  // Student Layer view stays simple and decoupled
  if (userData?.role === "Student") {
    return <Announcements announcements={announcements} loadAnnouncements={loadAnnouncements} />;
  }

  // Teacher Layer view equipped with the interactive visual feature switch
  if (userData?.role === "Teacher") {
    return (
      <View className="flex-1 pt-12">
        {/* Dynamic Teacher Action Dashboard Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200 bg-white shadow-sm">
          <View>
            <Text className="text-xl font-bold text-slate-800">
              {isCreatingAnnouncement ? "Create Announcement" : "Notice Board"}
            </Text>
            <Text className="text-slate-400">
              {isCreatingAnnouncement ? "Draft notice for students" : "Review sent disclosures"}
            </Text>
          </View>

          {/* Toggle Action Button Controller */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsCreatingAnnouncement(prev => !prev)}
            className={`flex-row items-center gap-1.5 px-4 py-2.5 rounded-full shadow-sm transition-all ${
              isCreatingAnnouncement ? "bg-slate-200" : "bg-indigo-600"
            }`}
          >
            <Ionicons
              name={isCreatingAnnouncement ? "newspaper-outline" : "add-circle-outline"}
              size={18}
              color={isCreatingAnnouncement ? "#475569" : "#ffffff"}
            />
            <Text
              className={`text-sm font-bold ${
                isCreatingAnnouncement ? "text-slate-700" : "text-white"
              }`}
            >
              {isCreatingAnnouncement ? "View Feed" : "New Notice"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Display Router using FlatList container patterns to maintain performance */}
        <FlatList
          data={[1]}
          renderItem={() => (
            <View className="">
              {isCreatingAnnouncement ? (
                // When toggled active, render creation form workflow
                <Announce onSuccess={() => {
                  setIsCreatingAnnouncement(false); // Snap back to feed view automatically
                  loadAnnouncements(userData);      // Pull fresh data log
                }} />
              ) : (
                // Default view maps regular announcements history array feed
                <Announcements type={"announcer"} announcements={announcements} loadAnnouncements={loadAnnouncements} />
              )}
            </View>
          )}
          keyExtractor={(item) => String(item)}
          showsVerticalScrollIndicator={false}

          refreshControl={
            <RefreshControl
              refreshing={loadingAnnouncements}
              onRefresh={async () => {
                await loadAnnouncements(userData);
              }}
              progressViewOffset={-30} 
              tintColor="#4F46E5" // Indigo color for iOS spinner
              colors={["#4F46E5"]} // Indigo color loop for Android spinner
            />
          }
        />
      </View>
    );
  }

  return <NotSignedIn />;
};

export default AlertsScreen;