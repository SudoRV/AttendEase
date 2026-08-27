import React, { useEffect, useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { AppStates } from "../context/AppStates";
import Auth from "../components/Auth";
import BleToggle from "../components/BleToggle";
import Logout from "../utils/logout";

import { Fetch } from "../services/api";

export default function ProfileScreen() {
  const navigator = useNavigation();
  const { userData, setUserData, setLogout, bleOn, setBleOn, themePreference, updateTheme } = AppStates();

  // --- LOGOUT LOADING STATE ---
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // --- PASSWORD ACTION STATES ---
  const [modalVisible, setModalVisible] = useState(false);
  const [authMode, setAuthMode] = useState(""); // "change" or "reset"
  const [loading, setLoading] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Request OTP, 2: Submit New Pass

  // --- PASSWORD VISIBILITY TOGGLE STATES ---
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: ""
  });

  if (!userData || !userData.email) {
    return <Auth />;
  }

  // --- UPDATED LOGOUT METHOD WITH TRANSITION HOOKS ---
  async function logout() {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true); // Engages the global visual loading screen layer
          try {
            await Logout();
            setUserData(null);
            navigator.navigate("Profile");
            setLogout(true);
          } catch (err) {
            Alert.alert("Error", "Failed to clear terminal identity profile: " + err);
          } finally {
            setIsLoggingOut(false);
          }
        }
      }
    ]);
  }

  // --- PASSWORD MANIPULATION CRUD ---
  const handlePasswordAction = async () => {
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
        const response = await Fetch("/api/auth/password", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userData.email,
            old_password: form.oldPassword,
            new_password: form.newPassword,
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
          const response = await Fetch("/api/auth/password/reset/request-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userData?.email }),
          });
          const resData = await response.json();

          if (response.ok) {
            Alert.alert("OTP Sent", "Check your email for the recovery code.");
            setResetStep(2);
          } else {
            Alert.alert("Error", resData.message);
          }
        } else {
          const response = await Fetch("/api/auth/password/reset/otp-verification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userData.email,
              otp: form.otp,
              new_password: form.newPassword,
            }),
          });
          const resData = await response.json();

          if (response.ok) {
            Alert.alert("Success", "Account recovered! Please login with your new password.", [
              { text: "OK", onPress: () => setUserData(null) }
            ]);
            closeModals();
          } else {
            Alert.alert("Error", resData.message);
          }
        }
      }
    } catch (error) {
      Alert.alert("Error", "Internal server error. " + error);
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setModalVisible(false);
    setResetStep(1);
    setLoading(false);
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setForm({ oldPassword: "", newPassword: "", confirmPassword: "", otp: "" });
  };

  return (
    <View className="flex-1">
      <StatusBar
        barStyle="light-content"
        backgroundColor="rgba(0,0,0,0.2)"
        translucent={true}
        animated={true}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* GRADIENT HEADER */}
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

            <View className="my-2 bg-white/20 px-4 py-1 rounded-full">
              <Text className="text-indigo-100 font-bold">{userData?.role} @</Text>
            </View>
            <Text className="text-indigo-50 text-base text-center font-medium">
              {userData?.college_name}
            </Text>
          </View>
        </LinearGradient>

        {/* ACADEMIC */}
        <GlassCard title="Academic Information" icon="school-outline">
          {userData?.role === "Student" ? (
            <>
              <InfoRow label="Course" value={userData?.course_name} />
              <InfoRow label="Branch" value={userData?.branch_id} />
              <InfoRow label="Year" value={userData?.year} />
              <InfoRow label="Semester" value={userData?.semester} />
              <InfoRow label="Section" value={userData?.section} />
            </>
          ) : (
            <>
              <InfoRow label="Teacher ID" value={userData?.teacher_id} />
            </>
          )}
        </GlassCard>

        {/* ACCOUNT */}
        <GlassCard title="Account Details" icon="person-circle-outline">
          <InfoRow label="Role" value={userData?.role} />
          <InfoRow label="ID" value={userData?.student_id || userData?.teacher_id} />
          <InfoRow label="Email" value={userData?.email} />
        </GlassCard>

        {/* SECURITY SETTINGS */}
        <GlassCard title="Security Settings" icon="shield-checkmark-outline">
          <TouchableOpacity
            onPress={() => { setAuthMode("change"); setModalVisible(true); }}
            className="flex-row justify-between items-center py-3 border-b border-slate-100 dark:border-neutral-600"
          >
            <Text className="text-slate-600 dark:text-neutral-300 font-medium">Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#6366F1" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setAuthMode("reset"); setModalVisible(true); }}
            className="flex-row justify-between items-center py-3"
          >
            <Text className="text-slate-600 dark:text-neutral-300 font-medium">Reset Password</Text>
            <Ionicons name="refresh-circle-outline" size={22} color="#6366F1" />
          </TouchableOpacity>
        </GlassCard>

        {/* BLE Mesh */}
        <GlassCard title="BLE Mesh Technology" icon="bluetooth">
          <BleToggle bleOn={bleOn} setBleOn={setBleOn} />
        </GlassCard>

        <GlassCard title="App Theme" icon="sunny-outline">
          <Text className="text-gray-500 dark:text-neutral-400 mb-3">
            Set app theme preference
          </Text>

          <View className="flex-row bg-gray-100 dark:bg-neutral-800 p-1 rounded-xl border border-gray-200/50 dark:border-neutral-700/50">
            {/* System Option */}
            <TouchableOpacity
              onPress={() => updateTheme('system')}
              className={`flex-1 py-2.5 rounded-lg items-center ${themePreference === "system" ? "bg-white" : ""}`}
            >
              <Text className={`text-base font-semibold ${themePreference === "system" ? "" : "dark:text-neutral-300"}`}>
                📱 System
              </Text>
            </TouchableOpacity>

            {/* Light Option */}
            <TouchableOpacity
              onPress={() => updateTheme('light')}
              className={`flex-1 py-2.5 rounded-lg items-center ${themePreference === "light" ? "bg-white" : ""}`}
            >
              <Text className={`text-base font-semibold ${themePreference === "light" ? "text-neutral-800" : "dark:text-neutral-300"}`}>
                ☀️ Light.
              </Text>
            </TouchableOpacity>

            {/* Dark Option */}
            <TouchableOpacity
              onPress={() => updateTheme('dark')}
              className={`flex-1 py-2.5 rounded-lg items-center ${themePreference === "dark" ? "bg-white" : ""}`}
            >
              <Text className={`text-base font-semibold ${themePreference === "dark" ? "" : "dark:text-neutral-300"}`}>
                🌙 Dark
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* LOGOUT TRIGGER */}
        <View className="mt-2 px-5 py-4">
          <TouchableOpacity
            onPress={logout}
            style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            className="bg-white dark:bg-neutral-900 py-4 rounded-2xl flex-row items-center justify-center gap-2.5 border border-neutral-200 dark:border-neutral-700 shadow-sm active:bg-slate-50 dark:active:bg-neutral-800"
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={themePreference === "light" ? "#ef4468" : "#f87171"}
              className="text-red-500 dark:text-red-400"
            />
            <Text className="text-red-500 dark:text-red-400 text-base font-bold tracking-wide">
              Logout
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* INTERACTIVE SECURITY OPERATIONS CONTROL SHEET */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModals}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-neutral-900 rounded-t-[30px] p-8 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-slate-800 dark:text-neutral-300">
                {authMode === "change" ? "Change Password" : "Reset Password"}
              </Text>
              <TouchableOpacity onPress={closeModals}>
                <Ionicons name="close-circle" size={32} color="#CBD5E1" />
              </TouchableOpacity>
            </View>

            {authMode === "change" && (
              <View className="gap-y-4">
                <View className="bg-slate-100 dark:bg-neutral-800 dark:text-neutral-300 rounded-2xl px-4 flex-row items-center border border-slate-200 dark:border-neutral-700">
                  <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
                  <TextInput
                    placeholder="Old Password"
                    secureTextEntry={!showOldPassword}
                    className="flex-1 py-4 ml-3 text-slate-800 dark:text-neutral-300"
                    onChangeText={(val) => setForm({ ...form, oldPassword: val })}
                  />
                  <TouchableOpacity onPress={() => setShowOldPassword(prev => !prev)}>
                    <Ionicons name={showOldPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <View className="bg-slate-100 dark:bg-neutral-800 dark:text-neutral-300 rounded-2xl px-4 flex-row items-center border border-slate-200 dark:border-neutral-700">
                  <Ionicons name="key-outline" size={20} color="#64748B" />
                  <TextInput
                    placeholder="New Password"
                    secureTextEntry={!showNewPassword}
                    className="flex-1 py-4 ml-3 text-slate-800 dark:text-neutral-300"
                    onChangeText={(val) => setForm({ ...form, newPassword: val })}
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(prev => !prev)}>
                    <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <View className="bg-slate-100 dark:bg-neutral-800 dark:text-neutral-300 rounded-2xl px-4 flex-row items-center border border-slate-200 dark:border-neutral-700">
                  <Ionicons name="checkmark-circle-outline" size={20} color="#64748B" />
                  <TextInput
                    placeholder="Confirm New Password"
                    secureTextEntry={!showConfirmPassword}
                    className="flex-1 py-4 ml-3 text-slate-800 dark:text-neutral-300"
                    onChangeText={(val) => setForm({ ...form, confirmPassword: val })}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
                    <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
                  </TouchableOpacity>
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

            {authMode === "reset" && (
              <View className="gap-y-4">
                {resetStep === 1 ? (
                  <>
                    <Text className="text-slate-500 dark:text-neutral-400 text-center leading-5 mb-2">
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
                    <View className="bg-slate-100 dark:bg-neutral-800 dark:text-neutral-300 rounded-2xl px-4 flex-row items-center border border-slate-200 dark:border-neutral-700">
                      <Ionicons name="mail-outline" size={20} color="#64748B" />
                      <TextInput
                        placeholder="Enter OTP"
                        keyboardType="number-pad"
                        className="flex-1 py-4 ml-3 text-slate-800 dark:text-neutral-300"
                        onChangeText={(val) => setForm({ ...form, otp: val })}
                      />
                    </View>

                    <View className="bg-slate-100 dark:bg-neutral-800 dark:text-neutral-300 rounded-2xl px-4 flex-row items-center border border-slate-200 dark:border-neutral-700">
                      <Ionicons name="key-outline" size={20} color="#64748B" />
                      <TextInput
                        placeholder="New Password"
                        secureTextEntry={!showNewPassword}
                        className="flex-1 py-4 ml-3 text-slate-800 dark:text-neutral-300"
                        onChangeText={(val) => setForm({ ...form, newPassword: val })}
                      />
                      <TouchableOpacity onPress={() => setShowNewPassword(prev => !prev)}>
                        <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
                      </TouchableOpacity>
                    </View>

                    <View className="bg-slate-100 dark:bg-neutral-800 dark:text-neutral-300 rounded-2xl px-4 flex-row items-center border border-slate-200 dark:border-neutral-700">
                      <Ionicons name="checkmark-circle-outline" size={20} color="#64748B" />
                      <TextInput
                        placeholder="Confirm Password"
                        secureTextEntry={!showConfirmPassword}
                        className="flex-1 py-4 ml-3 text-slate-800 dark:text-neutral-300"
                        onChangeText={(val) => setForm({ ...form, confirmPassword: val })}
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
                        <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
                      </TouchableOpacity>
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

      {/* 🔄 DYNAMIC GLOBAL LOGOUT FULLSCREEN OVERLAY LOADING HOOK */}
      {isLoggingOut && (
        <Modal transparent={true} animationType="fade" visible={isLoggingOut}>
          <View className="flex-1 bg-black/40 items-center justify-center backdrop-blur-md">
            <View className="bg-white dark:bg-neutral-900 p-8 rounded-[32px] flex-col items-center justify-center gap-y-4 shadow-xl w-64 border border-zinc-100 dark:border-neutral-800">
              <ActivityIndicator size="large" color={"#4F46E5"} />
              <View className="gap-y-1">
                <Text className="text-zinc-900 dark:text-neutral-50 font-bold text-xl text-center tracking-tight">Logging Out</Text>
                <Text className="text-zinc-400 dark:text-neutral-400 text-sm text-center leading-relaxed">Clearing synchronized profile files...</Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

/* ===================== */
/* GLASS CARD Component */
/* ===================== */
function GlassCard({ title, icon, children }) {
  return (
    <View className="mx-5 mt-6 bg-neutral-100 dark:bg-neutral-900/40 border border-transparent dark:border-neutral-800 backdrop-blur p-5 rounded-3xl elevation-md dark:elevation-none dark:shadow-md">
      <View className="bg-transparent flex-row items-center mb-4 gap-2">
        <Ionicons name={icon} size={28} color="#4F46E5" />
        <Text className="text-lg font-semibold text-slate-800 dark:text-neutral-300">
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

/* ===================== */
/* INFO ROW Component   */
/* ===================== */
function InfoRow({ label, value }) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-slate-200 last:border-b-0">
      <Text className="text-base text-slate-500 dark:text-neutral-300">
        {label}
      </Text>
      <Text
        numberOfLines={1}
        className="text-base font-semibold text-slate-900 dark:text-neutral-300 max-w-[60%] text-right"
      >
        {value || "-"}
      </Text>
    </View>
  );
}