import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import requestFcmToken from "../utils/requestFcmToken";
import { getMessaging, onMessage } from '@react-native-firebase/messaging';

/* =====================
   ENV CONFIG
===================== */
const isProduction = false;

// ⚠️ IMPORTANT:
// Replace this with your computer’s local IP
// Example: http://192.168.1.5:8000
const BASE_URL = isProduction
  ? "https://attendease-nivr.onrender.com"
  : "http://10.73.202.96:8000";

const buildUrl = (endpoint) => `${BASE_URL}${endpoint}`;

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [userData, setUserData] = useState({});
  const [classes, setClasses] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [teacherLeaveHistory, setTeacherLeaveHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  /* =====================
     TIMETABLE
  ===================== */
  const loadTimetable = async (userCreds, selectedDay) => {
    if (!userCreds) return;

    const date = new Date();
    const day = selectedDay || date.toLocaleString("en-Gb", { weekday: "long" });
    const role = userCreds?.role?.toLowerCase();
    const section = userCreds?.section || "A";

    let endpoint = "";

    if (role === "student") {
      endpoint = `/get-timetable?year=${userCreds.year}&semester=${userCreds.semester}&branch=${userCreds.branch_id}&section=${section}&day=${day}`;
    } else if (role === "teacher") {
      endpoint = `/get-timetable?teacher_name=${encodeURIComponent(
        userCreds?.name || ""
      )}&teacher_id=${userCreds?.teacher_id}&day=${day}`;
    } else {
      return;
    }

    try {
      const response = await fetch(buildUrl(endpoint));
      const json = await response.json();
      const data = json?.data;

      data.classes = data.classes?.map(d => {
        if(d?.period_id > 4) {
          return {
            ...d, 
            period_id: d.period_id + 1
          }
        } else return d;
      })

      if (!data?.classes) return;

      data.classes.push({
        subject_id: " ",
        period_id: 5,
        subject_name: "LUNCH",
        teacher_name: " "
      });

      const timetable = [];

      for (let p = 0; p < 10; p++) {
        const period = data.classes.find((c) => c.period_id === p);
        timetable.push(
          {
            ...period,
            isCurrentPeriod: p === new Date().getHours() - 8
          }
        );
      }


      if (!selectedDay) setClasses({ day, classes: timetable });
      else return { day, classes: timetable };

    } catch (err) {
      console.log("Timetable error:", err);
    }
  };

  /* =====================
     LEAVES
  ===================== */
  const loadLeaves = async (filter) => {
    if (!userData?.email) return;

    try {
      const endpoint = `/fetch-leaves?user_data=${encodeURIComponent(
        JSON.stringify(userData)
      )}${filter?.month ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : ""}`;

      const response = await fetch(buildUrl(endpoint));
      const json = await response.json();

      if (!!filter && !filter?.set) {
        return {
          month: filter?.month,
          ...json
        };
      }
      else {
        setLeaveHistory(json?.data || []);
        setTeacherLeaveHistory(json?.teacher_leaves || []);
      }
    } catch (err) {
      console.log("Leaves error:", err);
    }
  };

  /* =====================
     INIT USER (AsyncStorage)
  ===================== */
  useEffect(() => {
    const loadStoredUser = async () => {
      const stored = await AsyncStorage.getItem("user_creds");
      if (stored) {
        setUserData(JSON.parse(stored));
      }
    };
    loadStoredUser();
  }, []);

  /* =====================
     AUTO LOAD DATA
  ===================== */

  const saveFcmToken = async (userCreds) => {
    if (!userCreds || !userCreds.email) return false;

    try {
      // 1. Get the token (This triggers the permission prompt if needed)
      const token = await requestFcmToken();

      // If user denied permission or token failed, exit cleanly
      if (!token) return false;

      // 2. Determine topics
      const topics = userCreds.role?.toLowerCase() === "student"
        ? [
          `year_${userCreds.year}`,
          `branch_${userCreds.branch_id}`,
          `${userCreds.branch_id}_${userCreds.year}_${userCreds.section}`
        ]
        : ["teachers"];     

        console.log(topics)

      // 3. Save to your database
      const response = await fetch(buildUrl("/save-fcm-token"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_data: {...userData, device_info: {}},
          token: token,
          topics: topics
        })
      });

      if (!response.ok) {
        console.error("Backend refused token save:", response.status);
        return false;
      }

      // console.log("✅ FCM Token & Topics saved successfully!");
      return true;

    } catch (error) {
      console.error("Crash inside saveFcmToken:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!userData?.email) return;

    loadTimetable(userData);
    loadLeaves();

    // save fcm token
    saveFcmToken(userData);

    // listen for new message
    // 1. Get the modular messaging instance
    const messagingInstance = getMessaging();

    // 2. Set up the foreground listener
    const unsubscribe = onMessage(messagingInstance, async (remoteMessage) => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));

      // Refresh data silently!
      loadTimetable(userData);
      loadLeaves();
    });

    // 3. Clean up the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [userData]);

  return (
    <GlobalContext.Provider
      value={{
        activeTab, setActiveTab,
        isProduction,
        BASE_URL,
        buildUrl,
        userData, setUserData,
        classes,
        leaveHistory,
        loadTimetable,
        loadLeaves,
        teacherLeaveHistory
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const AppStates = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) {
    throw new Error("AppStates must be used inside GlobalProvider");
  }
  return ctx;
};