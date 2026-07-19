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
  RefreshControl,
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColorScheme } from "nativewind";
import { AppStates } from "../context/AppStates";
import { Fetch } from "../services/api";

const StudentLeaveManagement = () => {
  const {
    userData,
    BASE_URL,
    loadLeaves,
    leaveHistory,
    setLeaveHistory,
    classes
  } = AppStates();

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [activeTab, setActiveTab] = useState("leaves");
  const [filterMode, setFilterMode] = useState("all");
  const [leavesCount, setLeavesCount] = useState(0);
  const [currentClass, setCurrentClass] = useState(classes.classes?.find(c => c.isCurrentPeriod) || {});
  const [showAvailability, setShowAvailability] = useState(false);
  const [loading, setLoading] = useState(false);

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
        l.branch === currentClass.branch_id &&
        l.section === currentClass.section
      );
    });

  async function verifyLeave(action, applicant) {
    try {
      const response = await Fetch(`${BASE_URL}/api/leaves/students/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          {
            action: action,
            applicant: applicant,
            verifier: {
              role: userData.role,
              teacher_id: userData.teacher_id,
              teacher_name: userData.name
            },
          }
        )
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
    loadLeaves();
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
      Pending: isDark ? "bg-amber-400 text-amber-400" : "bg-amber-100 text-amber-700",
      Approved: isDark ? "bg-emerald-400 text-emerald-400" : "bg-emerald-100 text-emerald-700",
      Rejected: isDark ? "bg-red-400 text-red-400" : "bg-red-100 text-red-700"
    };

    return (
      <View className={`px-3 py-1 rounded-full ${map[status] || "bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300"}`}>
        <Text className="font-medium text-sm">{status}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 px-4 pt-14">

      {/* Header */}
      <View className="mb-6">
        <Text className="text-[26px] font-bold text-slate-800 dark:text-neutral-50">
          Leave Management
        </Text>
        <Text className="text-slate-500 dark:text-neutral-400 mt-2">
          Manage and verify student leave requests.
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border !rounded-full border-neutral-400 dark:border-neutral-700 p-1 mb-4 relative bg-transparent">

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
                : "text-slate-600 dark:text-neutral-400"
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
            className={`px-4 py-2 rounded-full ${filterMode === mode
              ? "bg-indigo-600"
              : "bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800"
              }`}
          >
            <Text
              className={`font-medium text-sm ${filterMode === mode
                ? "text-white"
                : "text-slate-600 dark:text-neutral-400"
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
            <Ionicons name="document-text-outline" size={48} color={isDark ? "#4b5563" : "#94a3b8"} />
            <Text className="mt-4 text-slate-500 dark:text-neutral-400">
              No leave requests found
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View className="bg-gray-50 dark:bg-neutral-900/40 rounded-2xl p-4 px-5 mb-4 shadow border border-slate-200 dark:border-neutral-800/60">

            <View className="flex-row justify-between items-start mb-2">
              <View>
                <Text className="text-lg font-semibold text-slate-800 dark:text-neutral-100">
                  {item.name}
                </Text>
                <Text className="text-slate-500 dark:text-neutral-400 mt-1 text-sm">
                  {item.branch} • Year {item.year}
                </Text>
              </View>

              <StatusBadge status={item.status} />
            </View>

            <Text className="text-slate-600 dark:text-neutral-300 text-sm mb-3">
              {new Date(item.applicable_from).toLocaleDateString("en-GB")} —{" "}
              {new Date(item.applicable_to).toLocaleDateString("en-GB")}
            </Text>

            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setSelectedLeave(item)}>
                <Text className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
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

        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={async () => {
              await loadLeaves();
            }}
            progressViewOffset={-155}
            tintColor="#4F46E5"
            colors={["#4F46E5"]}
          />
        }
      />

      {/* Modal */}
      <Modal visible={!!selectedLeave} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/40 dark:bg-black/60 justify-end"
          onPress={() => setSelectedLeave(null)}
        >
          <Pressable
            className="bg-white dark:bg-neutral-900 rounded-t-3xl p-6 border-t border-transparent dark:border-neutral-800"
            onPress={(e) => e.stopPropagation()}
            style={{ maxHeight: '80%' }}
          >
            {selectedLeave && (
              <>
                <Text className="text-2xl font-bold text-slate-800 dark:text-neutral-50 mb-3">
                  Leave Application
                </Text>

                <Text className="text-slate-600 dark:text-neutral-200 mb-2">
                  {selectedLeave.name}
                </Text>

                <Text className="text-slate-500 dark:text-neutral-400 mb-4">
                  {selectedLeave.subject}
                </Text>

                <View style={{ maxHeight: 280 }}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{ flexGrow: 1 }}
                    className="mb-6"
                  >
                    <Pressable>
                      <Text className="text-slate-700 dark:text-neutral-300 leading-6">
                        {selectedLeave.application}
                      </Text>
                    </Pressable>
                  </ScrollView>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedLeave(null)}
                  className="py-4 bg-slate-800 dark:bg-neutral-800 rounded-xl border border-transparent dark:border-neutral-700"
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
    </View>
  );
};

export default StudentLeaveManagement;