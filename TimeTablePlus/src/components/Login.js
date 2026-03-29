import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppStates } from "../context/AppStates";

export default function LoginPage({ onSwitch }) {
  const { setUserData, buildUrl } = AppStates();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setEmailValid] = useState(null);
  const [loading, setLoading] = useState(false);

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

        console.log(data)
        setUserData(data.user_creds);
      }

      Alert.alert("Login", data.message);
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    }

    setLoading(false);
  };

  /* =====================
     EMAIL VALIDATION
  ===================== */
  const validateEmail = async (value) => {
    setEmail(value);

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
    } catch {
      setEmailValid(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Scheduler</Text>
        <Text style={styles.subtitle}>Smart academic communication</Text>

        <Text style={styles.header}>Welcome Back 👋</Text>
        <Text style={styles.smallText}>Login to continue</Text>

        {/* EMAIL */}
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={validateEmail}
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