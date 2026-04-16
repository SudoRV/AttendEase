import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppStates } from "../context/AppStates";

export default function NotSignedIn() {
  const navigation = useNavigation();

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-neutral-100 mt-4"
    >
      <View className="flex-1 items-center justify-center px-5 py-10">

        <View className="w-full bg-white rounded-2xl p-6 shadow-md">

          {/* Header */}
          <Text className="text-xl font-semibold text-neutral-900 text-center">
            You’re not signed in
          </Text>

          <Text className="text-neutral-600 text-center mt-2">
            This page is available only to logged-in users.
            Please sign in to continue.
          </Text>

          <View className="h-px bg-neutral-200 my-6" />

          {/* About */}
          <Text className="text-lg font-semibold text-neutral-900">
            About this app
          </Text>

          <Text className="text-neutral-600 mt-2 leading-6">
            This platform helps students and teachers stay updated with
            daily timetables, class announcements, leave management,
            and important academic notifications. All information is
            personalized based on your role.
          </Text>

          {/* Features */}
          <Text className="text-lg font-semibold text-neutral-900 mt-6">
            What you can access after login
          </Text>

          <View className="mt-3 space-y-2">
            <Text className="text-neutral-700">• Daily class timetable and updates</Text>
            <Text className="text-neutral-700">• Announcements and substitutions</Text>
            <Text className="text-neutral-700">• Leave requests and approvals</Text>
            <Text className="text-neutral-700">• Exam schedules and notifications</Text>
          </View>

          {/* Buttons */}
          <View className="mt-8 flex-col gap-4">

            <TouchableOpacity
              className="bg-indigo-600 py-3 rounded-xl items-center"
              onPress={() => navigation.navigate("Profile")}
            >
              <Text className="text-white font-semibold">
                Go to Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-neutral-300 py-3 rounded-xl items-center"
            >
              <Text className="text-neutral-700 font-medium">
                Help & Support
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-neutral-300 py-3 rounded-xl items-center"
            >
              <Text className="text-neutral-700 font-medium">
                Learn More
              </Text>
            </TouchableOpacity>

          </View>

          <Text className="text-neutral-500 text-sm text-center mt-6">
            If you believe this is a mistake, please contact your institution administrator.
          </Text>

        </View>
      </View>
    </ScrollView>
  );
}