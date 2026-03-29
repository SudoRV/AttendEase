import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  Pressable,
  Alert,
  Animated,
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppStates } from "../context/AppStates";
import TeacherLeave from "./TeacherLeave";

const StudentLeaveManagement = () => {
  const {
    userData,
    BASE_URL,
    loadLeaves,
    leaveHistory,
    setLeaveHistory,
    classes
  } = AppStates();

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [activeTab, setActiveTab] = useState("leaves");
  const [filterMode, setFilterMode] = useState("all");
  const [leavesCount, setLeavesCount] = useState(0);
  const [currentClass, setCurrentClass] = useState(classes.classes?.find(c => c.isCurrentPeriod) || {});
  const [showAvailability, setShowAvailability] = useState(false);

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: leavesCount > 0 ? 1 : 0,
      duration: 300,
      delay: 1000,
      useNativeDriver: true,
    }).start();
  }, [leavesCount]);

  const filteredLeaves = leaveHistory
    ?.filter(l =>
      activeTab === "verify"
        ? l.status === "Pending"
        : l.status === "Approved" || l.status === "Partialy-Approved"
    )
    ?.filter(l => {
      if (filterMode === "all") return true;
      if (!currentClass) return false;

      return (
        l.year === currentClass.year &&
        l.branch === currentClass.branch &&
        l.section === currentClass.section
      );
    });

  async function verifyLeave(action, applicant) {
    try {
      const response = await fetch(`${BASE_URL}/verify-leave`, {
        method: "GET",
        headers: {
          "x-action": action,
          "x-applicant": applicant.student_id,
          "x-verifier": JSON.stringify({
            role: userData.role,
            teacher_id: userData.teacher_id,
            teacher_name: userData.name
          })
        }
      });

      const res_data = await response.json();

      if (res_data?.success) {
        setLeaveHistory(prev =>
          prev.filter(l => l.student_id !== applicant.student_id)
        );
      }
    } catch (error) {
      console.log("Verify error:", error);
    } finally {
      loadLeaves();
    }
  }

  useEffect(() => {
    loadLeaves("Teacher");
  }, [userData]);

  useEffect(() => {
    setCurrentClass(classes.classes?.find(c => c.isCurrentPeriod));
  }, [classes]);

  useEffect(() => {
    const count = leaveHistory.filter(l =>
      l.status === (activeTab === "leaves" ? "Pending" : "Approved")
    ).length;
    setLeavesCount(count);
  }, [activeTab, leaveHistory]);

  const StatusBadge = ({ status }) => {
    const map = {
      Pending: "bg-amber-100 text-amber-700",
      Approved: "bg-emerald-100 text-emerald-700",
      Rejected: "bg-red-100 text-red-700"
    };

    return (
      <View className={`px-3 py-1 rounded-full ${map[status] || "bg-slate-100 text-slate-700"}`}>
        <Text className="font-medium text-sm">{status}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 px-5 pt-12">

      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-bold text-slate-800">
          Leave Management
        </Text>
        <Text className="text-slate-500 mt-2">
          Manage and verify student leave requests.
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border !rounded-full border-neutral-400 p-1 mb-4 relative">

        {leavesCount > 0 && (
          <Animated.View
            pointerEvents="none"
            style={{
              opacity,
              position: "absolute",
              top: -12,
              right: activeTab === "leaves" && -12,
              left: activeTab === "verify" && -12
            }}
            className="bg-red-500 w-7 h-7 rounded-full items-center justify-center z-50 elevation-10"
          >
            <Text className="text-white font-bold">
              {leavesCount}
            </Text>
          </Animated.View>
        )}

        {["leaves", "verify"].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2 ${activeTab === tab
              ? "bg-indigo-600 rounded-full"
              : ""
              }`}
          >
            <Text
              className={`text-center font-semibold capitalize ${activeTab === tab
                ? "text-white"
                : "text-slate-600"
                }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filters */}
      <View className="flex-row gap-3 mb-4">
        {["all", "period"].map(mode => (
          <TouchableOpacity
            key={mode}
            onPress={() => setFilterMode(mode)}
            disabled={mode === "period" && !currentClass}
            className={`px-4 py-2 rounded-full ${filterMode === mode
              ? "bg-indigo-600"
              : "bg-white border border-slate-300"
              }`}
          >
            <Text
              className={`font-medium text-sm ${filterMode === mode
                ? "text-white"
                : "text-slate-600"
                }`}
            >
              {mode === "all" ? "All Leaves" : "By Period"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaves */}
      <FlatList
        data={filteredLeaves}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="mt-20 items-center">
            <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
            <Text className="mt-4 text-slate-500">
              No leave requests found
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View className="bg-white rounded-2xl p-4 px-5 mb-4 shadow-sm">

            <View className="flex-row justify-between items-start mb-2">
              <View>
                <Text className="text-lg font-semibold text-slate-800">
                  {item.name}
                </Text>
                <Text className="text-slate-500 mt-1 text-sm">
                  {item.branch} • Year {item.year}
                </Text>
              </View>

              <StatusBadge status={item.status} />
            </View>

            <Text className="text-slate-600 text-sm mb-3">
              {new Date(item.applicable_from).toLocaleDateString("en-GB")} —{" "}
              {new Date(item.applicable_to).toLocaleDateString("en-GB")}
            </Text>

            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setSelectedLeave(item)}>
                <Text className="text-sm text-indigo-600 font-medium">
                  View Details
                </Text>
              </TouchableOpacity>

              {activeTab === "verify" && (
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => verifyLeave("Rejected", item, index)}
                    className="px-4 py-2 bg-red-500 rounded-xl"
                  >
                    <Text className="text-white font-medium">
                      Reject
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => verifyLeave("Approved", item, index)}
                    className="px-4 py-2 bg-emerald-500 rounded-xl"
                  >
                    <Text className="text-white font-medium">
                      Approve
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

          </View>
        )}
      />

      {/* Modal */}
      <Modal visible={!!selectedLeave} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setSelectedLeave(null)}
        >
          <Pressable
            className="bg-white rounded-t-3xl p-6"
            onPress={e => e.stopPropagation()}
          >
            {selectedLeave && (
              <>
                <Text className="text-2xl font-bold text-slate-800 mb-3">
                  Leave Application
                </Text>

                <Text className="text-slate-600 mb-2">
                  {selectedLeave.name}
                </Text>

                <Text className="text-slate-500 mb-4">
                  {selectedLeave.subject}
                </Text>

                <ScrollView className="max-h-60 mb-6">
                  <Text className="text-slate-700 leading-6">
                    {selectedLeave.application}
                  </Text>
                </ScrollView>

                <TouchableOpacity
                  onPress={() => setSelectedLeave(null)}
                  className="py-4 bg-slate-800 rounded-xl"
                >
                  <Text className="text-white text-center font-semibold">
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* teacher leave */}
      {userData?.role === "Teacher" && (
        <View className="flex-row justify-end gap-2 my-3">
          <TouchableOpacity
            onPress={() => setShowAvailability(true)}
            className="self-center px-4 py-2 bg-indigo-100 rounded-full"
          >
            <Text className="text-indigo-600 font-medium text-sm">
              Teacher Leave
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showAvailability}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <TeacherLeave
          onClose={() => setShowAvailability(false)}
        />
      </Modal>

    </View>
  );
};

export default StudentLeaveManagement;