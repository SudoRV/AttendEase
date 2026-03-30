import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import messaging from '@react-native-firebase/messaging';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppStates } from "../context/AppStates";
import Auth from "../components/Auth";

export default function ProfileScreen() {
  const { userData, setUserData, buildUrl } = AppStates();

  // --- NEW STATES FOR PASSWORD LOGIC ---
  const [modalVisible, setModalVisible] = useState(false);
  const [authMode, setAuthMode] = useState(""); // "change" or "reset"
  const [loading, setLoading] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Request OTP, 2: Submit New Pass

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: ""
  });

  if (!userData || !userData.email) {
    return <Auth />;
  }

  // --- EXISTING LOGOUT LOGIC ---
  async function logout() {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await messaging().deleteToken();
            await AsyncStorage.clear();
            setUserData(null);
          } catch (err) {
            Alert.alert("Error", "Failed to logout.");
          }
        }
      }
    ]);
  }

  // --- NEW PASSWORD LOGIC ---

  const handlePasswordAction = async () => {
    // Basic validation
    if (authMode === "change" || (authMode === "reset" && resetStep === 2)) {
      if (form.newPassword !== form.confirmPassword) {
        return Alert.alert("Error", "Passwords do not match!");
      }
      if (form.newPassword.length < 6) {
        return Alert.alert("Error", "Password must be at least 6 characters.");
      }
    }

    setLoading(true);

    try {
      if (authMode === "change") {
        // CHANGE PASSWORD CALL
        const response = await fetch(buildUrl("/reset-password"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userData.email,
            old_password: form.oldPassword,
            new_password: form.newPassword,
            type: "change"
          }),
        });

        const result = await response.json();

        if (response.ok) {
          Alert.alert("Success", "Password changed successfully. Please login again.", [
            { text: "OK", onPress: () => setUserData(null) }
          ]);
          closeModals();
        } else {
          Alert.alert("Failed", result.message || "Could not change password.");
        }
      } else if (authMode === "reset") {
        if (resetStep === 1) {
          // REQUEST RESET (SEND OTP)
          const response = await fetch(buildUrl("/reset-password"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userData?.email, type: "request_otp" }),
          });

          if (response.ok) {
            Alert.alert("OTP Sent", "Check your email for the recovery code.");
            setResetStep(2);
          } else {
            const data = await response.text();
            console.log(data)
            Alert.alert("Error", "Failed to send OTP.  | " + data);
          }
        } else {
          // SUBMIT RESET WITH OTP
          const response = await fetch(buildUrl("/reset-password"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userData.email,
              otp: form.otp,
              new_password: form.newPassword,
              type: "verify_reset"
            }),
          });

          if (response.ok) {
            Alert.alert("Success", "Account recovered! Please login with your new password.", [
              { text: "OK", onPress: () => setUserData(null) }
            ]);
            closeModals();
          } else {
            Alert.alert("Error", "Invalid OTP or request failed.");
          }
        }
      }
    } catch (error) {
      Alert.alert("Error", "Internal server error." + error);
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setModalVisible(false);
    setResetStep(1);
    setLoading(false);
    setForm({ oldPassword: "", newPassword: "", confirmPassword: "", otp: "" });
  };

  return (
    <View className="flex-1 bg-slate-100">
      <StatusBar
        barStyle="light-content"
        backgroundColor="rgba(0,0,0,0.2)"
        translucent={true}
        animated={true}
      />

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
                <Ionicons name="person" size={48} color="white" />
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

        {/* 🔹 SECURITY SETTINGS (LAST) */}
        <GlassCard title="Security Settings" icon="shield-checkmark-outline">
          <TouchableOpacity
            onPress={() => { setAuthMode("change"); setModalVisible(true); }}
            className="flex-row justify-between items-center py-3 border-b border-slate-100"
          >
            <Text className="text-slate-600 font-medium">Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#6366F1" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setAuthMode("reset"); setModalVisible(true); }}
            className="flex-row justify-between items-center py-3"
          >
            <Text className="text-slate-600 font-medium">Reset Password</Text>
            <Ionicons name="refresh-circle-outline" size={22} color="#6366F1" />
          </TouchableOpacity>
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

      {/* 🛠 SECURITY MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModals}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] p-8 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-slate-800">
                {authMode === "change" ? "Change Password" : "Reset Password"}
              </Text>
              <TouchableOpacity onPress={closeModals}>
                <Ionicons name="close-circle" size={32} color="#CBD5E1" />
              </TouchableOpacity>
            </View>

            {/* CHANGE PASSWORD FLOW */}
            {authMode === "change" && (
              <View className="gap-y-4">
                <View className="bg-slate-100 rounded-2xl px-4 flex-row items-center border border-slate-200">
                  <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
                  <TextInput
                    placeholder="Old Password"
                    secureTextEntry
                    className="flex-1 py-4 ml-3"
                    onChangeText={(val) => setForm({ ...form, oldPassword: val })}
                  />
                </View>
                <View className="bg-slate-100 rounded-2xl px-4 flex-row items-center border border-slate-200">
                  <Ionicons name="key-outline" size={20} color="#64748B" />
                  <TextInput
                    placeholder="New Password"
                    secureTextEntry
                    className="flex-1 py-4 ml-3"
                    onChangeText={(val) => setForm({ ...form, newPassword: val })}
                  />
                </View>
                <View className="bg-slate-100 rounded-2xl px-4 flex-row items-center border border-slate-200">
                  <Ionicons name="checkmark-circle-outline" size={20} color="#64748B" />
                  <TextInput
                    placeholder="Confirm New Password"
                    secureTextEntry
                    className="flex-1 py-4 ml-3"
                    onChangeText={(val) => setForm({ ...form, confirmPassword: val })}
                  />
                </View>
                <TouchableOpacity
                  disabled={loading}
                  onPress={handlePasswordAction}
                  className="bg-indigo-600 py-4 rounded-2xl mt-2 items-center"
                >
                  {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Update Password</Text>}
                </TouchableOpacity>
              </View>
            )}

            {/* RESET PASSWORD FLOW */}
            {authMode === "reset" && (
              <View className="gap-y-4">
                {resetStep === 1 ? (
                  <>
                    <Text className="text-slate-500 text-center leading-5 mb-2">
                      We will send a one-time password to your registered email to verify your identity.
                    </Text>
                    <TouchableOpacity
                      disabled={loading}
                      onPress={handlePasswordAction}
                      className="bg-indigo-600 py-4 rounded-2xl items-center"
                    >
                      {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Send OTP</Text>}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View className="bg-slate-100 rounded-2xl px-4 flex-row items-center border border-slate-200">
                      <Ionicons name="mail-outline" size={20} color="#64748B" />
                      <TextInput
                        placeholder="Enter OTP"
                        keyboardType="number-pad"
                        className="flex-1 py-4 ml-3"
                        onChangeText={(val) => setForm({ ...form, otp: val })}
                      />
                    </View>
                    <View className="bg-slate-100 rounded-2xl px-4 flex-row items-center border border-slate-200">
                      <Ionicons name="key-outline" size={20} color="#64748B" />
                      <TextInput
                        placeholder="New Password"
                        secureTextEntry
                        className="flex-1 py-4 ml-3"
                        onChangeText={(val) => setForm({ ...form, newPassword: val })}
                      />
                    </View>
                    <View className="bg-slate-100 rounded-2xl px-4 flex-row items-center border border-slate-200">
                      <Ionicons name="checkmark-circle-outline" size={20} color="#64748B" />
                      <TextInput
                        placeholder="Confirm Password"
                        secureTextEntry
                        className="flex-1 py-4 ml-3"
                        onChangeText={(val) => setForm({ ...form, confirmPassword: val })}
                      />
                    </View>
                    <TouchableOpacity
                      disabled={loading}
                      onPress={handlePasswordAction}
                      className="bg-indigo-600 py-4 rounded-2xl mt-2 items-center"
                    >
                      {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Reset Password</Text>}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
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