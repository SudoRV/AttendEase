import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from 'nativewind';
import { AppStates } from "../context/AppStates";

export default function LoginPage({ onSwitch }) {
  const { setUserData, buildUrl } = AppStates();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setEmailValid] = useState(null);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassModalVisible, setResetPassModalVisible] = useState(false);

  /* =====================
        LOGIN SUBMIT
  ===================== */
  const handleSubmit = async () => {
    if (!email || !password) return;

    setIsLoggingIn(true);

    try {
      const response = await fetch(buildUrl("/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data?.user_creds) {
        await AsyncStorage.setItem("user_creds", JSON.stringify(data.user_creds));

        setTimeout(() => {
          setUserData(data.user_creds);
          setIsLoggingIn(false);
        }, 1800);
      } else {
        setIsLoggingIn(false);
        Alert.alert("Login Failed", data.message || "Invalid credentials provided.");
      }
    } catch (err) {
      setIsLoggingIn(false);
      Alert.alert("Error", "Something went wrong " + err);
    }
  };

  /* =====================
        EMAIL VALIDATION
  ===================== */
  const validateEmail = async (value) => {
    if (!value) {
      setEmailValid(null);
      return;
    }

    try {
      const response = await fetch(buildUrl("/api/auth/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });

      const result = await response.json();
      setEmailValid(result.success === true);
    } catch (err) {
      console.error(err);
      setEmailValid(null);
    }
  };

  useEffect(() => {
    if (!email) return;

    const timeout = setTimeout(() => {
      validateEmail(email);
    }, 800);

    return () => clearTimeout(timeout);
  }, [email]);

  const getEmailBorderClass = () => {
    if (isEmailValid === true) return "border-green-500";
    if (isEmailValid === false) return "border-red-500";
    return "border-slate-300 dark:border-neutral-800";
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 justify-center p-6 bg-zinc-50 dark:bg-neutral-900"
    >
      <Text className="text-4xl font-black tracking-tight text-indigo-500 text-center">AttendEase</Text>
      <Text className="text-center text-base font-medium text-zinc-400 dark:text-neutral-400 mb-8">Smart academic communication</Text>

      <View className="bg-white dark:bg-neutral-950/60 p-7 rounded-[32px] shadow-md border border-zinc-100 dark:border-neutral-800/60">

        <Text className="text-2xl font-bold text-center text-zinc-900 dark:text-neutral-100 tracking-tight">Welcome Back 👋</Text>
        <Text className="text-center text-sm text-zinc-400 dark:text-neutral-400 mb-6">Login to continue</Text>

        {/* EMAIL ENTRY CONTAINER */}
        <View className={`border rounded-2xl px-4 flex-row items-center bg-zinc-50/50 dark:bg-neutral-950 mb-1.5 ${getEmailBorderClass()}`}>
          <Ionicons name="mail-outline" size={20} color={isDark ? "#737373" : "#71717a"} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#a1a1aa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            className="flex-1 py-4 ml-3 text-base font-medium text-zinc-900 dark:text-neutral-100"
          />
        </View>

        {/* LIVE EMAIL ERROR DIALOGUES */}
        <View className="mb-4 px-1">
          {isEmailValid === true && <Text className="text-emerald-600 dark:text-green-400 text-xs font-semibold tracking-wide uppercase">• User exists</Text>}
          {isEmailValid === false && <Text className="text-rose-500 dark:text-red-400 text-xs font-semibold tracking-wide uppercase">• User doesn’t exist</Text>}
        </View>

        {/* PRIMARY LOGIN PASSWORD ENTRY */}
        <View className="border border-zinc-200 dark:border-neutral-800 rounded-2xl px-4 flex-row items-center bg-zinc-50/50 dark:bg-neutral-950 mb-3">
          <Ionicons name="lock-closed-outline" size={20} color={isDark ? "#737373" : "#71717a"} />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#a1a1aa"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            className="flex-1 py-4 ml-3 text-base font-medium text-zinc-900 dark:text-neutral-100"
          />
          <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} activeOpacity={0.7}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={isDark ? "#737373" : "#71717a"} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setResetPassModalVisible(true)} activeOpacity={0.7}>
          <Text className="text-xs mb-6 ml-auto text-zinc-900 dark:text-indigo-400 font-bold tracking-wide uppercase">Reset password</Text>
        </TouchableOpacity>

        {/* COMPONENT TRANSACTION SUBMIT CONTAINER */}
        <TouchableOpacity
          disabled={!isEmailValid || isLoggingIn}
          onPress={handleSubmit}
          activeOpacity={0.8}
          className={`py-4 rounded-2xl items-center shadow-sm ${!isEmailValid ? 'bg-zinc-200 dark:bg-neutral-800' : 'bg-zinc-900 dark:bg-indigo-600'}`}
        >
          <Text className={`text-sm font-bold tracking-wide ${!isEmailValid ? 'text-zinc-400 dark:text-neutral-500' : 'text-white'}`}>Login</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-5">
          <Text className="text-base font-medium text-zinc-500 dark:text-neutral-400">Don't have an account? </Text>
          <TouchableOpacity onPress={onSwitch} activeOpacity={0.7}>
            <Text className="text-base font-bold text-zinc-900 dark:text-indigo-400 underline decoration-zinc-300">Register</Text>
          </TouchableOpacity>
        </View>

        {/* RECOVERY OPERATIONS SYSTEM MODAL SHEET */}
        <ResetPasswordModal
          visible={resetPassModalVisible}
          onClose={() => setResetPassModalVisible(false)}
          initialEmail={email}
          buildUrl={buildUrl}
          setUserData={setUserData}
          isDark={isDark}
        />
      </View>

      {/* 🔄 DYNAMIC GLOBAL LOGIN FULLSCREEN OVERLAY LOADING HOOK */}
      {isLoggingIn && (
        <Modal transparent={true} animationType="fade" visible={isLoggingIn}>
          <View className="flex-1 bg-black/40 items-center justify-center backdrop-blur-md">
            <View className="bg-white dark:bg-neutral-900 p-8 rounded-[32px] flex-col items-center justify-center gap-y-4 shadow-xl w-64 border border-zinc-100 dark:border-neutral-800">
              <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#18181b"} />
              <View className="gap-y-1">
                <Text className="text-zinc-900 dark:text-neutral-50 font-bold text-lg text-center tracking-tight">Authenticating</Text>
                <Text className="text-zinc-400 dark:text-neutral-400 text-xs text-center leading-relaxed">Synchronizing security profile context...</Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

/* ==========================================================================
   INLINE SUB-COMPONENT: RESET PASSWORD MODAL (DELAY OPTIMIZED)
   ========================================================================== */
function ResetPasswordModal({ visible, onClose, initialEmail, buildUrl, setUserData, isDark }) {
  const [resetStep, setResetStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (visible) {
      setForm({ email: initialEmail, otp: "", newPassword: "", confirmPassword: "" });
      setResetStep(1);
    }
  }, [visible, initialEmail]);

  const closeAndReset = () => {
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  const handlePasswordAction = async () => {
    if (resetStep === 2) {
      if (form.newPassword !== form.confirmPassword) {
        return Alert.alert("Error", "Passwords do not match!");
      }
      if (form.newPassword.length < 6) {
        return Alert.alert("Error", "Password must be at least 6 characters.");
      }
    }

    setLoading(true);

    try {
      if (resetStep === 1) {
        const response = await fetch(buildUrl("/reset-password"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form?.email, type: "request_otp" }),
        });
        const data = await response.json();

        if (response.ok) {
          Alert.alert("OTP Sent", "Check your email for the recovery code.");
          setTimeout(() => {
            setResetStep(2);
          }, 300);
        } else {
          Alert.alert("Error", data.message);
        }
      } else {
        const response = await fetch(buildUrl("/reset-password"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form?.email,
            otp: form.otp,
            new_password: form.newPassword,
            type: "verify_reset"
          }),
        });

        const resData = await response.json();

        if (response.ok) {
          Alert.alert("Success", "Account recovered! Please login with your new password.", [
            {
              text: "OK",
              onPress: () => {
                setTimeout(() => {
                  setUserData(null);
                  closeAndReset();
                }, 200);
              }
            }
          ]);
        } else {
          Alert.alert("Error", resData.message);
        }
      }
    } catch (error) {
      Alert.alert("Network Error", "Check your connection and try again. " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeAndReset}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white dark:bg-neutral-900 rounded-t-[40px] p-6 px-12 pb-8 elevation-2xl border-t border-slate-100 dark:border-neutral-800">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-bold text-slate-800 dark:text-neutral-50">Reset Password</Text>
            <TouchableOpacity onPress={closeAndReset}>
              <Ionicons name="close-circle" size={30} color={isDark ? "#404040" : "#CBD5E1"} />
            </TouchableOpacity>
          </View>

          <View className="gap-y-3.5">
            {resetStep === 1 ? (
              <>
                <View className="bg-slate-50 dark:bg-neutral-900 rounded-xl px-4 flex-row items-center border border-slate-200 dark:border-neutral-800/60">
                  <Ionicons name="mail-outline" size={18} color={isDark ? "#737373" : "#64748B"} />
                  <TextInput
                    placeholder="Enter Email"
                    placeholderTextColor="#94a3b8"
                    value={form.email}
                    onChangeText={(val) => setForm(prev => ({ ...prev, email: val }))}
                    className="flex-1 py-3.5 ml-3 text-slate-800 dark:text-neutral-100"
                  />
                </View>

                <Text className="text-slate-500 dark:text-neutral-400 text-center text-sm leading-4 mb-1">
                  We will send a one-time password to your registered email to verify your identity.
                </Text>

                <TouchableOpacity
                  disabled={loading}
                  onPress={handlePasswordAction}
                  className="bg-indigo-600 dark:bg-indigo-600 py-3.5 rounded-xl items-center elevation-sm"
                >
                  {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Send OTP</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View className="bg-slate-50 dark:bg-neutral-950 rounded-xl px-4 flex-row items-center border border-slate-200 dark:border-neutral-800/60">
                  <Ionicons name="keypad-outline" size={18} color={isDark ? "#737373" : "#64748B"} />
                  <TextInput
                    placeholder="Enter OTP"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={form.otp}
                    onChangeText={(val) => setForm(prev => ({ ...prev, otp: val }))}
                    className="flex-1 py-3.5 ml-3 text-slate-800 dark:text-neutral-100"
                  />
                </View>

                <View className="bg-slate-50 dark:bg-neutral-950 rounded-xl px-4 flex-row items-center border border-slate-200 dark:border-neutral-800/60">
                  <Ionicons name="lock-closed-outline" size={18} color={isDark ? "#737373" : "#64748B"} />
                  <TextInput
                    placeholder="New Password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showNewPassword}
                    value={form.newPassword}
                    onChangeText={(val) => setForm(prev => ({ ...prev, newPassword: val }))}
                    className="flex-1 py-3.5 ml-3 text-slate-800 dark:text-neutral-100"
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(prev => !prev)}>
                    <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={18} color={isDark ? "#737373" : "#64748B"} />
                  </TouchableOpacity>
                </View>

                <View className="bg-slate-50 dark:bg-neutral-950 rounded-xl px-4 flex-row items-center border border-slate-200 dark:border-neutral-800/60">
                  <Ionicons name="checkmark-circle-outline" size={18} color={isDark ? "#737373" : "#64748B"} />
                  <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirmPassword}
                    value={form.confirmPassword}
                    onChangeText={(val) => setForm(prev => ({ ...prev, confirmPassword: val }))}
                    className="flex-1 py-3.5 ml-3 text-slate-800 dark:text-neutral-100"
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
                    <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={18} color={isDark ? "#737373" : "#64748B"} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  disabled={loading}
                  onPress={handlePasswordAction}
                  className="bg-indigo-600 dark:bg-indigo-600 py-3.5 rounded-xl mt-1 items-center elevation-sm"
                >
                  {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Reset Password</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}