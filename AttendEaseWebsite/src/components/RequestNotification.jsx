import { useEffect, useState } from "react"
import { AppStates } from "../services/states";

export default function RequestNotification() {
    const [notificationPermission, setNotificationPermission] = useState(false);

    const { userData, requestNotification, SubscribePushNotification } = AppStates();

    useEffect(() => {
        if (!("Notification" in window)) return "unsupported";
        const permission = Notification.permission;

        if (permission === "granted") setNotificationPermission(true);
        else setNotificationPermission(false);
    }, [])

    return (
        <div>
            {
                !notificationPermission && (
                    <div className="bg-slate-100 dark:bg-slate-800 flex p-2 px-12 mb-2 items-center justify-between gap-6 rounded-md">
                        <p className="text-xl">Allow Notifications to get latest updates</p>
                        <button className="p-2 px-8 text-lg rounded-lg bg-indigo-600 border-none text-white" onClick={async () => {
                            const granted = await requestNotification();
                            if (granted) SubscribePushNotification(userData);

                            if (granted) setNotificationPermission(true);
                            else setNotificationPermission(false);
                        }}>Allow</button>
                    </div>
                )
            }
        </div>
    )
}