import { createContext, useContext, useEffect, useState } from "react";
import { requestFCMToken } from "./requestToken";
import { messaging } from "./firebase";
import { onMessage } from "firebase/messaging";
import { Fetch } from "./api";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [userData, setUserData] = useState({});
    const [classes, setClasses] = useState([]);
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [teacherLeaveHistory, setTeacherLeaveHistory] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    const formatDate = (date) => {
        if (!date) return "Select Date";
        return new Date(date)
            .toISOString()
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

    const loadTimetable = async (userCreds, selectedDay) => {
        // set saved classes
        const savedClasses = await window.localStorage.getItem("classes");
        if (!!savedClasses) {
            setClasses(JSON.parse(savedClasses));
        }
        if (!userCreds) return;

        const date = new Date();
        const day = selectedDay || date.toLocaleString("en-Gb", { weekday: "long" });
        const section = userCreds?.section || "A";
        const role = userCreds?.role?.toLowerCase();

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
            const json = await response.json();
            const data = json?.data;

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

            if (!!selectedDay) {
                return { day, classes: timetable }
            }
            else {
                setClasses({ day, classes: timetable })
            };

            window.localStorage.setItem("classes", JSON.stringify({ day, classes: timetable }));

        } catch (err) {
            console.log("Timetable error:", err);
        }
    }

    async function SubscribePushNotification(userCreds) {
        try {
            const token = await requestFCMToken();
            if (!token) return false;
            await window.localStorage.setItem("fcm_token", token);

            const res = await Fetch("/save-fcm-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token
                })
            });

            const response = await res.json();
            return !!response.success;

        } catch (err) {
            console.error("Push subscription failed:", err);
            return false;
        }
    }

    const loadLeaves = async (filter) => {
        if (!userData?.email) return;

        try {
            // student leaves
            const studentLeavesEndpoint = `/api/leaves/students?${filter?.month ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : ""}&time=${encodeURIComponent(formatDate(new Date()))}`;

            const studentLeavesResponse = await Fetch(studentLeavesEndpoint);
            const studentLeaves = studentLeavesResponse.ok ? await studentLeavesResponse.json() : {};

            // teacher leaves
            const teacherLeavesEndpoint = `/api/leaves/teachers?${filter?.label ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : ""}&time=${encodeURIComponent(formatDate(new Date()))}`;

            const teacherLeavesResponse = await Fetch(teacherLeavesEndpoint);
            const teacherLeaves = teacherLeavesResponse.ok ? await teacherLeavesResponse.json() : {};

            // console.log(studentLeaves, filter.month, !!filter, filter?.return, filter?.set)

            if(!!filter && filter?.set) {
                setLeaveHistory(studentLeaves?.leaves || []);
                setTeacherLeaveHistory(teacherLeaves?.leaves || []);
            }
            else {
                setLeaveHistory(studentLeaves?.leaves || []);
                setTeacherLeaveHistory(teacherLeaves?.leaves || []);
            }

            if (!!filter && filter?.return) {
                return {
                    month: filter?.month,
                    student_leaves: studentLeaves?.leaves || [],
                    teacher_leaves: teacherLeaves?.leaves || []
                };
            }
        } catch (err) {
            console.log("Leaves error:", err);
        }
    }

    async function loadAnnouncements() {  
        const endpoint = `/api/announcements?role=${userData?.role || "Student"}&teacher_id=${userData?.teacher_id || null}&college_id=${userData?.college_id}&course_id=${userData?.course_id}&branch=${userData.branch_id}&section=${userData.section}&year=${userData.year}&time=${encodeURIComponent(formatDate(new Date()))}`;

        const response = await Fetch(endpoint);

        const res_data = await response.json();

        const announcements = res_data.data;
        if (announcements.length > 0) {
            setAnnouncements(announcements);
        }
    }

    useEffect(() => {
        // fetch user data
        const fetchUser = async () => {
            if(window.location.pathname === "/login" || window.location.pathname === "/signup") return;
            const res = await Fetch("/api/auth/me");
            const response = await res.json();
            const user = response.user;

            if(user) {
                setUserData(user);
            } else setUserData(null);
        }
        fetchUser();
    }, [])

    useEffect(() => {
        if (!userData?.email) return;
        loadTimetable(userData);

        if (Notification.permission === "granted") {
            SubscribePushNotification(userData)
        };

        // load announcement
        loadAnnouncements();
    }, [userData])

    // listen for incoming notification
    onMessage(messaging, (payload) => {
        console.log("Foreground push received", payload);
        if (!userData?.email) return;

        // load timetable
        loadTimetable(userData);
        // load leaves
        loadLeaves(userData?.role);
        // load announcement
        loadAnnouncements();
    });

    const exports = {
        userData, setUserData,
        classes, setClasses,
        loadTimetable,
        loadLeaves,
        announcements, loadAnnouncements,
        leaveHistory, setLeaveHistory,
        teacherLeaveHistory,
        formatDate
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