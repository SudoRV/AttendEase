import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import AttendanceDashboard from "../components/AttendanceDashbboard";
import NotSignedIn from "../components/NotSignedIn";
import { AppStates } from "../context/AppStates";

const { width, height } = Dimensions.get("window");

const TimeTableScreen = () => {
  const { classes, userData, teacherLeaveHistory } = AppStates();

  const [rotated, setRotated] = useState(false);

  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [teacherLeaves, setTeacherLeaves] = useState([]);

  const defaultTimeSlots = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM"
  ];

  const handleLongPress = (item) => {
    if (!item?.teacher_id) return;

    const leaves = teacherLeaveHistory?.filter(
      leave => leave.teacher_id === item.teacher_id
    );
    setTeacherLeaves(leaves || []);
    setSelectedSlot(item);
    setLeaveModalVisible(true);
  };

  // if(!userData?.user_id) {
  //   return (
  //     <NotSignedIn />
  //   )
  // }

  return (
    <>
      <ScrollView className="flex-1 pt-8 bg-slate-100">

        <Text className="text-[30px] font-bold ml-3 mt-4 text-indigo-500">AttendEase</Text>

        <TouchableOpacity
          className="absolute top-3.5 right-4 bg-white p-2 rounded-full elevation-5 z-20"
          onPress={() => setRotated(prev => !prev)}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={22}
            color="#333"
            style={{
              transform: [{ rotate: rotated ? "90deg" : "0deg" }]
            }}
          />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className={`flex-1 ${rotated ? "" : ""}`}
          style={
            rotated
              ? {
                width: height - 210,
                height: width,
                marginTop: 125,
                transform: [{ rotate: "90deg" }, { translateY: 125 }]
              }
              : undefined
          }
        >

          <Text className="text-2xl font-bold ml-3 mt-2">
            {classes?.day || "Monday"}
          </Text>

          {/* Horizontal Schedule */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-3 mr-3 pb-1 flex-1"
          >
            {defaultTimeSlots.map((time, index) => {
              const item = classes?.classes?.[index];

              if (index === 0 && !item?.subject_id) return;

              return (
                <View
                  key={index}
                  className="w-[110px] items-center gap-2 mr-3 mt-3 pb-3"
                >

                  {/* TIME SLOT */}
                  <View className="bg-indigo-500 w-full p-2.5 rounded-xl shadow-lg">
                    <Text className="text-white text-sm font-semibold text-center">
                      {time}
                    </Text>
                  </View>

                  {/* SLOT CONTENT */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    delayLongPress={300}
                    onLongPress={() => handleLongPress(item)}
                    className="w-full flex-1"
                  >
                    {item?.subject_id ? (
                      <View
                        className={`w-full flex-1 justify-center items-center rounded-xl px-3 py-3 shadow-md ${item?.cancelled && !item?.substitute_teacher_id
                          ? "bg-red-50 border border-red-200"
                          : item?.isCurrentPeriod
                            ? "bg-indigo-500"
                            : "bg-white"
                          }`}
                      >

                        {/* CANCELLED BADGE */}
                        {!!item?.cancelled && (
                          <View className={`absolute -bottom-2.5 px-2 py-0.5 rounded-full ${item?.substitute_teacher_id ? "bg-teal-500" : "bg-red-500 "}`}>
                            <Text className="text-white text-[12px] font-semibold">
                              {item?.substitute_teacher_id ? "Substituted" : "Cancelled"}
                            </Text>
                          </View>
                        )}

                        <Text
                          className={`font-bold text-lg ${item?.cancelled && !item?.substitute_teacher_id
                            ? "text-red-600"
                            : item?.isCurrentPeriod
                              ? "text-white"
                              : "text-slate-900"
                            }`}
                        >
                          {item.subject_id}
                        </Text>

                        <View className="flex-1 justify-center items-center my-2 py-2 border-y border-slate-200">
                          <Text
                            numberOfLines={3}
                            ellipsizeMode="tail"
                            className={`text-center ${item?.cancelled && !item?.substitute_teacher_id
                              ? "text-red-500 line-through"
                              : item?.isCurrentPeriod
                                ? "text-white"
                                : "text-slate-700"
                              }`}
                          >
                            {item.subject_name}
                          </Text>
                        </View>

                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          className={`text-sm italic text-center ${item?.cancelled && !item?.substitute_teacher_id
                            ? "text-red-400"
                            : item?.isCurrentPeriod
                              ? "text-white"
                              : "text-slate-500"
                            }`}
                        >
                          {userData?.role === "Teacher"
                            ? `${item.branch_id || ""}-${item.year || ""}-${item.section || ""}`
                            : item.substitute_teacher_name || item.teacher_name}
                        </Text>

                      </View>
                    ) : (
                      <View
                        className={`w-full flex-1 justify-center items-center rounded-xl px-2.5 py-2 shadow-md ${item?.isCurrentPeriod ? "bg-indigo-500" : "bg-white"
                          }`}
                      >
                        <Text
                          className={`font-bold ${item?.isCurrentPeriod
                            ? "text-white"
                            : "text-green-500"
                            }`}
                        >
                          Free
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                </View>
              );
            })}
          </ScrollView>

          {/* attendance dashboard */}
          {
            userData?.role === "Student" && (
              <AttendanceDashboard />
            )
          }

          {/* Notes Section */}
          <View
            className={`bg-slate-200 m-4 p-4 rounded-xl mb-16 ${rotated ? "flex-row justify-end" : ""
              }`}
          >
            <View className={`${rotated ? "w-[65%]" : ""}`}>
              <Text className="font-bold mb-2">Note:</Text>

              <Text className="mb-2">
                This timetable provides a quick view of your daily academic
                schedule.
              </Text>

              <Text className="text-[13px] mb-1">
                • Shows subject, faculty, timing, and room details.
              </Text>
              <Text className="text-[13px] mb-1">
                • Indicates cancelled and ongoing classes.
              </Text>
              <Text className="text-[13px] mb-1">
                • Official notices take priority.
              </Text>
            </View>

            <View className={`mt-2 ${rotated ? "mt-auto" : ""}`}>
              <Text className="font-semibold">
                Department Coordinator
              </Text>
              <Text className="text-slate-600">
                {userData?.department || "Academic Affairs"}
              </Text>
              <Text className="text-[11px] text-slate-500 mt-1">
                Generated on {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>

        </ScrollView>
      </ScrollView>

      {/* LEAVE POPUP */}
      <Modal
        visible={leaveModalVisible}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setLeaveModalVisible(false)}
          className="flex-1 bg-black/40 justify-center items-center"
        >

          {/* Sanitized Modal Content */}
          <View className="bg-white w-[85%] rounded-xl p-4">
            <Text className="text-lg font-bold mb-2">Teacher Leave Details</Text>
            {selectedSlot ? (
              <Text className="text-sm text-slate-600 mb-3">{selectedSlot.teacher_name}</Text>
            ) : null}
            {teacherLeaves.length > 0 ? (
              teacherLeaves.map((leave, i) => (
                <View key={i} className="mb-2 border-b border-slate-200 pb-2">
                  <Text className="font-semibold">{leave.name}</Text>
                  <Text className="text-sm text-slate-600">
                    {new Date(leave.applicable_from).toLocaleDateString()} → {new Date(leave.applicable_to).toLocaleDateString()}
                  </Text>
                  <Text className="text-xs text-slate-500">Status: {leave.status}</Text>
                </View>
              ))
            ) : (
              <Text className="text-slate-500 text-sm">No leave records found</Text>
            )}
          </View>

        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default TimeTableScreen;