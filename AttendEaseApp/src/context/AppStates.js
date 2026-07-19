import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import requestFcmToken from "../utils/requestFcmToken";
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import { useColorScheme } from 'nativewind';
import { enableBluetooth } from "../components/BleToggle";
import changeNavigationBarColor from 'react-native-navigation-bar-color';

import BleDataPropagation from "../utils/BleDataPropagation";
import { startMeshScannerLoop } from "../utils/BleDataScanning";
import { getDBConnection, saveNotification } from "../database/database";

import { initializeScannerCallbacks } from '../utils/BleDataScanning';

// custom fetch api
import { Fetch } from "../services/api";

const isProduction = false;
const THEME_STORAGE_KEY = '@user_theme_preference';

// ⚠️ IMPORTANT:
// Replace this with your computer’s local IP
const BASE_URL = isProduction
  ? "https://attendease-nivr.onrender.com"
  : "http://10.30.212.249:8000";

const buildUrl = (endpoint) => `${BASE_URL}${endpoint}`;

const formatDate = (date) => {
  if (!date) return "Select Date";
  return new Date(date)
    .toISOString()
};

function sHash(str) {
  let hash = 0x811c9dc5;

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);

    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [userData, setUserData] = useState({});
  const [classes, setClasses] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [teacherLeaveHistory, setTeacherLeaveHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [logout, setLogout] = useState(false);
  const [bleOn, setBleOn] = useState(false);

  const { colorScheme, setColorScheme } = useColorScheme();
  const [themePreference, setThemePreference] = useState('system');
  const [loadingTheme, setLoadingTheme] = useState(true);
  const [isDark, setIsDark] = useState(null);

  // ble dev states
  const [bleDevices, setBleDevices] = useState([]);
  const [bleError, setBleError] = useState("");

  useEffect(() => {
    // Bind context state modifiers directly to the scanning engine reference pointers
    initializeScannerCallbacks(setBleDevices, setBleError);
  }, []);

  const database = getDBConnection();

  // Load saved theme from storage on app bootup
  useEffect(() => {
    async function loadSavedTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!!savedTheme) {
          setThemePreference(savedTheme);
          setColorScheme(savedTheme);
        } else {
          setThemePreference('system');
          setColorScheme('system');
        }
      } catch (e) {
        console.error("Failed to load theme preference", e);
      } finally {
        setLoadingTheme(false);
      }
    }
    loadSavedTheme();
  }, []);

  useEffect(() => {
    const is_dark = colorScheme === "dark";
    setIsDark(is_dark);

    async function setNavColor() {
      try {
        await changeNavigationBarColor(
          is_dark ? '#171717' : '#ffffff',
          !is_dark,
          false
        );
      } catch (e) {
        console.log(e);
      }
    }
    setNavColor();
  }, [colorScheme])

  const updateTheme = async (newMode) => {
    setThemePreference(newMode);
    setColorScheme(newMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  // highlight current period
  function runAtWholeHour(fn) {
    const now = new Date();

    const msToNextHour =
      (60 - now.getMinutes()) * 60 * 1000 -
      now.getSeconds() * 1000 -
      now.getMilliseconds();

    setTimeout(() => {
      fn(); // runs exactly at HH:00

      setInterval(fn, 60 * 60 * 1000); // every whole hour
    }, msToNextHour);
  }

  runAtWholeHour(() => {
    loadTimetable(userData);
  });

  /* =====================
     TIMETABLE
  ===================== */
  const loadTimetable = async (userCreds, selectedDay) => {
    // set saved classes
    const savedClasses = await AsyncStorage.getItem("classes");
    if (!!savedClasses) {
      setClasses(JSON.parse(savedClasses));
    }

    if (!userCreds) return;

    const date = new Date();
    const day = selectedDay || date.toLocaleString("en-Gb", { weekday: "long" });
    const role = userCreds?.role?.toLowerCase();
    const section = userCreds?.section || "A";

    let endpoint = "";

    if (role === "student") {
      endpoint = `/api/timetable/student?year=${userCreds.year}&semester=${userCreds.semester}&branch=${userCreds.branch_id}&section=${section}&day=${day}`;
    } else if (role === "teacher") {
      endpoint = `/api/timetable/student?teacher_id=${userCreds?.teacher_id}&day=${day}`;
    } else {
      return;
    }

    try {
      const response = await Fetch(endpoint);
      const json = await response.json();
      const data = json?.data;

      if (json?.timetable) {
        return json.timetable;
      }

      data.classes = data?.classes?.map(d => {
        if (d?.period_id > 4) {
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
            isCurrentPeriod: p === new Date().getHours() - 8 //p === 1 ? true : false 
          }
        );
      }

      if (!!selectedDay) {
        return { day, classes: timetable }
      }
      else {
        setClasses({ day, classes: timetable })
      };

      // console.log(timetable)
      AsyncStorage.setItem("classes", JSON.stringify({ day, classes: timetable }));

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
      // student leaves
      const studentLeavesEndpoint = `/api/leaves/students?user_data=${encodeURIComponent(
        JSON.stringify(userData)
      )}${filter?.label ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : ""}&time=${encodeURIComponent(formatDate(new Date()))}`;

      const studentLeavesResponse = await Fetch(studentLeavesEndpoint);
      const studentLeaves = studentLeavesResponse.ok ? await studentLeavesResponse.json() : {};

      // teacher leaves
      const teacherLeavesEndpoint = `/api/leaves/teachers?user_data=${encodeURIComponent(
        JSON.stringify(userData)
      )}${filter?.label ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : ""}&time=${encodeURIComponent(formatDate(new Date()))}`;

      const teacherLeavesResponse = await Fetch(teacherLeavesEndpoint);
      const teacherLeaves = teacherLeavesResponse.ok ? await teacherLeavesResponse.json() : {};

      if (!!filter && !filter?.set) {
        return {
          month: filter?.month,
          student_leaves: studentLeaves?.leaves || [],
          teacher_leaves: teacherLeaves?.leaves || []
        };
      }
      else {
        setLeaveHistory(studentLeaves?.leaves || []);
        setTeacherLeaveHistory(teacherLeaves?.leaves || []);
      }
    } catch (err) {
      console.log("Leaves error:", err);
    }
  }

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

    // load ble state
    async function checkBleState() {
      const ble_on = await AsyncStorage.getItem("ble_state");
      if (ble_on) {
        try {
          const parsedValue = JSON.parse(ble_on);

          setBleOn(parsedValue);
          if (!!parsedValue) {
            await enableBluetooth();
            // start scanning
            await startMeshScannerLoop();
          };
          return parsedValue;
        } catch (e) {
          setBleOn(false);
          return false;
        }
      }
    }
    checkBleState();
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

      // 3. Save to your database
      const response = await Fetch("/save-fcm-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_data: { ...userData, device_info: {} },
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
    setLogout(false);

    loadTimetable(userData);
    loadLeaves();

    // save fcm token
    saveFcmToken(userData);

    // listen for new message
    // 1. Get the modular messaging instance
    const messagingInstance = getMessaging();

    // BleDataPropagation(database, {
    //   "originalPriority": 1,
    //   "priority": 1,
    //   "sentTime": 1781611965387,
    //   "data": {
    //     "scope": "CSE_4_A",
    //     "body": "Period 1 of Dr. Jagat Pal Singh cancelled, on leave for 16 Jun 2026",
    //     "title": "Class Cancelled",
    //     "type": "CLASS_CANCELLED",
    //     "metadata": "{\"leave_type\":\"period\",\"status\":\"1\",\"teacher_id\":\"T_AHT016\",\"period_id\":[1],\"on\":\"1970-01-01T00:00:00.000Z\",\"from\":\"2026-06-15T18:35:00.000Z\",\"to\":\"2026-06-16T18:25:00.000Z\"}"
    //   },
    //   "from": "/topics/CSE_4_A",
    //   "messageId": "0:1781611965391503%3c69d815f9fd7ecd",
    //   "ttl": 2419200
    // });


    // 2. Set up the foreground listener
    const unsubscribe = onMessage(messagingInstance, async (remoteMessage) => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      // save to local database

      const notification_id = (sHash(remoteMessage.messageId) >>> 0)
        .toString(16).toUpperCase()
        .padStart(8, "0");

      saveNotification(database, { notification_id: notification_id, scope: remoteMessage.data.scope, source: "FCM", type: remoteMessage.data.type, title: remoteMessage.data.title, body: remoteMessage.data.body });

      // propagate notification
      BleDataPropagation(database, remoteMessage);

      // Refresh data silently!
      loadTimetable(userData);
      loadLeaves();
    });

    if (userData.role === "Student") saveTimetable();

    // 3. Clean up the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [userData]);

  // load whole week timetable and save it in database
  async function saveTimetable() {
    const timetable = await loadTimetable(userData, "null");
    if (!timetable) return;

    if (Object.keys(timetable).length > 1) {
      Object.keys(timetable).forEach(day => {
        const items = timetable[day];
        items.forEach(item => {
          database.execute(`insert or replace into timetable (id,branch_id,branch_name,year,semester,section,day,period_id,subject_id,subject_name,room_number,teacher_id,teacher_name,cancelled,cancelled_from,cancelled_to,substitute_teacher_id,substitute_teacher_name,substituted_till
          )
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            item.id, item.branch_id, item.branch_name, item.year, item.semester, item.section, item.day, item.period_id, item.subject_id, item.subject_name, item.room_number, item.teacher_id, item.teacher_name, item.cancelled ? 1 : 0, item.cancelled_from, item.cancelled_to, item.substitute_teacher_id, item.substitute_teacher_name, item.substituted_till
          ])
        })
      })
    }
  }

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
        database,
        loadLeaves,
        teacherLeaveHistory,
        logout, setLogout,
        formatDate,
        bleOn, setBleOn,
        colorScheme,
        themePreference, updateTheme,

        bleError, setBleError,
        bleDevices, setBleDevices,
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