import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppStates } from "../context/AppStates";
import Auth from "../components/Auth";

export default function ProfileScreen() {
  const { userData, setUserData } = AppStates();

  if (!userData || !userData.email) {
    return <Auth />;
  }

  async function logout() {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("user");
            setUserData(null);
          } catch (err) {
            Alert.alert("Error", "Failed to logout.");
          }
        }
      }
    ]);
  }

  return (
    <View className="flex-1 bg-slate-100">

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>

        {/* 🔥 GRADIENT HEADER */}
        <LinearGradient
          colors={["#4F46E5", "#6366F1"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingTop: 64,
            paddingBottom: 40,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}
        >
          <View className="items-center">

            <View className="w-28 h-28 rounded-full bg-white/20 backdrop-blur items-center justify-center overflow-hidden border-4 border-white/30">
              {userData?.avatar ? (
                <Text>user</Text>
              ) : (
                <Ionicons
                  name="person"
                  size={48}
                  color="white"
                />
              )}
            </View>

            <Text className="text-3xl font-bold text-white text-center mt-4">
              {userData?.name || "User"}
            </Text>

            <Text className="text-indigo-100 text-base mt-1">
              {userData?.email}
            </Text>

            <View className="mt-3 bg-white/20 px-4 py-1 rounded-full">
              <Text className="text-white font-medium text-sm">
                {userData?.role}
              </Text>
            </View>

          </View>
        </LinearGradient>

        {/* 🔹 ACADEMIC */}
        <GlassCard title="Academic Information" icon="school-outline">
          {userData?.role === "Student" ? (
            <>
              <InfoRow label="Year" value={userData?.year} />
              <InfoRow label="Branch" value={userData?.branch} />
              <InfoRow label="Section" value={userData?.section} />
              <InfoRow label="Student ID" value={userData?.student_id} />
            </>
          ) : (
            <>
              <InfoRow label="Teacher ID" value={userData?.teacher_id} />
              <InfoRow label="Department" value={userData?.branch} />
            </>
          )}
        </GlassCard>

        {/* 🔹 ACCOUNT */}
        <GlassCard title="Account Details" icon="person-circle-outline">
          <InfoRow label="Email" value={userData?.email} />
          <InfoRow label="Role" value={userData?.role} />
        </GlassCard>

      </ScrollView>

      {/* 🔴 LOGOUT BUTTON */}
      <View className="px-5 pb-6">
        <TouchableOpacity
          onPress={logout}
          className="bg-white py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-md"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-red-500 text-base font-semibold">
            Logout
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

/* ===================== */
/* GLASS CARD */
/* ===================== */

function GlassCard({ title, icon, children }) {
  return (
    <View className="mx-5 mt-6 bg-white/80 backdrop-blur p-5 rounded-3xl shadow-lg border border-white/40">

      <View className="flex-row items-center mb-4 gap-2">
        <Ionicons name={icon} size={28} color="#4F46E5" />
        <Text className="text-lg font-semibold text-slate-800">
          {title}
        </Text>
      </View>

      {children}
    </View>
  );
}

/* ===================== */
/* INFO ROW */
/* ===================== */

function InfoRow({ label, value }) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-slate-200 last:border-b-0">
      <Text className="text-base text-slate-500">
        {label}
      </Text>
      <Text
        numberOfLines={1}
        className="text-base font-semibold text-slate-900 max-w-[60%] text-right"
      >
        {value || "-"}
      </Text>
    </View>
  );
}