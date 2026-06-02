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
      className="dark:bg-neutral-900 mt-4"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1 items-center justify-center px-6 py-10">

        {/* CONTAINER CARD */}
        <View className="w-full bg-white dark:bg-neutral-950/60 rounded-[32px] p-7 shadow-sm border border-zinc-100 dark:border-neutral-800/60">

          {/* Header */}
          <Text className="text-2xl font-bold text-zinc-900 dark:text-neutral-100 text-center tracking-tight">
            You’re not signed in
          </Text>

          <Text className="text-zinc-400 dark:text-neutral-400 text-center text-sm font-medium mt-2">
            This page is available only to logged-in users.
            Please sign in to continue.
          </Text>

          <View className="h-px bg-zinc-100 dark:bg-neutral-800 my-6" />

          {/* About */}
          <Text className="text-lg font-bold text-zinc-900 dark:text-neutral-100 tracking-tight">
            About this app
          </Text>

          <Text className="text-zinc-500 dark:text-neutral-400 text-sm mt-2 leading-relaxed font-medium">
            This platform helps students and teachers stay updated with
            daily timetables, class announcements, leave management,
            and important academic notifications. All information is
            personalized based on your role.
          </Text>

          {/* Features */}
          <Text className="text-lg font-bold text-zinc-900 dark:text-neutral-100 mt-6 tracking-tight">
            What you can access after login
          </Text>

          {/* Native flexbox gap replacing legacy space-y */}
          <View className="mt-3 gap-y-2">
            <Text className="text-zinc-500 dark:text-neutral-400 text-sm font-medium">• Daily class timetable and updates</Text>
            <Text className="text-zinc-500 dark:text-neutral-400 text-sm font-medium">• Announcements and substitutions</Text>
            <Text className="text-zinc-500 dark:text-neutral-400 text-sm font-medium">• Leave requests and approvals</Text>
            <Text className="text-zinc-500 dark:text-neutral-400 text-sm font-medium">• Exam schedules and notifications</Text>
          </View>

          {/* Action Buttons */}
          <View className="mt-8 flex-col gap-y-3">

            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-zinc-900 dark:bg-blue-600 py-4 rounded-2xl items-center shadow-sm"
              onPress={() => navigation.navigate("Profile")}
            >
              <Text className="text-white font-bold tracking-wide">
                Go to Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              className="border border-zinc-200 dark:border-neutral-800 py-4 rounded-2xl items-center bg-zinc-50/30 dark:bg-neutral-900/30"
            >
              <Text className="text-zinc-900 dark:text-neutral-200 font-bold tracking-wide">
                Help & Support
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              className="border border-zinc-200 dark:border-neutral-800 py-4 rounded-2xl items-center bg-zinc-50/30 dark:bg-neutral-900/30"
            >
              <Text className="text-zinc-900 dark:text-neutral-200 font-bold tracking-wide">
                Learn More
              </Text>
            </TouchableOpacity>

          </View>

          <Text className="text-zinc-400 dark:text-neutral-500 text-sm text-center mt-6 leading-relaxed font-medium">
            If you believe this is a mistake, please contact your institution administrator.
          </Text>

        </View>
      </View>
    </ScrollView>
  );
}