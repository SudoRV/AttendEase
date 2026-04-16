import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppStates } from "../context/AppStates";

function RegisterPage({ onSwitch }) {
  const { setUserData, buildUrl } = AppStates();

  const [selectedRole, setSelectedRole] = useState("");
  const [isEmailValid, setEmailValid] = useState(null);
  const [isIDValid, setIDValid] = useState(null);

  const [formData, setFormData] = useState({
    role: "",
    name: "",
    email: "",
    password: "",
    student_id: "",
    teacher_id: "",
    branch: "",
    year: ""
  });

  /* =====================
     VALIDATION
  ===================== */
  const validateField = async (field, value) => {
    const response = await fetch(buildUrl("/validate-creds"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value })
    });

    const res = await response.json();
    const available = !res.success;

    if (field === "email") setEmailValid(available);
    else setIDValid(available);
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    if (["email", "student_id", "teacher_id"].includes(name)) {
      validateField(name, value);
    }
  };

  const handleSubmit = async () => {
    if (!isEmailValid || !isIDValid) {
      Alert.alert("Error", "Please fix validation errors.");
      return;
    }

    const response = await fetch(buildUrl("/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const res = await response.json();
    Alert.alert("Response", res.message);

    if (res.success) {
      await AsyncStorage.setItem(
        "user_creds",
        JSON.stringify(formData)
      );
      setUserData(formData);
    }
  };

  return (
    <ScrollView className="flex-1 px-4">

      {/* TITLE */}
      <View className="items-center mt-16 mb-8">
        <Text className="text-3xl font-extrabold text-indigo-600">
          Scheduler
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Smart academic communication
        </Text>
      </View>

      {/* CARD */}
      <View className="bg-white rounded-2xl shadow p-6">

        <Text className="text-2xl font-bold text-center mb-1">
          Create Account
        </Text>

        <Text className="text-center text-gray-500 text-sm mb-6">
          Register to continue
        </Text>

        {/* ROLE */}
        <View className="border rounded-xl mb-4">
          <Picker
            selectedValue={selectedRole}
            onValueChange={(value) => {
              setSelectedRole(value);
              handleChange("role", value);
            }}
          >
            <Picker.Item label="Select Role" value="" />
            <Picker.Item label="Teacher" value="Teacher" />
            <Picker.Item label="Student" value="Student" />
          </Picker>
        </View>

        {/* NAME */}
        <TextInput
          placeholder="Full Name"
          className="border rounded-xl px-4 py-3 mb-4"
          value={formData.name}
          onChangeText={(v) => handleChange("name", v)}
        />

        {/* EMAIL */}
        <TextInput
          placeholder="Email"
          className={`border rounded-xl px-4 py-3 mb-4 ${
            isEmailValid === false
              ? "border-red-500"
              : isEmailValid === true
              ? "border-green-500"
              : "border-gray-300"
          }`}
          value={formData.email}
          onChangeText={(v) => handleChange("email", v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* TEACHER */}
        {selectedRole === "Teacher" && (
          <TextInput
            placeholder="Teacher ID"
            className="border rounded-xl px-4 py-3 mb-4"
            value={formData.teacher_id}
            onChangeText={(v) => handleChange("teacher_id", v)}
          />
        )}

        {/* STUDENT */}
        {selectedRole === "Student" && (
          <>
            <View className="border rounded-xl mb-4">
              <Picker
                selectedValue={formData.branch}
                onValueChange={(v) => handleChange("branch", v)}
              >
                <Picker.Item label="Select Branch" value="" />
                <Picker.Item label="CSE" value="CSE" />
                <Picker.Item label="AI" value="AI" />
                <Picker.Item label="ME" value="ME" />
                <Picker.Item label="CE" value="CE" />
                <Picker.Item label="BCA" value="BCA" />
              </Picker>
            </View>

            <View className="border rounded-xl mb-4">
              <Picker
                selectedValue={formData.year}
                onValueChange={(v) => handleChange("year", v)}
              >
                <Picker.Item label="Select Year" value="" />
                <Picker.Item label="1st" value="1" />
                <Picker.Item label="2nd" value="2" />
                <Picker.Item label="3rd" value="3" />
                <Picker.Item label="4th" value="4" />
              </Picker>
            </View>

            <TextInput
              placeholder="Student ID"
              className="border rounded-xl px-4 py-3 mb-4"
              value={formData.student_id}
              onChangeText={(v) => handleChange("student_id", v)}
            />
          </>
        )}

        {/* PASSWORD */}
        <TextInput
          placeholder="Password"
          secureTextEntry
          className="border rounded-xl px-4 py-3 mb-6"
          value={formData.password}
          onChangeText={(v) => handleChange("password", v)}
        />

        {/* SUBMIT */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!(isEmailValid && isIDValid)}
          className={`py-3 rounded-xl ${
            isEmailValid && isIDValid
              ? "bg-indigo-600"
              : "bg-gray-400"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            Register
          </Text>
        </TouchableOpacity>

        {/* SWITCH */}
        <TouchableOpacity
          onPress={onSwitch}
          className="mt-4"
        >
          <Text className="text-center text-indigo-600 underline">
            Already have an account? Login
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

export default RegisterPage;