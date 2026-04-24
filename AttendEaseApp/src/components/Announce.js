import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppStates } from "../context/AppStates";

const YEARS = ["1", "2", "3", "4"];
const BRANCHES = ["CSE", "AI", "RA", "ME", "CE", "BCA"];
const SECTIONS = ["A", "B", "C"];

export default function Announce() {
  const { userData, BASE_URL, formatDate } = AppStates();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const [targetYears, setTargetYears] = useState([]);
  const [targetBranches, setTargetBranches] = useState([]);
  const [targetSections, setTargetSections] = useState([]);

  const [expiryDate, setExpiryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const toggleSelection = (value, list, setter) => {
    setter(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    );
  };

  async function handleAnnounce() {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Error", "Title and Body are required.");
      return;
    }

    const payload = {
      title,
      body,
      created_by: {
        name: userData?.name,
        id: userData?.teacher_id
      },
      target_year: targetYears,
      target_branch: targetBranches,
      target_section: targetSections,
      status: "Active",
      expires_at: formatDate(expiryDate || new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+1))
    };

    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/announce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const res = await response.json();

      if (res.success) {
        Alert.alert("Success", "Announcement posted.");
        setTitle("");
        setBody("");
        setTargetYears([]);
        setTargetBranches([]);
        setTargetSections([]);
        setExpiryDate(null);
      } else {
        Alert.alert("Error", res.message || "Failed.");
      }
    } catch {
      Alert.alert("Error", "Network error.");
    } finally {
      setLoading(false);
    }
  }

  const renderMultiSelect = (label, data, selected, setter) => (
    <View className="mb-6">
      <Text className="text-base font-semibold text-slate-700 mb-3">
        {label}
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {data.map(item => {
          const active = selected.includes(item);
          return (
            <TouchableOpacity
              key={item}
              onPress={() =>
                toggleSelection(item, selected, setter)
              }
              className={`px-4 py-2 rounded-lg border ${
                active
                  ? "bg-indigo-600 border-indigo-600"
                  : "bg-slate-100 border-slate-300"
              }`}
            >
              <Text
                className={`font-medium ${
                  active ? "text-white" : "text-slate-700"
                }`}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }} className="flex-1 px-5 pt-12">

      {/* HEADER */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-slate-800">
          New Announcement
        </Text>
        <Text className="text-slate-500 mt-2">
          Notify students instantly with important updates.
        </Text>
      </View>

      {/* CARD */}
      <View className="bg-white rounded-3xl p-6 shadow-lg">

        {/* TITLE */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-slate-700 mb-2">
            Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter announcement title"
            className="px-4 py-3 border border-slate-300 rounded-xl text-base"
          />
        </View>

        {/* BODY */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-slate-700 mb-2">
            Message
          </Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Write your announcement..."
            multiline
            textAlignVertical="top"
            className="px-4 py-4 border border-slate-300 rounded-xl h-36 text-base"
          />
        </View>

        <Text className="text-lg font-bold text-slate-800 mb-4">
          Target Audience
        </Text>

        {renderMultiSelect("Years", YEARS, targetYears, setTargetYears)}
        {renderMultiSelect("Branches", BRANCHES, targetBranches, setTargetBranches)}
        {renderMultiSelect("Sections", SECTIONS, targetSections, setTargetSections)}

        {/* EXPIRY */}
        <View className="mb-8">
          <Text className="text-base font-semibold text-slate-700 mb-2">
            Expiry Date
          </Text>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center justify-between px-4 py-3 border border-slate-300 rounded-xl"
          >
            <Text className="text-base text-slate-700">
              {expiryDate
                ? expiryDate.toLocaleString()
                : "Select expiry date & time"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#475569" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={expiryDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  const current = expiryDate || new Date();
                  current.setFullYear(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate()
                  );
                  setExpiryDate(new Date(current));
                  if (Platform.OS === "android") {
                    setTimeout(() => setShowTimePicker(true), 200);
                  }
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={expiryDate || new Date()}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  const current = expiryDate || new Date();
                  current.setHours(
                    selectedTime.getHours(),
                    selectedTime.getMinutes()
                  );
                  setExpiryDate(new Date(current));
                }
              }}
            />
          )}
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          onPress={handleAnnounce}
          disabled={loading}
          className={`py-4 rounded-xl ${
            loading ? "bg-indigo-300" : "bg-indigo-600"
          }`}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {loading ? "Publishing…" : "Publish Announcement"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* INFO */}
      <View className="mt-8 mb-10 bg-white rounded-2xl p-5 shadow-sm">
        <Text className="text-lg font-semibold text-slate-800 mb-3">
          About Announcements
        </Text>
        <Text className="text-slate-600 mb-2">
          • Visible instantly to selected students
        </Text>
        <Text className="text-slate-600 mb-2">
          • Target filters determine recipients
        </Text>
        <Text className="text-slate-600">
          • Expired announcements hide automatically
        </Text>
      </View>

    </ScrollView>
  );
}