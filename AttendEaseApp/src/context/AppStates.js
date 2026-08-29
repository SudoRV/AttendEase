import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import { useColorScheme } from 'nativewind';
import { enableBluetooth } from "../components/BleToggle";
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { getCurrentTab } from "../navigation/navigationRef";

// import BleDataPropagation from "../utils/BleDataPropagation";
import BleAdvertiser from "../utils/BleAdvertiser";
// import { startMeshScannerLoop } from "../utils/BleDataScanning";
import { getDBConnection, saveNotification } from "../database/database";

// import { initializeScannerCallbacks } from '../utils/BleDataScanning';

// custom fetch api
import { Fetch } from "../services/api";
import popNotification from "../services/pop_notification";

const THEME_STORAGE_KEY = '@user_theme_preference';

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
  const [user, setUserData] = useState({});
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
  const database = getDBConnection();

  // ble dev states
  const [bleDevices, setBleDevices] = useState([]);

  const updateTheme = async (newMode) => {
    setThemePreference(newMode);
    setColorScheme(newMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  // load whole week timetable and save it in database
  async function saveTimetable() {
    const timetable = await loadTimetable(user, "null");
    if (!timetable) return;

    if (Object.keys(timetable)?.length > 1) {
      Object.keys(timetable)?.forEach(day => {
        const items = timetable[day];
        items?.forEach(item => {
          database.execute(`insert or replace into timetable (id,branch_id,branch_name,year,semester,section,day,period_id,subject_id,subject_name,room_number,teacher_id,teacher_name,cancelled,cancelled_from,cancelled_to,substitute_teacher_id,substitute_teacher_name,substituted_till
          )
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            item.id, item.branch_id, item.branch_name, item.year, item.semester, item.section, item.day, item.period_id, item.subject_id, item.subject_name, item.room_number, item.teacher_id, item.teacher_name, item.cancelled ? 1 : 0, item.cancelled_from, item.cancelled_to, item.substitute_teacher_id, item.substitute_teacher_name, item.substituted_till
          ])
        })
      })
    }
  }

  /* =====================
     TIMETABLE
  ===================== */
  const loadTimetable = async (userCreds, selectedDay) => {
    if (!userCreds) return;

    const date = new Date();
    const day = selectedDay || date.toLocaleString("en-Gb", { weekday: "long" });
    const role = userCreds?.role?.toLowerCase();
    const section = userCreds?.section || "A";

    // load local timetable 
    const rawSavedClasses = database.execute("select * from timetable where day = ?", [day]);
    const savedClasses = rawSavedClasses?.rows?._array;

    let endpoint = "";

    if (role === "student") {
      endpoint = `/api/timetable/student?year=${userCreds.year}&semester=${userCreds.semester}&branch=${userCreds.branch_id}&section=${section}&day=${day}`;
    } else if (role === "teacher") {
      endpoint = `/api/timetable/teacher?teacher_id=${userCreds?.teacher_id}&day=${day}`;
    } else {
      return;
    }

    try {
      const response = await Fetch(endpoint);
      let data;

      if (response?.status === 503) {
        data = {
          classes: savedClasses
        };
      } else {
        const json = await response.json();
        data = json?.data;

        if (json?.timetable) {
          return json.timetable;
        }
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

    } catch (err) {
      console.log("Timetable error:", err);
    }
  };


  const loadLeaves = async (filter) => {
    if (!user?.email) return;

    try {
      // student leaves
      const studentLeavesEndpoint = `/api/leaves/students?${filter?.label ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : ""}&time=${encodeURIComponent(formatDate(new Date()))}`;

      const studentLeavesResponse = await Fetch(studentLeavesEndpoint);
      const studentLeaves = studentLeavesResponse.ok ? await studentLeavesResponse.json() : {};

      // teacher leaves
      const teacherLeavesEndpoint = `/api/leaves/teachers?${filter?.label ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : ""}&time=${encodeURIComponent(formatDate(new Date()))}`;

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

  useEffect(() => {
    // Load saved theme from storage on app bootup
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


    // fetch user data
    const fetchUser = async () => {
      const tab = getCurrentTab();
      if (tab === "Login") return;

      const res = await Fetch("/api/auth/me");

      let user;

      if (!res.ok && res?.status === 503) {
        const rawSavedUser = await AsyncStorage.getItem("user_creds");
        const savedUser = JSON.parse(rawSavedUser || "{}");

        if (savedUser?.id) {
          user = savedUser;
        };
      }
      else {
        const response = await res.json();
        if (response?.user) {
          user = response.user
        };
      }

      if (user) {
        setUserData(user);
      } else setUserData(null);
    }
    fetchUser();


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
            // await startMeshScannerLoop();
            console.log('🟢 BLE Core Scanner Started');
          };
          return parsedValue;
        } catch (e) {
          setBleOn(false);
          return false;
        }
      }
    }
    checkBleState();


    // Bind context state modifiers directly to the scanning engine reference pointers
    // initializeScannerCallbacks(setBleDevices, loadTimetable);
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


  useEffect(() => {
    if (!user?.email) return;
    setLogout(false);

    loadTimetable(user);
    if (user.role === "Student") saveTimetable();
    loadLeaves();

    // listen for new message
    // 1. Get the modular messaging instance
    const messagingInstance = getMessaging();

    BleAdvertiser(database, {
      "originalPriority": 1,
      "priority": 1,
      "sentTime": 1781611965387,
      "data": {
        "scope": "BTECH_CSE_4_A",
        "body": "Period 1 of Dr. Jagat Pal Singh cancelled, on leave for 16 Jun 2026",
        "title": "Class Cancelled",
        "type": "CLASS_CANCELLED",
        "metadata": "{\"leave_type\":\"period\",\"status\":\"1\",\"teacher_id\":\"T_AHT016\",\"period_id\":[1],\"on\":\"1970-01-01T00:00:00.000Z\",\"from\":\"2026-06-15T18:35:00.000Z\",\"to\":\"2026-06-16T18:25:00.000Z\"}"
      },
      "from": "/topics/CSE_4_A",
      "messageId": "0:1781611965391503%3c69d815f9fd7ecd",
      "ttl": 2419200
    });

    // BleAdvertiser(database, {
    //   "originalPriority": 1,
    //   "priority": 1,
    //   "sentTime": 1787725747441,
    //   "data": {
    //     "body": "hey",
    //     "metadata": "{\"scope\":\"students\",\"target_college\":1001,\"target_course\":[\"B.TECH\"],\"target_branch\":[\"AI/ML\",\"CSE\"],\"target_year\":[4],\"target_section\":[\"all\"]}",
    //     "scope": "{\"courses\":[\"B.TECH\"],\"branches\":[\"AI/ML\",\"CSE\"],\"years\":[4],\"sections\":[\"all\"]}",
    //     "title": "hi",
    //     "type": "ANNOUNCEMENT"
    //   },
    //   "from": "959032391778",
    //   "messageId": "0:1787725747446195%3c69d815f9fd7ecd",
    //   "ttl": 2419200
    // });


    // 2. Set up the foreground listener
    const unsubscribe = onMessage(messagingInstance, async (remoteMessage) => {
      // save to local database
      const notification_id = (sHash(remoteMessage.messageId) >>> 0)
        .toString(16).toUpperCase()
        .padStart(8, "0");
      saveNotification(database, {
        notification_id: notification_id,
        scope: remoteMessage.data.scope,
        source: "FCM",
        type: remoteMessage.data.type,
        title: remoteMessage.data.title,
        body: remoteMessage.data.body
      });

      // propagate notification
      // BleDataPropagation(database, remoteMessage);
      // BleAdvertiser(database, remoteMessage);

      try {
        // pop notification
        popNotification(remoteMessage);
      } catch (error) {
        console.warn(error)
      }

      // Refresh data silently!
      if (remoteMessage?.data?.type !== "ANNOUNCEMENTS") {
        loadTimetable(user);
        loadLeaves();
      }
    });



    // download college metadata/scopes for ble encoding
    async function loadMetadata() {
      console.log("loading metadata")
      if (!user?.id) return;
      // load saved metadata
      const today = new Date();
      const savedMetadata = await AsyncStorage.getItem("college_metadata");
      let metadata = JSON.parse(savedMetadata || "{}");

      if (!metadata?.exp || new Date(metadata?.exp) < today.getTime()) {
        console.log("fetching metadata")
        const res = await Fetch("/college/metadata/all");
        const response = await res.json();
        console.log(response)
        if (response?.data) metadata = response.data;
      }

      if (!metadata?.exp || new Date(metadata?.exp) < today) {
        metadata.exp = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime();
        await AsyncStorage.setItem("college_metadata", JSON.stringify(metadata))
      };
    }
    loadMetadata();


    // 3. Clean up the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [user]);

  // highlight current period
  useEffect(() => {
    if (!user?.email) return;

    const runAtWholeHour = (fn) => {
      const now = new Date();
      const msToNextHour =
        (60 - now.getMinutes()) * 60 * 1000 -
        now.getSeconds() * 1000 -
        now.getMilliseconds();

      const timeoutId = setTimeout(() => {
        fn();
        const intervalId = setInterval(fn, 60 * 60 * 1000);
        return () => clearInterval(intervalId);
      }, msToNextHour);

      return () => clearTimeout(timeoutId);
    };

    const cleanup = runAtWholeHour(() => {
      loadTimetable(user);
    });

    return () => cleanup && cleanup();
  }, [user, loadTimetable]);

  return (
    <GlobalContext.Provider
      value={{
        activeTab, setActiveTab,
        user, setUserData,
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

        bleDevices, setBleDevices,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

const defaultGlobalContext = {
  activeTab: 0,
  setActiveTab: () => { },
  user: null,
  setUserData: () => { },
  classes: [],
  leaveHistory: [],
  loadTimetable: async () => undefined,
  database: null,
  loadLeaves: async () => undefined,
  teacherLeaveHistory: [],
  logout: false,
  setLogout: () => { },
  formatDate,
  bleOn: false,
  setBleOn: () => { },
  colorScheme: 'light',
  themePreference: 'system',
  updateTheme: async () => { },
  bleDevices: [],
  setBleDevices: () => { },
};

export const AppStates = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) {
    console.warn("AppStates was used outside GlobalProvider; using a safe fallback context.");
    return defaultGlobalContext;
  }
  return ctx;
};