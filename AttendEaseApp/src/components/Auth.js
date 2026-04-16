import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import LoginPage from "./Login";
import RegisterPage from "./Register";

export default function Auth() {
  const [mode, setMode] = useState("login");

  return (
    <View style={styles.container}>
      {mode === "login" ? (
        <LoginPage onSwitch={() => setMode("register")} />
      ) : (
        <RegisterPage onSwitch={() => setMode("login")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    padding: 16
  }
});