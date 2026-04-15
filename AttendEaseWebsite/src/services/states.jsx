import { createContext, useContext, useEffect, useState } from "react";
import { requestFCMToken } from "./requestToken";
import { messaging } from "./firebase";
import { onMessage } from "firebase/messaging";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {

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


    const loadTimetable = async (userCreds) => {
        const days = [
            "Sunday", "Monday", "Tuesday",
            "Wednesday", "Thursday", "Friday", "Saturday"
        ];
        const date = new Date();
        const int_day = date.getDay();
        const day = days[int_day];
        const year = userCreds?.year;
        const branch = userCreds?.branch;
        const section = "A";
        const role = userCreds?.role;

        let url = "";
        if (role === "Student") url = `/get-timetable?year=${year}&branch=${branch}&section=${section}&day=${day}`;
        else url = `/get-timetable?teacher_name=${encodeURIComponent(userCreds?.name)}&teacher_id=${userCreds?.teacher_id}&day=${day}`;

        const response = await fetch(url);
        let data = await response.json();
        data = data.data;

        // pushing lunch
        const lunch = {
            period_id: 5,
            subject_id: ' ',
            subject_name: 'LUNCH',
            teacher_name: ' '
        }
        data?.classes?.push(lunch);

        const timetable = [];

        for (let p = 0; p < 10; p++) {
            const period = data?.classes.find(f => f.period_id === p);

            if (period) {
                const period_data = {
                    id: period.id,
                    day: period.day,
                    period_id: period.period_id,
                    subject_id: period.subject_id,
                    subject_name: period.subject_name,
                    teacher_name: period.teacher_name,
                    year: period.year,
                    branch_id: period.branch_id,
                    branch_name: period.branch_name,
                    section: period.section,
                    room_number: period.room_number,
                    cancelled: period.cancelled,
                    isCurrentPeriod: p === new Date().getHours() - 8 ? true : false
                }
                timetable.push(period_data);
            } else {
                timetable.push({ code: "", name: "", teacher: "", isCurrentPeriod: p === new Date().getHours() - 8 ? true : false })
            }
        }
        setClasses({ day: day, classes: timetable });
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

            const response = await fetch("/save-fcm-token", {
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

    async function loadLeaves() {
        if (!userData?.email) return;
        const url = `/fetch-leaves?user_data=${encodeURIComponent(JSON.stringify(userData))}`;
        const response = await doFetch(url, "GET");
        const leaves = await response.data.json();

        setLeaveHistory(leaves.data);
    }

    // functions
    async function doFetch(url, method = "GET", headers = {}, body = null) {
        try {
            const response = await fetch(url, {
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
