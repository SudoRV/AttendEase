import { createContext, useContext, useEffect, useState } from "react";
import { requestFCMToken } from "./requestToken";
import { messaging } from "./firebase";
import { onMessage } from "firebase/messaging";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {

    const isProduction = false;

    // ⚠️ IMPORTANT:
    // Replace this with your computer’s local IP
    // Example: http://192.168.1.5:8000
    const BASE_URL = isProduction
        ? "https://attendease-nivr.onrender.com"
        : `http://${window.location.hostname}:8000`;

    const buildUrl = (endpoint) => `${BASE_URL}${endpoint}`;


    const [userData, setUserData] = useState({});
    const [classes, setClasses] = useState([]);
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

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

    const loadTimetable = async (userCreds, selectedDay) => {
        if (!userCreds) return;

        const date = new Date();
        const day = selectedDay || date.toLocaleString("en-Gb", { weekday: "long" });
        const section = userCreds?.section || "A";
        const role = userCreds?.role?.toLowerCase();

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

            console.log(data)

            data.classes = data.classes?.map(d => {
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
                        isCurrentPeriod: p === new Date().getHours() - 8
                    }
                );
            }


            if (!selectedDay) setClasses({ day, classes: timetable });
            else return { day, classes: timetable };

        } catch (err) {
            console.log("Timetable error:", err);
        }
    }

    async function requestNotification() {
        return new Promise((resolve, reject) => {
            if (!("Notification" in window)) {
                alert("This browser does not support notifications.");
                reject();
            } else {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        console.log("Notification permission granted!");
                        resolve(true);
                    } else if (permission === "denied") {
                        console.log("Permission denied.");
                        resolve(false);
                    } else {
                        console.log("Permission dismissed.");
                        reject(true);
                    }
                });
            }
        })
    }

    async function SubscribePushNotification(userCreds) {
        const granted = await requestNotification();
        if (!granted) return false;

        try {
            const token = await requestFCMToken();
            if (!token) return false;

            const response = await fetch(buildUrl("/save-fcm-token"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: userCreds?.email,
                    token,
                    topics: userCreds?.role === "Student"
                        ? [
                            `year_${userCreds?.year}`,
                            `branch_${userCreds?.branch}`,
                            `${userCreds?.branch}_${userCreds?.year}_${userCreds?.section}`
                        ]
                        : ["teachers"]
                })
            });

            const res_data = await response.json();
            return !!res_data.success;

        } catch (err) {
            console.error("Push subscription failed:", err);
            return false;
        }
    }

    const loadLeaves = async (filter) => {
        if (!userData?.email) return;

        try {
            const endpoint = `/fetch-leaves?user_data=${encodeURIComponent(
                JSON.stringify(userData)
            )}${filter?.month ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : ""}`;

            const response = await fetch(buildUrl(endpoint));
            const json = await response.json();

            // console.log(json)

            if (filter?.month) {
                return {
                    month: filter?.month,
                    ...json
                };
            }
            else {
                setLeaveHistory(json?.data || []);
                // setTeacherLeaveHistory(json?.teacher_leaves || []);
            }
        } catch (err) {
            console.log("Leaves error:", err);
        }
    };

    // functions
    async function doFetch(url, method = "GET", headers = {}, body = null) {
        try {
            const response = await fetch(buildUrl(url), {
                method,
                headers,
                body
            });

            return { data: response, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    }

    async function loadAnnouncements() {
        const response = await doFetch(`/announcements?year=${userData?.year}&branch=${userData?.branch}&section=${userData?.section}`, "GET");

        const res_data = await response.data.json();
        const announcements = res_data.data;
        if (announcements.length > 0) {
            setAnnouncements(announcements);
        }
    }


    // listen for incoming notification
    onMessage(messaging, (payload) => {
        console.log("Foreground push received", payload);
        if (!userData?.email) return;
        // load timetable
        loadTimetable(userData);
        loadLeaves(userData?.role)

        // load announcement
        if (userData?.role === "Teacher") return;
        loadAnnouncements();
    });


    useEffect(() => {
        const user_creds = localStorage.getItem("user_creds");
        const userCreds = user_creds ? JSON.parse(user_creds) : undefined;

        if (userCreds?.email !== undefined) {
            setUserData(userCreds);
        }
    }, [])

    useEffect(() => {
        if (!userData?.email) return;
        loadTimetable(userData);
        if (Notification.permission === "granted") SubscribePushNotification(userData);

        // load announcement
        if (userData?.role === "Teacher") return;
        loadAnnouncements();
    }, [userData])


    const exports = {
        BASE_URL,
        buildUrl,
        doFetch,
        userData, setUserData,
        classes, setClasses,
        loadTimetable,
        loadLeaves,
        announcements,
        leaveHistory, setLeaveHistory,
        requestNotification,
        SubscribePushNotification
    }

    return (
        <GlobalContext.Provider value={exports}>
            {children}
        </GlobalContext.Provider>
    )
}

export const AppStates = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("AppStates must be used inside GlobalContext.Provider");
    }
    return context;
};
