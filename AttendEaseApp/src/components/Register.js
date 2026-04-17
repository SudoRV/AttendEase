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
    branch_id: "",
    year: "",
    semester: "",
    section: "A"
  });

  /* =====================
      VALIDATION
  ===================== */
  const validateField = async (field, value) => {
    try {
      const response = await fetch(buildUrl("/validate-creds"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
      });

      const res = await response.json();
      const available = !res.success;

      if (field === "email") setEmailValid(available);
      else setIDValid(available);
    } catch (error) {
      console.error("Validation Error:", error);
    }
  };

  const handleChange = (name, value) => {
    // Auto-capitalize Section input
    const finalValue = name === "section" ? value.toUpperCase() : value;

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    if (["email", "student_id", "teacher_id"].includes(name)) {
      validateField(name, finalValue);
    }
  };

  const handleSubmit = async () => {
    if (!isEmailValid || !isIDValid) {
      Alert.alert("Error", "Please fix validation errors.");
      return;
    }

    const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
      acc[key] = value === "" ? null : value;
      return acc;
    }, {});

    try {
      const response = await fetch(buildUrl("/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData)
      });

      const res = await response.json();
      console.log(res)
      Alert.alert("User Registration", res.message);

      if (res.success) {
        await AsyncStorage.setItem(
          "user_creds",
          JSON.stringify(formData)
        );
        setUserData(formData);
      }
    } catch (error) {
      Alert.alert("Error", "Registration failed. Check your connection.");
    }
  };

  return (
    <ScrollView className="flex-1 px-4 bg-gray-50">
      {/* TITLE */}
      <View className="items-center mt-16 mb-8">
        <Text className="text-3xl font-extrabold text-indigo-600">
          AttendEase
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Smart academic communication
        </Text>
      </View>

      {/* CARD */}
      <View className="bg-white rounded-2xl shadow-lg p-6 mb-10">
        <Text className="text-2xl font-bold text-center mb-1">
          Create Account
        </Text>
        <Text className="text-center text-gray-500 text-sm mb-6">
          Register to continue
        </Text>

        {/* ROLE PICKER */}
        <View className="border border-gray-300 rounded-xl mb-4 overflow-hidden">
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
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
          value={formData.name}
          onChangeText={(v) => handleChange("name", v)}
        />

        {/* EMAIL */}
        <TextInput
          placeholder="Email"
          className={`border rounded-xl px-4 py-3 mb-4 ${isEmailValid === false
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

        {/* TEACHER SPECIFIC */}
        {selectedRole === "Teacher" && (
          <TextInput
            placeholder="Teacher ID"
            className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
            value={formData.teacher_id}
            onChangeText={(v) => handleChange("teacher_id", v)}
          />
        )}

        {/* STUDENT SPECIFIC */}
        {selectedRole === "Student" && (
          <>
            <View className="border border-gray-300 rounded-xl mb-4 overflow-hidden">
              <Picker
                selectedValue={formData.branch_id}
                onValueChange={(v) => handleChange("branch_id", v)}
              >
                <Picker.Item label="Select Branch" value="" />
                <Picker.Item label="CSE" value="CSE" />
                <Picker.Item label="AI" value="AI" />
                <Picker.Item label="ME" value="ME" />
                <Picker.Item label="CE" value="CE" />
                <Picker.Item label="BCA" value="BCA" />
              </Picker>
            </View>

            <View className="border border-gray-300 rounded-xl mb-4 overflow-hidden">
              <Picker
                selectedValue={formData.year}
                onValueChange={(v) => handleChange("year", v)}
              >
                <Picker.Item label="Select Year" value="" />
                <Picker.Item label="1st Year" value="1" />
                <Picker.Item label="2nd Year" value="2" />
                <Picker.Item label="3rd Year" value="3" />
                <Picker.Item label="4th Year" value="4" />
              </Picker>
            </View>

            {/* SEMESTER PICKER (1-10) */}
            <View className="border border-gray-300 rounded-xl mb-4 overflow-hidden">
              <Picker
                selectedValue={formData.semester}
                onValueChange={(v) => handleChange("semester", v)}
              >
                <Picker.Item label="Select Semester" value="" />
                {Array.from({ length: 10 }, (_, i) => (
                  <Picker.Item
                    key={i + 1}
                    label={`Semester ${i + 1}`}
                    value={(i + 1).toString()}
                  />
                ))}
              </Picker>
            </View>

            {/* SECTION INPUT (Auto-Capitalized) */}
            <TextInput
              placeholder="Section (e.g. A, B, C)"
              className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
              value={formData.section}
              autoCapitalize="characters"
              onChangeText={(v) => handleChange("section", v)}
            />

            <TextInput
              placeholder="Student ID"
              className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
              value={formData.student_id}
              onChangeText={(v) => handleChange("student_id", v)}
            />
          </>
        )}

        {/* PASSWORD */}
        <TextInput
          placeholder="Password"
          secureTextEntry
          className="border border-gray-300 rounded-xl px-4 py-3 mb-6"
          value={formData.password}
          onChangeText={(v) => handleChange("password", v)}
        />

        {/* SUBMIT */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!(isEmailValid && isIDValid)}
          className={`py-3 rounded-xl ${isEmailValid && isIDValid
              ? "bg-indigo-600"
              : "bg-gray-400"
            }`}
        >
          <Text className="text-white text-center font-semibold">
            Register
          </Text>
        </TouchableOpacity>

        {/* SWITCH TO LOGIN */}
        <TouchableOpacity
          onSwitch={onSwitch}
          className="mt-4"
          onPress={onSwitch}
        >
          <View className="flex-row text-center justify-center">
            <Text>Already have an account? </Text>
            <Text className="text-center font-semibold text-indigo-500 underline">
              Login
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default RegisterPage;