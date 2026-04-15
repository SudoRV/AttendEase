import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Use the standard React Native Firebase imports
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { AndroidStyle, EventType, AndroidImportance, AndroidVisibility } from '@notifee/react-native';

const isProduction = false;
const BASE_URL = isProduction
  ? "https://attendease-nivr.onrender.com"
  : "http://10.108.224.42:8000";

const buildUrl = (endpoint) => `${BASE_URL}${endpoint}`;

// 1. Helper function for the channel
const ensureChannel = async () => {
  return await notifee.createChannel({
    id: 'daily_class_alerts',
    name: 'Morning Class Alerts',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: 'default',
  });
};

// 2. Define the background message handler
const onMessageReceived = async (remoteMessage) => {
  console.log('Background Message Received:', remoteMessage.data);

  if (remoteMessage.data?.type === 'MORNING_SCHEDULE') {
    const channelId = await ensureChannel();

    const totalClasses = JSON.parse(remoteMessage?.data?.classes).filter(c => c.cancelled === 0).length;
    const subtitle = `${totalClasses} ${totalClasses > 1 ? "classes" : "class"} today`;

    const timestamp = Date.now();
    const scheduleImageUrl = buildUrl(`${remoteMessage?.data?.schedule_image}?v=${timestamp}`);

    await notifee.displayNotification({
      id: 'daily_schedule_alert',
      title: "📚 Today's Classes",
      subtitle: subtitle,
      android: {
        channelId: channelId,
        subText: subtitle,
        importance: AndroidImportance.HIGH,
        priority: 'high',

        ongoing: true,
        autoCancel: false,
        asForegroundService: true,

        pressAction: { id: 'default' },

        style: {
          type: AndroidStyle.BIGPICTURE,
          picture: scheduleImageUrl,
        },

        fullScreenAction: {
          id: 'default',
        },

        actions: [
          {
            title: 'Mark as Done',
            pressAction: { id: 'mark_done' }
          },
          {
            title: 'View Schedule',
            pressAction: { id: 'default' }
          },
        ],

        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }
};

// 3. Register the handler - Use the direct function reference
const messaging = getMessaging();
setBackgroundMessageHandler(messaging, onMessageReceived);

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


AppRegistry.registerComponent(appName, () => App);