import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import LoginPage from "./Login";
import RegisterPage from "./Register";

export default function Auth() {
  const [mode, setMode] = useState("login");

  return (
    <View className="flex-1 w-full flex-col justify-center">
      {mode === "login" ? (
        <LoginPage onSwitch={() => setMode("register")} />
      ) : (
        <RegisterPage onSwitch={() => setMode("login")} />
      )}
    </View>
  );
}