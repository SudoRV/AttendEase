import notifee, { AndroidStyle, EventType, AndroidImportance, AndroidVisibility } from '@notifee/react-native';

const morningScheduleChannel = async () => {
    return await notifee.createChannel({
        id: 'daily_class_alerts',
        name: 'Morning Class Alerts',
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        sound: 'notification',
        vibration: true,
    });
};

const pushNotifications = async () => {
    const ids = {};

    const ncid2 = await notifee.createChannel({
        id: 'class_cancellation_alerts',
        name: 'Class Cancellation Alerts',
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        sound: 'notification',
        vibration: true,
    });
    ids["CLASS_CANCELLED"] = ncid2;

    const ncid3 = await notifee.createChannel({
        id: 'class_substitution_alerts',
        name: 'Class Substitution Alerts',
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        sound: 'notification',
        vibration: true,
    });
    ids["CLASS_SUBSTITUTION"] = ncid3;

    const ncid4 = await notifee.createChannel({
        id: 'leave_status_alerts',
        name: 'Leave Status Alerts',
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        sound: 'notification',
        vibration: true,
    });
    ids["LEAVE_STATUS"] = ncid4;

    const ncid5 = await notifee.createChannel({
        id: 'announcement_alerts',
        name: 'Announcement Alerts',
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        sound: 'notification',
        vibration: true,
    });
    ids["ANNOUNCEMENT"] = ncid5;

    return ids
};

export default async function popNotification(remoteMessage) {
    if (remoteMessage.data?.type === 'MORNING_SCHEDULE') {
        const channelId = await morningScheduleChannel();

        const totalClasses = JSON.parse(remoteMessage?.data?.classes).filter(c => c.cancelled === 0 || !!c.substitute_teacher_name).length;
        const subtitle = `${totalClasses} ${totalClasses > 1 ? "lectures" : "lecture"} ${remoteMessage?.data?.title?.includes("Today's") ? "today" : "tommorow"}`;

        const scheduleImageUrl = remoteMessage?.data?.schedule_image;

        // Fix escaped newline characters if the payload sends them as literal "\n"
        const formattedBody = remoteMessage?.data?.body?.replace(/\\n/g, '\n');

        await notifee.displayNotification({
            id: channelId,
            title: remoteMessage?.data?.title,
            subtitle: subtitle,
            // Only show body text if no image is present
            body: scheduleImageUrl ? undefined : formattedBody,
            android: {
                channelId: channelId,
                subText: subtitle,
                importance: AndroidImportance.HIGH,
                priority: 'high',

                ongoing: false,
                autoCancel: true,
                asForegroundService: false,

                pressAction: { id: 'default' },

                // Shows the image directly inside the Heads-Up pop-up
                largeIcon: scheduleImageUrl ? scheduleImageUrl : undefined,

                style: scheduleImageUrl
                    ? {
                        type: AndroidStyle.BIGPICTURE,
                        picture: scheduleImageUrl,
                        largeIcon: null,
                    }
                    : {
                        type: AndroidStyle.BIGTEXT,
                        text: formattedBody || '',
                    },

                actions: [
                    {
                        title: 'Mark as Done',
                        pressAction: { id: 'mark_done' },
                    },
                    {
                        title: 'View Schedule',
                        pressAction: { id: 'default' },
                    },
                ],

                smallIcon: 'ic_launcher',
            },
        });
    }
    else {
        const channelIds = await pushNotifications();
        const channelId = channelIds[remoteMessage.data?.type];

        await notifee.displayNotification({
            id: channelId,
            title: remoteMessage.data?.title || "Notification",
            subtitle: "",
            android: {
                channelId: channelId,
                subText: "",
                importance: AndroidImportance.HIGH,
                priority: 'high',

                ongoing: false,
                autoCancel: true,
                asForegroundService: false,

                pressAction: { id: 'default' },

                style: {
                    type: AndroidStyle.BIGTEXT,
                    text: remoteMessage.data?.body || "Message",
                    title: remoteMessage.data?.title || "Notification",
                },

                actions: [
                    {
                        title: 'Mark as Done',
                        pressAction: { id: 'mark_done' }
                    },
                ],

                smallIcon: 'ic_launcher',
                pressAction: { id: 'default' },
            },
        });
    }
}


// 4. Register the background event handler for notification buttons
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    if (type === EventType.ACTION_PRESS && pressAction.id === 'mark_done') {
        // Stop the foreground service and remove the notification
        await notifee.stopForegroundService();
        if (notification?.id) {
            await notifee.cancelNotification(notification.id);
        }
    }
});

notifee.registerForegroundService((notification) => {
    return new Promise(() => {
        // This keeps the service running. 
        // You can handle button presses here if needed.
        console.log("Foreground Service Registered and Running", notification);
    });
});