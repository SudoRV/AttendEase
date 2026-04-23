import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal
} from "react-native";
import RNRestart from 'react-native-restart';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppStates } from "../context/AppStates";

export default function LoginPage({ onSwitch }) {
  const { setUserData, buildUrl } = AppStates();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setEmailValid] = useState(null);
  const [loading, setLoading] = useState(false);

  const [resetPassModalVisible, setResetPassModalVisible] = useState(false);
  const [resetStep, setResetStep] = useState(1);

  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const closeModals = () => {
    setResetPassModalVisible(false);
    setResetStep(1);
    setForm({ otp: "", newPassword: "", confirmPassword: "" });
  };

  const handlePasswordAction = async () => {
    // Basic validation
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

        console.log(response)

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

        // const data = await response.json();

        if (response.ok) {
          Alert.alert("Success", "Account recovered! Please login with your new password.", [
            { text: "OK", onPress: () => setUserData(null) }
          ]);
          setResetPassModalVisible(false);
        } else {
          Alert.alert("Error", "Invalid OTP or request failed.");
        }
      }
    } catch (error) {
      Alert.alert("Network Error", "Check your connection and try again." + error);
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
        await AsyncStorage.setItem(
          "user_creds",
          JSON.stringify(data.user_creds)
        );

        // RNRestart.Restart();
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
      console.error(err)
      setEmailValid(null);
    }
  };


  useEffect(() => {
    if(!email) return;

    const timeout = setTimeout(() => {
      validateEmail(email);
      clearTimeout(timeout);
    }, 800);

    return () => clearTimeout(timeout);
  }, [email])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>AttendEase</Text>
        <Text style={styles.subtitle}>Smart academic communication</Text>

        <Text style={styles.header}>Welcome Back 👋</Text>
        <Text style={styles.smallText}>Login to continue</Text>

        {/* EMAIL */}
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(v) => setEmail(v)}
          style={[
            styles.input,
            isEmailValid === true && styles.valid,
            isEmailValid === false && styles.invalid
          ]}
        />

        {isEmailValid === true && (
          <Text style={styles.validText}>User exists</Text>
        )}
        {isEmailValid === false && (
          <Text style={styles.invalidText}>User doesn’t exist</Text>
        )}

        {/* PASSWORD */}
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity onPress={() => setResetPassModalVisible(prev => !prev)}>
          <Text className="text-sm mb-3 ml-auto text-blue-600 font-semibold">Reset password</Text>
        </TouchableOpacity>

        {/* SUBMIT */}
        <TouchableOpacity
          style={[
            styles.button,
            !isEmailValid && styles.disabledButton
          ]}
          disabled={!isEmailValid || loading}
          onPress={handleSubmit}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* SWITCH */}
        <View style={styles.switchRow}>
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={onSwitch}>
            <Text style={styles.switchText}>Register</Text>
          </TouchableOpacity>
        </View>



        {/* 🛠 SECURITY MODAL */}
        <Modal
          visible={resetPassModalVisible}
          animationType="slide"
          transparent={true}
        // onRequestClose={}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[40px] p-8 shadow-2xl">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-slate-800">
                  Reset Password
                </Text>
                <TouchableOpacity onPress={closeModals}>
                  <Ionicons name="close-circle" size={32} color="#CBD5E1" />
                </TouchableOpacity>
              </View>

              {/* RESET PASSWORD FLOW */}
              <View className="gap-y-4">
                {resetStep === 1 ? (
                  <>
                    <View key="step1" className="bg-slate-100 rounded-2xl px-4 flex-row items-center border border-slate-200">
                      <Ionicons name="mail-outline" size={20} color="#64748B" />
                      <TextInput
                        placeholder="Enter Email"
                        className="flex-1 py-4 ml-3"
                        onChangeText={(val) => setForm({ ...form, email: val })}
                      />
                    </View>

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
                    <View key="step2" className="bg-slate-100 rounded-2xl px-4 flex-row items-center border border-slate-200">
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
            </View>
          </View>
        </Modal>

      </View>
    </KeyboardAvoidingView>
  );
}

/* =====================
   STYLES
===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    padding: 8
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    elevation: 4
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4F46E5",
    textAlign: "center"
  },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 20
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center"
  },
  smallText: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12
  },
  valid: { borderColor: "green" },
  invalid: { borderColor: "red" },
  validText: {
    color: "green",
    marginBottom: 8
  },
  invalidText: {
    color: "red",
    marginBottom: 8
  },
  button: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 12,
    alignItems: "center"
  },
  disabledButton: {
    backgroundColor: "#94A3B8"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600"
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16
  },
  switchText: {
    color: "#4F46E5",
    fontWeight: "600"
  }
});