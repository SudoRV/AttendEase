import React, { useEffect, useState } from "react";
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
import { AppStates } from "../context/AppStates";

const StudentLeave = () => {
  const { userData, leaveHistory, loadLeaves, BASE_URL } = AppStates();

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [application, setApplication] = useState("");
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    if (!date) return "Select Date";
    return new Date(date)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
  };

  useEffect(() => {
    if (!userData?.email) return;
    loadLeaves(userData?.role);
  }, [userData]);

  async function submitLeave() {
    if (!application.trim() || !fromDate || !toDate) {
      Alert.alert("Error", "Please fill all leave details.");
      return;
    }

    if (toDate < fromDate) {
      Alert.alert("Error", "'To' date cannot be before 'From' date.");
      return;
    }

    const subjectMatch = application.match(/[Ss]ubject\s*:\s*(.*)\n*/);
    const subject = subjectMatch
      ? subjectMatch[1]
      : "Leave Application";

    const leave = {
      applicant: userData,
      subject,
      application,
      applicable_from: formatDate(fromDate),
      applicable_to: formatDate(toDate)
    };

    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/upload-leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leave)
      });

      const resdata = await response.json();

      if (resdata?.success) {
        Alert.alert("Success", resdata.message);

        // Reset form
        setApplication("");
        setFromDate(null);
        setToDate(null);

        loadLeaves(userData?.role);
      } else {
        Alert.alert("Error", resdata.message || "Something went wrong.");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function FieldLabel({ text }) {
    return (
      <Text className="text-slate-600 text-sm font-medium mb-2">
        {text}
      </Text>
    );
  }

  return (
    <View className="flex-1 bg-slate-100">

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 40,
          paddingBottom: 20,
        }}
      >

        {/* HEADER */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-slate-900">
            Leave Portal
          </Text>
          <Text className="text-slate-500 mt-1">
            Submit and track your leave applications
          </Text>
        </View>

        {/* LEAVE SUMMARY */}
        <View className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 mb-6">
          <Text className="text-lg font-semibold text-slate-800 mb-2">
            Leave History
          </Text>

          <Text className="text-slate-500">
            Leaves this month
          </Text>

          <Text className="text-4xl font-bold text-indigo-600 mt-1">
            {leaveHistory?.length || 0}
          </Text>
        </View>

        {/* LATEST STATUS */}
        <View className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 mb-6">
          <Text className="text-lg font-semibold text-slate-800 mb-3">
            Latest Status
          </Text>

          {leaveHistory?.length ? (
            <>
              <Text className="text-slate-700 font-medium">
                {leaveHistory[0]?.subject}
              </Text>

              <Text className="text-slate-500 mt-1">
                {new Date(
                  leaveHistory[0]?.applicable_from
                ).toLocaleDateString("en-IN")}
                {"  —  "}
                {new Date(
                  leaveHistory[0]?.applicable_to
                ).toLocaleDateString("en-IN")}
              </Text>

              <View
                className={`mt-3 self-start px-4 py-1 rounded-full ${leaveHistory[0]?.status === "Approved"
                    ? "bg-green-100"
                    : leaveHistory[0]?.status === "Rejected"
                      ? "bg-red-100"
                      : "bg-yellow-100"
                  }`}
              >
                <Text
                  className={`font-semibold ${leaveHistory[0]?.status === "Approved"
                      ? "text-green-600"
                      : leaveHistory[0]?.status === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                >
                  {leaveHistory[0]?.status}
                </Text>
              </View>
            </>
          ) : (
            <Text className="text-slate-500">
              No leave submitted yet
            </Text>
          )}
        </View>

        {/* FORM */}
        <View className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">

          <Text className="text-xl font-semibold text-slate-800 mb-6">
            Submit Leave
          </Text>

          {/* FROM DATE */}
          <FieldLabel text="From Date" />
          <TouchableOpacity
            onPress={() => setShowFromPicker(true)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 mb-4"
          >
            <Text className="text-slate-800 text-base">
              {formatDate(fromDate)}
            </Text>
          </TouchableOpacity>

          {showFromPicker && (
            <DateTimePicker
              value={fromDate || new Date()}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowFromPicker(Platform.OS === "ios");
                if (selectedDate) setFromDate(selectedDate);
              }}
            />
          )}

          {/* TO DATE */}
          <FieldLabel text="To Date" />
          <TouchableOpacity
            onPress={() => setShowToPicker(true)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 mb-4"
          >
            <Text className="text-slate-800 text-base">
              {formatDate(toDate)}
            </Text>
          </TouchableOpacity>

          {showToPicker && (
            <DateTimePicker
              value={toDate || fromDate || new Date()}
              mode="date"
              minimumDate={fromDate || new Date()}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowToPicker(Platform.OS === "ios");
                if (selectedDate) setToDate(selectedDate);
              }}
            />
          )}

          {/* APPLICATION */}
          <FieldLabel text="Application" />
          <TextInput
            value={application}
            onChangeText={setApplication}
            placeholder="Write your leave reason..."
            multiline
            textAlignVertical="top"
            className="h-36 bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base"
          />

          {/* BUTTON */}
          <TouchableOpacity
            onPress={submitLeave}
            disabled={loading}
            className={`mt-6 py-4 rounded-2xl shadow-md ${loading ? "bg-indigo-300" : "bg-indigo-600"
              }`}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {loading ? "Submitting..." : "Submit Leave"}
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </View>
  );
};

export default StudentLeave;