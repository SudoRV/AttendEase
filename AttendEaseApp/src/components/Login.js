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
  const [loading, setLoading] = useState(false);

  // Password Visibility Toggle States
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resetPassModalVisible, setResetPassModalVisible] = useState(false);
  const [resetStep, setResetStep] = useState(1);

  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Syncs main input email to recovery form context automatically on open
  const openResetModal = () => {
    setForm(prev => ({ ...prev, email: email }));
    setResetPassModalVisible(true);
  };

  const closeModals = () => {
    setResetPassModalVisible(false);
    setResetStep(1);
    setForm({ email: "", otp: "", newPassword: "", confirmPassword: "" });
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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
        // REQUEST RESET (SEND OTP)
        const response = await fetch(buildUrl("/reset-password"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form?.email, type: "request_otp" }),
        });

        if (response.ok) {
          Alert.alert("OTP Sent", "Check your email for the recovery code.");
          setResetStep(2);
        } else {
          Alert.alert("Error", "Failed to send OTP.");
        }
      } else {
        // SUBMIT RESET WITH OTP
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

        if (response.ok) {
          Alert.alert("Success", "Account recovered! Please login with your new password.", [
            { text: "OK", onPress: () => setUserData(null) }
          ]);
          closeModals();
        } else {
          Alert.alert("Error", "Invalid OTP or request failed.");
        }
      }
    } catch (error) {
      Alert.alert("Network Error", "Check your connection and try again. " + error);
    } finally {
      setLoading(false);
    }
  };

  /* =====================
      LOGIN SUBMIT
  ===================== */
  const handleSubmit = async () => {
    if (!email || !password) return;

    setLoading(true);

    try {
      const response = await fetch(buildUrl("/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data?.user_creds) {
        await AsyncStorage.setItem("user_creds", JSON.stringify(data.user_creds));
        setUserData(data.user_creds);
      }

      Alert.alert("Login", data.message);
    } catch (err) {
      Alert.alert("Error", "Something went wrong " + err);
    }

    setLoading(false);
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

  // Evaluates text field borders seamlessly via simple dynamic class tags
  const getEmailBorderClass = () => {
    if (isEmailValid === true) return "border-green-500";
    if (isEmailValid === false) return "border-red-500";
    return "border-slate-300";
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 justify-center bg-slate-100 p-2"
    >
      <View className="bg-white p-6 rounded-xl shadow-md">
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
          {isEmailValid === false && <Text className="text-red-500 text-xs font-medium">User doesn’t exist</Text>}
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

        <TouchableOpacity onPress={openResetModal}>
          <Text className="text-sm mb-4 ml-auto text-indigo-600 font-semibold">Reset password</Text>
        </TouchableOpacity>

        {/* COMPONENT TRANSACTION SUBMIT CONTAINER */}
        <TouchableOpacity
          disabled={!isEmailValid || loading}
          onPress={handleSubmit}
          className={`py-3.5 rounded-xl items-center shadow-sm ${!isEmailValid ? 'bg-slate-400' : 'bg-indigo-600'}`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Login</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text className="text-slate-600">Don't have an account? </Text>
          <TouchableOpacity onPress={onSwitch}>
            <Text className="text-indigo-600 font-semibold">Register</Text>
          </TouchableOpacity>
        </View>

        {/* 🛠 RECOVERY OPERATIONS SHEET CONTAINER */}
        <Modal
          visible={resetPassModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModals}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[40px] p-6 pb-8 shadow-2xl border-t border-slate-100">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-xl font-bold text-slate-800">Reset Password</Text>
                <TouchableOpacity onPress={closeModals}>
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
                        onChangeText={(val) => setForm({ ...form, email: val })}
                        className="flex-1 py-3.5 ml-3 text-slate-800"
                      />
                    </View>

                    <Text className="text-slate-500 text-center text-xs leading-4 mb-1">
                      We will send a one-time password to your registered email to verify your identity.
                    </Text>
                    <TouchableOpacity
                      disabled={loading}
                      onPress={handlePasswordAction}
                      className="bg-indigo-600 py-3.5 rounded-xl items-center shadow-sm"
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
                        onChangeText={(val) => setForm({ ...form, otp: val })}
                        className="flex-1 py-3.5 ml-3 text-slate-800"
                      />
                    </View>

                    <View className="bg-slate-50 rounded-xl px-4 flex-row items-center border border-slate-200">
                      <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
                      <TextInput
                        placeholder="New Password"
                        secureTextEntry={!showNewPassword}
                        value={form.newPassword}
                        onChangeText={(val) => setForm({ ...form, newPassword: val })}
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
                        onChangeText={(val) => setForm({ ...form, confirmPassword: val })}
                        className="flex-1 py-3.5 ml-3 text-slate-800"
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
                        <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      disabled={loading}
                      onPress={handlePasswordAction}
                      className="bg-indigo-600 py-3.5 rounded-xl mt-1 items-center shadow-sm"
                    >
                      {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Reset Password</Text>}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}