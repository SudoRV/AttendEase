import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from "react-native";

import GradientWrapper from "./ui/LinearGradient";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppStates, database } from "../context/AppStates";

const Announcements = ({ type, announcements, loadAnnouncements }) => {
  const { userData, database } = AppStates();

  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  // --- LOCAL NOTIFICATION STATES ---
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Load notifications from local SQLite database storage
  const loadLocalNotifications = async () => {
    if (!database) return;
    setLoadingNotifications(true);

    try {
      // 1. Run the query directly via await
      const results = await database.execute(
        "SELECT * FROM notifications ORDER BY received_at DESC",
        []
      );

      // Extracts the native array from inside your specific object structure
      let rows = [];

      if (results?.rows?._array) {
        // 1. Fastest extraction method if _array contains your objects
        rows = results.rows._array;
      } else if (results?.rows?.length > 0) {
        // 2. Safe fallback loop utilizing the .item() function mapped in your log
        for (let i = 0; i < results.rows.length; i++) {
          rows.push(results.rows.item(i));
        }
      }

      setNotifications(rows);
    } catch (error) {
      console.error("Failed fetching SQLite notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Mark all entries as read within transactional state
  const markAllAsRead = async () => {
    if (!database || notifications.length === 0) return;

    try {
      // Execute the UPDATE query directly using await
      await database.execute(
        "UPDATE notifications SET is_read = 1 WHERE is_read = 0",
        []
      );

      // Refresh your feed state instantly after the database update finishes
      await loadLocalNotifications();
    } catch (error) {
      console.error("Failed executing SQLite update state transaction:", error);
    }
  };

  async function clearAllNotifications() {
    if (!database) return;

    try {
      // Executes a clean DELETE query to wipe the entire table structure
      const result = await database.execute(
        "DELETE FROM notifications",
        []
      );

      // Refresh your feed state instantly after the database update finishes
      await loadLocalNotifications();
      return result;
    } catch (error) {
      console.error("Failed executing SQLite delete transaction:", error);
      throw error;
    }
  }

  useEffect(() => {
    if (notificationModalVisible) {
      loadLocalNotifications();
    }
  }, [notificationModalVisible]);

  const renderItem = ({ item }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <GradientWrapper
        colors={["#4F46E5", "#7C3AED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginBottom: 16,
          borderRadius: 20,
          padding: 16,
          shadowColor: "#4F46E5",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5
        }}
      >
        <View className="flex-row justify-between items-start gap-2">
          <View className="flex-1 mr-2">
            <Text className="text-xl font-bold text-white tracking-tight">
              {item.title}
            </Text>
          </View>

          {item.scope === "teachers" && (
            <View className="bg-red-500/80 px-2 py-0.5 rounded-full">
              <Text className="text-[10px] text-white font-bold uppercase">for teachers</Text>
            </View>
          )}

          {item?.created_by?.id === userData?.teacher_id && (
            <View className="bg-green-500/80 px-2 py-0.5 rounded-full">
              <Text className="text-[10px] text-white font-bold uppercase">by you</Text>
            </View>
          )}

          <View className="bg-white/20 p-2 rounded-lg">
            <Ionicons name="notifications-outline" size={18} color="white" />
          </View>
        </View>

        <Text className="text-indigo-50 mt-1 leading-5 text-base opacity-90">
          {item.body}
        </Text>

        <View className="h-[1px] bg-white/10 my-4" />

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full bg-white/30 items-center justify-center">
              <Ionicons name="person" size={12} color="white" />
            </View>
            <Text className="text-sm font-medium text-white">
              {item.created_by?.name || "Admin"}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text className="text-sm text-indigo-100 font-light">
              {formattedDate}
            </Text>
          </View>
        </View>
      </GradientWrapper>
    );
  };

  return (
    <View className={`flex-1 px-4 py-3 ${type === "announcer" ? "pt-4" : "pt-14"}`}>

      {/* Header Container Layout Row */}
      <View className="flex-row justify-between items-center mb-6">
        {type !== "announcer" && (
          <Text className="text-3xl font-bold text-slate-800 dark:text-neutral-300 tracking-tight">
            Announcements
          </Text>
        )}

        {/* NOTIFICATION BUTTON TOGGLE TRIGGER */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setNotificationModalVisible(true)}
          className="ml-auto bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm"
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={announcements}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center">
            <Text className="text-slate-400 font-medium py-20">
              No announcements available
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}

        refreshControl={
          <RefreshControl
            refreshing={loadingAnnouncements}
            onRefresh={async () => {
              await loadAnnouncements(userData);
            }}
            // 🌟 Change this numeric value to push the loader down to your exact desired position
            progressViewOffset={-30}
            tintColor="#4F46E5" // Indigo color for iOS spinner
            colors={["#4F46E5"]} // Indigo color loop for Android spinner
          />
        }
      />


      {/* 🔔 LOCAL NOTIFICATIONS MODAL SHEET */}
      <Modal
        visible={notificationModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        {/* Root layout canvas wrapper responds dynamically to app styling variables */}
        <View className="flex-1 bg-white dark:bg-neutral-900">
          <View className="flex-1 p-4 py-3 pb-2">

            {/* Modal Header */}
            <View className="flex-row justify-between items-center pb-4 border-b border-slate-100 dark:border-neutral-800/60 mb-4">
              <View>
                <Text className="text-2xl font-extrabold text-slate-800 dark:text-neutral-50 tracking-tight">Notifications</Text>
                <Text className="text-slate-400 dark:text-neutral-400">Captured notification & alerts</Text>
              </View>

              <View className="flex-row items-center gap-2.5">
                <TouchableOpacity onPress={() => setNotificationModalVisible(false)} className="p-1 active:opacity-80">
                  <Ionicons name="close-circle" size={32}  color={"#ccc"} className="dark:!text-neutral-300" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Notification Items List Loader Container */}
            {loadingNotifications ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#4F46E5" />
              </View>
            ) : (
              <View className="w-full flex-1">

                {/* Action Header Controls Row */}
                <View className="w-full flex-row justify-end gap-2">
                  {notifications.some(n => n.is_read === 0) && (
                    <TouchableOpacity
                      onPress={markAllAsRead}
                      className="bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl mb-4 active:opacity-80"
                    >
                      <Text className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Mark all read</Text>
                    </TouchableOpacity>
                  )}

                  {notifications.length > 0 && (
                    <TouchableOpacity
                      onPress={clearAllNotifications}
                      className="bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-xl mb-4 active:opacity-80"
                    >
                      <Text className="text-sm font-bold text-red-500 dark:text-red-400">Clear all</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <FlatList
                  data={notifications}
                  keyExtractor={(item) => String(item.id)}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 24 }}
                  ListEmptyComponent={
                    <View className="flex-1 items-center justify-center py-[60%]">
                      <Ionicons name="notifications-off-outline" size={48} color="#ccc" className="dark:!text-neutral-300" />
                      <Text className="text-gray-500 dark:text-neutral-400 text-base mt-3 font-semibold">No recent activity updates found</Text>
                    </View>
                  }
                  renderItem={({ item }) => {
                    const logDate = new Date(item.received_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'short',
                      day: 'numeric'
                    });

                    return (
                      <View
                        className={`p-4 rounded-2xl mb-3 border flex-row items-start gap-3 ${item.is_read === 0
                            ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100/80 dark:border-indigo-900/40"
                            : "bg-slate-50/60 dark:bg-neutral-950/40 border-slate-100/80 dark:border-neutral-800/60"
                          }`}
                      >
                        {/* Status Source Badge Circle */}
                        <View className={`p-2 rounded-xl mt-0.5 ${item.source === 'BLE' ? 'bg-teal-100/60 dark:bg-teal-950/40' : 'bg-amber-100/60 dark:bg-amber-950/40'}`}>
                          <Ionicons
                            name={item.source === 'BLE' ? 'bluetooth' : 'cloud-done-outline'}
                            size={16}
                            color={item.source === 'BLE' ? '#0f766e' : '#b45309'}
                          />
                        </View>

                        {/* Body Copy Block */}
                        <View className="flex-1 space-y-1">
                          <View className="flex-row justify-between items-center w-full">
                            <Text className={`text-lg tracking-tight flex-1 mr-2 ${item.is_read === 0 ? 'font-bold text-slate-800 dark:text-neutral-50' : 'font-semibold text-slate-600 dark:text-neutral-300'}`}>
                              {item.title || "Broadcast Trigger"}
                            </Text>
                            {item.is_read === 0 && (
                              <View className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-blue-400" />
                            )}
                          </View>

                          <Text className="text-sm text-slate-500 dark:text-neutral-400">
                            {item.body}
                          </Text>

                          <Text className="text-[12px] text-right text-slate-400 dark:text-neutral-500 font-light pt-1">
                            {logDate}
                          </Text>
                        </View>
                      </View>
                    );
                  }}

                  refreshControl={
                    <RefreshControl
                      refreshing={loadingNotifications}
                      onRefresh={async () => {
                        await loadLocalNotifications();
                      }}
                      progressViewOffset={-50}
                      tintColor="#4F46E5"
                      colors={["#4F46E5"]}
                    />
                  }
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Announcements;