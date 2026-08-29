import 'react-native-reanimated';
import { useEffect } from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Use the standard React Native Firebase imports
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import popNotification from './src/services/pop_notification';

// import BleDataPropagation from './src/utils/BleDataPropagation';
import { Buffer } from 'buffer';
global.Buffer = Buffer;
import { getDBConnection, saveNotification } from './src/database/database';

// 2. Define the background message handler
const onMessageReceived = async (remoteMessage) => {
  console.log('Background Message Received:', remoteMessage.data);
  // save notifications 
  saveNotification(null, { notification_id: remoteMessage.messageId, scope: remoteMessage.data.scope, source: "FCM", type: remoteMessage.data.type, title: remoteMessage.data.title, body: remoteMessage.data.body });
  // propagate message via ble advertise
  try {
    // const database = getDBConnection();
    // console.log("Starting background BLE data burst...");
    // await BleDataPropagation(database, remoteMessage);
    // console.log("Background BLE data burst complete.");
  } catch (bleErr) {
    console.error("BLE Propagation crashed in headless state:", bleErr);
  }

  popNotification(remoteMessage);
};

// 3. Register the handler - Use the direct function reference
const messaging = getMessaging();
setBackgroundMessageHandler(messaging, onMessageReceived);


AppRegistry.registerComponent(appName, () => App);