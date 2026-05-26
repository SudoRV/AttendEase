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
import { AppStates } from "../context/AppStates";

export default function LoginPage({ onSwitch }) {
  const { setUserData, buildUrl } = AppStates();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setEmailValid] = useState(null);
  
  // Unified, descriptive status match mirroring profile screen layouts
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassModalVisible, setResetPassModalVisible] = useState(false);

  /* =====================
       LOGIN SUBMIT
  ===================== */
  const handleSubmit = async () => {
    if (!email || !password) return;

    setIsLoggingIn(true); // Engages full screen interactive blur lock overlay

    try {
      const response = await fetch(buildUrl("/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data?.user_creds) {
        await AsyncStorage.setItem("user_creds", JSON.stringify(data.user_creds));
        
        // 🛠 Introduce a deliberate timeout delay block to completely mitigate jerky transitions
        // and allow layout system hooks to register state data profiles seamlessly
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
      const response = await fetch(buildUrl("/validate-creds"), {
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
    return "border-slate-300";
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 justify-center p-2"
    >
      <View className="bg-white p-6 rounded-3xl elevation-md">
        <Text className="text-3xl font-extrabold text-indigo-600 text-center">AttendEase</Text>
        <Text className="text-center text-slate-500 mb-5">Smart academic communication</Text>

        <Text className="text-xl font-bold text-center text-slate-800">Welcome Back 👋</Text>
        <Text className="text-center text-slate-500 mb-5">Login to continue</Text>

        {/* EMAIL ENTRY CONTAINER */}
        <View className={`border rounded-xl px-4 flex-row items-center bg-slate-50 mb-1 ${getEmailBorderClass()}`}>
          <Ionicons name="mail-outline" size={20} color="#64748B" />
          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            className="flex-1 py-3.5 ml-3 text-slate-800"
          />
        </View>

        {/* LIVE EMAIL ERROR DIALOGUES */}
        <View className="mb-3 px-1">
          {isEmailValid === true && <Text className="text-green-600 text-xs font-medium">User exists</Text>}
          {isEmailValid === false && <Text className="text-red-500 text-sm font-medium">User doesn’t exist</Text>}
        </View>

        {/* PRIMARY LOGIN PASSWORD ENTRY */}
        <View className="border border-slate-300 rounded-xl px-4 flex-row items-center bg-slate-50 mb-3">
          <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
          <TextInput
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            className="flex-1 py-3.5 ml-3 text-slate-800"
          />
          <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setResetPassModalVisible(true)}>
          <Text className="text-sm mb-4 ml-auto text-indigo-600 font-semibold">Reset password</Text>
        </TouchableOpacity>

        {/* COMPONENT TRANSACTION SUBMIT CONTAINER */}
        <TouchableOpacity
          disabled={!isEmailValid || isLoggingIn}
          onPress={handleSubmit}
          className={`py-3.5 rounded-xl items-center elevation-sm ${!isEmailValid ? 'bg-slate-400' : 'bg-indigo-600'}`}
        >
          <Text className="text-white font-semibold text-base">Login</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text className="text-slate-600">Don't have an account? </Text>
          <TouchableOpacity onPress={onSwitch}>
            <Text className="text-indigo-600 font-semibold">Register</Text>
          </TouchableOpacity>
        </View>

        {/* RECOVERY OPERATIONS SYSTEM MODAL SHEET */}
        <ResetPasswordModal
          visible={resetPassModalVisible}
          onClose={() => setResetPassModalVisible(false)}
          initialEmail={email}
          buildUrl={buildUrl}
          setUserData={setUserData}
        />
      </View>

      {/* 🔄 DYNAMIC GLOBAL LOGIN FULLSCREEN OVERLAY LOADING HOOK */}
      {isLoggingIn && (
        <Modal transparent={true} animationType="fade" visible={isLoggingIn}>
          <View className="flex-1 bg-black/60 items-center justify-center">
            <View className="bg-white p-6 rounded-3xl flex-col items-center justify-center space-y-4 elevation-2xl w-64">
              <ActivityIndicator size="large" color="#4F46E5" />
              <View className="space-y-1">
                <Text className="text-slate-800 font-bold text-xl text-center">Authenticating</Text>
                <Text className="text-slate-400 text-sm text-center">Synchronizing security profile context...</Text>
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
function ResetPasswordModal({ visible, onClose, initialEmail, buildUrl, setUserData }) {
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
        <View className="bg-white rounded-t-[40px] p-6 pb-8 elevation-2xl border-t border-slate-100">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-bold text-slate-800">Reset Password</Text>
            <TouchableOpacity onPress={closeAndReset}>
              <Ionicons name="close-circle" size={30} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          <View className="gap-y-3.5">
            {resetStep === 1 ? (
              <>
                <View className="bg-slate-50 rounded-xl px-4 flex-row items-center border border-slate-200">
                  <Ionicons name="mail-outline" size={18} color="#64748B" />
                  <TextInput
                    placeholder="Enter Email"
                    value={form.email}
                    onChangeText={(val) => setForm(prev => ({ ...prev, email: val }))}
                    className="flex-1 py-3.5 ml-3 text-slate-800"
                  />
                </View>

                <Text className="text-slate-500 text-center text-xs leading-4 mb-1">
                  We will send a one-time password to your registered email to verify your identity.
                </Text>
                
                <TouchableOpacity
                  disabled={loading}
                  onPress={handlePasswordAction}
                  className="bg-indigo-600 py-3.5 rounded-xl items-center elevation-sm"
                >
                  {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Send OTP</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View className="bg-slate-50 rounded-xl px-4 flex-row items-center border border-slate-200">
                  <Ionicons name="keypad-outline" size={18} color="#64748B" />
                  <TextInput
                    placeholder="Enter OTP"
                    keyboardType="number-pad"
                    value={form.otp}
                    onChangeText={(val) => setForm(prev => ({ ...prev, otp: val }))}
                    className="flex-1 py-3.5 ml-3 text-slate-800"
                  />
                </View>

                <View className="bg-slate-50 rounded-xl px-4 flex-row items-center border border-slate-200">
                  <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
                  <TextInput
                    placeholder="New Password"
                    secureTextEntry={!showNewPassword}
                    value={form.newPassword}
                    onChangeText={(val) => setForm(prev => ({ ...prev, newPassword: val }))}
                    className="flex-1 py-3.5 ml-3 text-slate-800"
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(prev => !prev)}>
                    <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <View className="bg-slate-50 rounded-xl px-4 flex-row items-center border border-slate-200">
                  <Ionicons name="checkmark-circle-outline" size={18} color="#64748B" />
                  <TextInput
                    placeholder="Confirm Password"
                    secureTextEntry={!showConfirmPassword}
                    value={form.confirmPassword}
                    onChangeText={(val) => setForm(prev => ({ ...prev, confirmPassword: val }))}
                    className="flex-1 py-3.5 ml-3 text-slate-800"
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
                    <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  disabled={loading}
                  onPress={handlePasswordAction}
                  className="bg-indigo-600 py-3.5 rounded-xl mt-1 items-center elevation-sm"
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