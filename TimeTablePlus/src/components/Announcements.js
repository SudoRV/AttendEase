import React from "react";
import {
  View,
  Text,
  FlatList
} from "react-native";

import GradientWrapper from "./ui/LinearGradient";

const Announcements = ({ announcements }) => {

  const renderItem = ({ item }) => (
    <GradientWrapper
      colors={["#4338CA", "#8487f5"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{marginBottom: 12}}
    >
      {/* Title */}
      <Text className="text-lg font-semibold text-white">
        {item.title}
      </Text>

      {/* Body */}
      <Text className="text-white mt-1">
        {item.body}
      </Text>

      {/* Footer */}
      <View className="mt-3 gap-1">
        <Text className="text-sm text-gray-200">
          <Text className="font-medium">By: </Text>
          {item.created_by?.name}
        </Text>

        <Text className="text-sm text-white">
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
    </GradientWrapper>
  );

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