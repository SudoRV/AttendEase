import React from "react";
import {
  View,
  Text,
  FlatList
} from "react-native";

import GradientWrapper from "./ui/LinearGradient";
import Ionicons from 'react-native-vector-icons/Ionicons';

const Announcements = ({ announcements }) => {

  const renderItem = ({ item }) => {
    // Clean up the date format (e.g., "Oct 24, 10:30 AM")
    const formattedDate = new Date(item.created_at).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <GradientWrapper
        colors={["#4F46E5", "#7C3AED"]} // Slightly more vibrant Indigo to Violet
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
        {/* Header Row: Title + Icon */}
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-2">
            <Text className="text-xl font-bold text-white tracking-tight">
              {item.title}
            </Text>
          </View>
          <View className="bg-white/20 p-2 rounded-lg">
            <Ionicons name="notifications-outline" size={18} color="white" />
          </View>
        </View>

        {/* Body: Softened text for better readability */}
        <Text className="text-indigo-50 mt-1 leading-5 text-base opacity-90">
          {item.body}
        </Text>

        {/* Separator Line */}
        <View className="h-[1px] bg-white/10 my-4" />

        {/* Footer: Multi-column layout */}
        <View className="flex-row justify-between items-center">
          {/* Author */}
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full bg-white/30 items-center justify-center">
              <Ionicons name="person" size={12} color="white" />
            </View>
            <Text className="text-sm font-medium text-white">
              {item.created_by?.name || "Admin"}
            </Text>
          </View>

          {/* Timestamp */}
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
    <View className="flex-1 bg-slate-100 px-4 py-3 pt-12">

      {/* Header */}
      <Text className="text-3xl font-semibold mb-6">
        Announcements
      </Text>

      {/* List */}
      <FlatList
        data={announcements}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}

        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-10">
            <Text className="text-gray-500">
              No announcements available
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {
        (announcements.length < 2) && (
          <View className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <Text className="text-lg font-medium text-gray-700 mb-1">
              About Announcements
            </Text>

            <Text className="text-gray-600 mb-1">
              • Important notices from teachers & administration
            </Text>
            <Text className="text-gray-600 mb-1">
              • Updates automatically when published
            </Text>
            <Text className="text-gray-600 mb-1">
              • Notifications are sent for urgent updates
            </Text>

            <Text className="mt-2 text-gray-500 mb-2">
              In case of any mismatch, official circulars take priority.
            </Text>
          </View>
        )
      }

    </View>
  );
};

export default Announcements;