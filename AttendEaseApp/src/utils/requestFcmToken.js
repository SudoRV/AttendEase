import { 
  getMessaging, 
  requestPermission, 
  getToken 
} from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';

async function requestFcmToken() {
  try {
    requestUserPermission()
    // 1. Get the messaging instance
    const messaging = getMessaging();

    // 2. Request permission from the user
    const authStatus = await requestPermission(messaging);

    // 1 = AUTHORIZED, 2 = PROVISIONAL
    const enabled = authStatus === 1 || authStatus === 2;

    if (!enabled) {
      console.log("User declined notification permissions.");
      return null;
    }

    // 3. Fetch the FCM token for this device
    const token = await getToken(messaging);
    
    // console.log("FCM TOKEN:", token);

    return token;
  } catch (error) {
    console.error("Failed to get FCM token:", error);
    return null;
  }
}

export default requestFcmToken;


async function requestUserPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    // Android 13+ specific permission
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } else {
    // iOS and older Android versions
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    return enabled;
  }
}