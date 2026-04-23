import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AppStates } from "../context/AppStates";
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from "./ui/CustomButton";
import Selector from "./ui/Selector";

const StudentLeave = () => {
  const { userData, leaveHistory, loadLeaves, BASE_URL, buildUrl, formatDate } = AppStates();

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [application, setApplication] = useState("");
  const [loading, setLoading] = useState(false);

  const [latestLeaveModal, setLatestLeaveModal] = useState(false);
  const [latestLeaveCollapsed, setLatestLeaveCollapsed] = useState({ collapsed: false, index: 0 });
  const [leavesFilter, setLeavesFilter] = useState({ month: new Date().getMonth(), set: true });
  const [leavesByMonth, setLeavesByMonth] = useState({});

  async function fetchLeaves() {
    if (!userData?.email) return;
    const leaves_by_month = await loadLeaves(leavesFilter);
    
    if (leaves_by_month?.data?.length > 0) {
      setLeavesByMonth(leaves_by_month);
    } else {
      setLeavesByMonth([]);
    }
  }

  useEffect(() => {
    fetchLeaves();
  }, [userData, leavesFilter]);

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

      const response = await fetch(buildUrl("/upload-leave"), {
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

        loadLeaves();
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

  const latestLeaveSource =
    leavesByMonth?.data?.length > 0
      ? leavesByMonth
      : { data: leaveHistory };

  // console.log(leavesByMonth, latestLeaveSource, leaveHistory)

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
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-semibold text-slate-800 mb-2">
              Leave History
            </Text>

            <TouchableOpacity className="mb-3 p-1 px-4 bg-indigo-500 rounded-full"
              onPress={() => setLatestLeaveModal(prev => !prev)}
            >
              <Text className="text-white text-center text-[16px]">view all</Text>
            </TouchableOpacity>
          </View>

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

              <View className="flex-row justify-between items-center">
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

                <TouchableOpacity onPress={() => setLatestLeaveModal(prev => !prev)}
                  className="mt-2">
                  <Text className="text-blue-500">view details</Text>
                </TouchableOpacity>
              </View>


              {/* application details modal */}
              <Modal transparent={true} visible={latestLeaveModal} animationType="slide">
                <View className="bg-white flex-1 p-5 rounded-t-3xl">
                  <View className="flex-row justify-between">
                    <Text className="text-xl font-semibold">Latest application details</Text>
                    <TouchableOpacity onPress={() => setLatestLeaveModal(false)}>
                      <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                  </View>

                  <View className={`${latestLeaveCollapsed.collapsed ? "h-20" : "h-auto"} overflow-hidden p-4 mt-4 bg-gray-50 rounded-xl elevation-sm`}>

                    <TouchableOpacity onPress={() => setLatestLeaveCollapsed(prev => ({ ...prev, collapsed: !latestLeaveCollapsed.collapsed }))}>
                      <View className="p-2 -mr-3 -mt-3 ml-auto">
                        <Ionicons size={16} name={`${latestLeaveCollapsed.collapsed ? "chevron-down" : "chevron-up"}`} />
                      </View>
                    </TouchableOpacity>

                    <View className="flex-row justify-between">
                      <Text className="bg-blue-200 p-1 px-2 mb-1 rounded-md self-start">
                        From: {new Date(latestLeaveSource?.data[latestLeaveCollapsed.index]?.applicable_from).toLocaleDateString()}</Text>

                      <Text className="bg-rose-200 p-1 px-2 mb-1 rounded-md self-start">
                        To: {new Date(latestLeaveSource?.data[latestLeaveCollapsed.index]?.applicable_to).toLocaleDateString()}
                      </Text>
                    </View>

                    <Text className="bg-green-200 p-1 px-2 my-1 rounded-md self-start">Subject: {latestLeaveSource?.data[latestLeaveCollapsed.index]?.subject}</Text>

                    <Text className="text-lg font-bold text-neutral-700 mt-2">Application</Text>

                    <Text className="bg-white border border-neutral-100 min-h-20 p-2 rounded-xl mt-2">
                      {latestLeaveSource?.data[latestLeaveCollapsed.index]?.application}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center my-6 mb-4">
                    <Text className="text-lg font-semibold">History</Text>

                    {/* filter */}
                    <Selector
                      defaultOption={{ label: new Date().toLocaleDateString("en-Gb", { month: "long" }), value: new Date().getMonth() }}

                      options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(m => ({ label: new Date(new Date().getFullYear(), m, 1).toLocaleDateString("en-Gb", { month: "long" }), value: m }))}

                      onChange={(filter) => setLeavesFilter({...filter, month: filter.value, set: false})}
                    />
                  </View>


                  <View className="flex-col gap-4">
                    {
                      leavesByMonth?.data?.length > 0 ? (
                        leavesByMonth?.data?.map((leave, index) => (
                          <CustomButton
                            key={index}
                            onPress={() => {
                              setLatestLeaveCollapsed(prev => ({ ...prev, collapsed: false, index: index }))
                            }}
                          >
                            <View key={index} className="flex-col bg-gray-50 elevation-sm p-3 rounded-xl">
                              <Text className="font-semibold text-[16px] mb-2">{leave?.subject}</Text>

                              <View className="flex-row justify-between">
                                <Text className="text-neutral-700">{new Date(leave?.applicable_from).toLocaleDateString()} - {new Date(leave?.applicable_to).toLocaleDateString()}</Text>

                                <Text className={`p-1 rounded-full px-3 ${leave?.status.trim().toLowerCase() === "pending" ? "bg-yellow-200" : leave?.status.trim().toLowerCase() === "approved" ? "bg-green-200" : "bg-red-200"}`}>{leave?.status}</Text>
                              </View>
                            </View>
                          </CustomButton>
                        ))
                      ) : (
                        <Text className="text-neutral-600 font-semibold text-lg text-center py-20">No leave found for {new Date(new Date().getFullYear(), leavesByMonth?.month || new Date().getMonth(), 1).toLocaleDateString("en-Gb", { month: "long" })}</Text>
                      )
                    }
                  </View>

                </View>
              </Modal>
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
              {fromDate?.toLocaleString() || "Select Date"}
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
                selectedDate.setHours(0, 5, 0, 0);
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
              {toDate?.toLocaleString() || "Select Date"}
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
                selectedDate.setHours(23, 55, 0, 0)
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