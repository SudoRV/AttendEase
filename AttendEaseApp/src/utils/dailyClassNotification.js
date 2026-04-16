// index.js
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidStyle, EventType, AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import { AppStates } from '../context/AppStates';

async function setupNotificationChannel() {
    await notifee.createChannel({
        id: 'daily_class_alerts', 
        name: 'Morning Class Alerts',
        description: 'Daily morning briefing of your upcoming lectures.',

        // HIGH importance triggers the "Heads-up" (banner) pop
        importance: AndroidImportance.HIGH,
        // Ensures the notification shows on the lock screen
        visibility: AndroidVisibility.PUBLIC,
        sound: 'notification',
        vibration: true,
    });
}

export default async function dailyClassNotification() {
    await setupNotificationChannel();
    
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        if (remoteMessage.data.type === 'MORNING_SCHEDULE') {
            const schedule = JSON.parse(remoteMessage.data.scheduleData);

            // Format the text card
            const bodyText = schedule.map(s => `${s.time}: ${s.sub}`).join(' | ');
            
            console.log(bodyText)

            await notifee.displayNotification({
                title: '📅 Today\'s Classes',
                body: "hi brothers",
                subtitle: "Rahul",
                android: {
                    channelId: 'daily_class_alerts',
                    subText: "Rahul Verma",
                    asForegroundService: true,
                    ongoing: true,
                    style: {
                        type: AndroidStyle.BIGTEXT,
                        text: bodyText,
                    },
                    actions: [
                        { title: 'Mark as Done', pressAction: { id: 'mark_done' } },
                        { title: 'Show Schedule', pressAction: { id: 'default' } },
                    ],
                },
            });
        }
    });

    // notifee.onBackgroundEvent(async ({ type, detail }) => {
    //     const { notification, pressAction } = detail;

    //     // Check if the user pressed the "Mark as Done" action
    //     if (type === EventType.ACTION_PRESS && pressAction.id === 'mark_done') {

    //         // 1. Logic: Update your local or remote database
    //         // Example: await fetch('http://10.20.137.25:8000/attendance/mark', { ... });

    //         // 2. Remove the persistent notification
    //         if (notification.id) {
    //             await notifee.cancelNotification(notification.id);
    //             // If it was a foreground service, stop it
    //             await notifee.stopForegroundService();
    //         }
    //     }
    // });
}