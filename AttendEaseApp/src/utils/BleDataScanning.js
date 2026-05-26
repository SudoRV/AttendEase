import { Platform, PermissionsAndroid } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { scopes, reverseScopes, decToHex, hexToDec } from "../constant/scopes";
import { getDBConnection } from '../database/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Instantiate the manager globally so it persists across renders
export const bleManager = new BleManager();
const database = getDBConnection();

let scannerInterval = null;
let isScanning = false;
let announcement = {
  init: false,
  notification_id: null,
  title: null,
  body: null
};

// 2. Helper to cleanly convert ble-plx Base64 manufacturer data to Hex
function base64ToHex(base64) {
  return Buffer.from(base64, 'base64').toString('hex').toUpperCase();
}

// Runtime Android permission helper
async function requestBLEPermissions() {
  if (Platform.OS !== 'android') return true;
  try {
    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      ]);
      return (
        granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('BLE Permission Error:', err);
    return false;
  }
}

// 3. The Processor: Filters and handles valid incoming packets
function processNotification(companyIdHex, uuid, major, minor) {
  let title, body;

  const companyId = 0xFFFF;
  const appid = "41545445"; // ATTE

  console.log("Checking packet:", appid, uuid, major, minor)

  const receivedCompanyId = parseInt(companyIdHex, 16);

  // 1. SAFETY CHECK: Ignore packets that don't match your custom 0xFFFF Company ID
  if (receivedCompanyId !== companyId) {
    return;
  }

  // SAFETY CHECK: Ignore all Bluetooth packets that don't belong to your app
  if (!uuid.toUpperCase().startsWith(appid)) {
    return;
  }

  console.log("Valid App Packet Received!");
  console.log(`UUID: ${uuid} | Major: ${major} | Minor: ${minor}`);

  // Break the UUID back down into its original blocks
  const blocks = uuid.split('-');
  const chunk1 = blocks[1]; // 4 chars
  const chunk2 = blocks[2]; // 4 chars
  const chunk3 = blocks[3]; // 4 chars

  const finalBlock = blocks[4];
  const notification_id = finalBlock.substring(0, 8);
  const notification_completed = finalBlock[11];
  // const typeFlag = finalBlock.substring(8, 10); // e.g., 1684, 0184, 0284

  // check if notification already received 
  const olderNotifications = database.execute("select * from notifications where notification_id = ?", [notification_id]).rows.length;

  console.log("Older notifications count:", olderNotifications)
  if (olderNotifications > 0) {
    console.log("notification already exists with id: ", notification_id);
    return;
  };

  // ----------------------------------------------------
  // YOUR CORE LOGIC HERE
  // ----------------------------------------------------
  // Example: Check typeFlag to know if this is Title data, Body data, or Class Cancellation
  // Example: Convert major/minor and chunk1/2/3 hex back into your 10-character string

  const notificationType = hexToDec(chunk1[0]);
  const announcementScope = notificationType === 2 ? unpackMetadata(chunk2 + chunk2) : null;
  const notificationScope = chunk1.slice(1, 4);
  const scopeBranch = notificationScope[0];
  const scopeYear = notificationScope[1];
  const scopeSection = notificationScope[2];

  console.log(notificationType, hexToDec(notificationType) === 2)

  // class cancellation
  if (notificationType === 0) {
    const leave_type = hexToDec(finalBlock[10]);
    const periods = decodePeriods(chunk2);
    const toDiff = hexToDec(chunk3);
    const from = new Date().toLocaleDateString();
    const to = leave_type === 2 ? new Date(new Date() + toDiff * 24 * 60 * 60 * 1000) : new Date();
    const teacherName = database.execute("select teacher_name from timetable where day = ? and period_id = ?", [new Date().toLocaleDateString("en-Gb", { weekday: "long" }), periods[0]]).rows._array[0];

    const message = `Period ${periods
      .map((p) => p.period_id)
      .join(", ")} of ${teacherName} cancelled, on leave ${new Date(from).toDateString() === to.toDateString()
        ? `for ${new Date(from).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`
        : `from ${new Date(from).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })} to ${new Date(to).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`
      }`

    title = "Class Cancellation";
    body = message;
  }

  // class substitution
  else if (notificationType === 1) {
    const substitutee = chunk2;
    const substitutionStatus = hexToDec(substitutee[2]);
    const substituteeDetails = database.execute("select teacher_name, subject_name from timetable where day = ? and period_id = ?", [new Date().toLocaleString("en-Gb", { weekday: "long" }), hexToDec(substitutee[3])]).rows._array[0];

    const substitutor = chunk3;
    const substitutorDay = scopes("day", hexToDec(substitutor[2]));
    const substitutorPeriod = hexToDec(chunk3[3]);
    const substitutorDetails = database.execute("select teacher_name from timetable where day = ? and period_id = ?", [substitutorDay, substitutorPeriod]).rows._array[0];

    const message = !!substitutionStatus ? `Class ${substituteeDetails.subject_name} of ${substituteeDetails.teacher_name} is substituted by ${substitutorDetails.teacher_name}` : `Substitution of class ${substituteeDetails.subject_name} cancelled by ${substitutorDetails.teacher_name}`;

    title = "Class Substitution";
    body = message;
  }

  // announcement
  else if (notificationType === 2) {
    const dataType = hexToDec(finalBlock[10]);

    // first block received with notification id
    if (!!announcement.init === false && dataType === 0) {
      announcement.init = true;
      announcement.notification_id = notification_id;

      console.log(announcement)
    }

    // other blocks with title and body
    else if (announcement.init === true && (dataType === 1 || dataType === 2) && announcement.notification_id === notification_id) {
      // 1. Recombine all the hex chunks just like they were before splitting
      const hexChunk = chunk1 + chunk2 + chunk3 + major + minor;

      // 2. Convert the hex string back to readable text characters
      let decodedString = "";
      for (let i = 0; i < hexChunk.length; i += 2) {
        // Grab two hex characters (one byte)
        const hexByte = hexChunk.substring(i, i + 2);

        // If we hit the padding zeros, stop decoding so we don't get null characters
        if (hexByte === "00") {
          break;
        }

        // Convert hex to decimal, then to the character
        const charCode = parseInt(hexByte, 16);
        decodedString += String.fromCharCode(charCode);
      }

      // 3. Append the clean, decoded string to your title
      if (dataType === 1) {
        announcement.title += decodedString;
      } else {
        announcement.body += decodedString;
      }
    };

    if (announcement.init === true && announcement.notification_id === notification_id && notification_completed) {
      title = announcement.title;
      body = announcement.body;

      announcement = {
        init: false,
        notification_id: null,
        title: null,
        body: null
      }
    }
  }

  // display and propagate received notification + save it in local database
  if (title && body) {
    console.log("\n========== NOTIFICATION PROCESSED ==========");
    console.log("Notification ID:", notification_id);
    console.log("Title:", title);
    console.log("Body:", body);
    console.log("Type:", notificationType);
    console.log("========================================\n");
    // TODO: Add actual notification display/propagation logic here
  } else {
    console.warn("Notification processing incomplete - missing title or body");
  }

}

// 4. The Scanner Engine: Handles time-slicing and data extraction
export async function startScanning() {
  const smartScanStateRaw = await AsyncStorage.getItem("smart_scan_state");
  const smartScanState = JSON.parse(smartScanStateRaw);

  const hour = new Date().getHours();

  if(smartScanState && (hour < 8 || hour > 18)) return;

  if (scannerInterval) return;

  // 1. Check permissions BEFORE starting the interval processing engine
  const hasPermission = await requestBLEPermissions();
  if (!hasPermission) {
    console.error("Scanner Aborted: Missing Bluetooth/Location permissions.");
    return;
  }

  if (!isScanning) {
    isScanning = true;
    console.log("Scanner: Active cycle. Starting scan...");

    // processNotification("0xFFFF", "41545445-2BCF-4090-0002-6ECB41DEB000", "1280", "51210");

    setTimeout(() => {
      // processNotification("0xFFFF", "41545445-2BCF-4090-0002-6ECB41DEB000", "1280", "51210");
    }, 2000);

    bleManager.startDeviceScan(null, { allowDuplicates: true }, (error, device) => {
      if (error) {
        console.error("Scan error:", error);
        return;
      }

      if (device && device.manufacturerData) {
        const hexData = base64ToHex(device.manufacturerData);

        // Your script expects standard iBeacon layout length matching
        if (hexData.length >= 48) {
          const companyIdHex = hexData.substring(0, 4).toUpperCase();
          const uuidStr = hexData.substring(8, 40);
          const majorHex = hexData.substring(40, 44);
          const minorHex = hexData.substring(44, 48);

          const formattedUuid = `${uuidStr.slice(0, 8)}-${uuidStr.slice(8, 12)}-${uuidStr.slice(12, 16)}-${uuidStr.slice(16, 20)}-${uuidStr.slice(20)}`;
          const major = parseInt(majorHex, 16);
          const minor = parseInt(minorHex, 16);

          processNotification(companyIdHex, formattedUuid, major, minor);
        }
      } else {
        // console.log("device without mf data", device)
      }
    });
  }
}

export function stopScanning() {
  bleManager.stopDeviceScan();
  isScanning = false;
}





function encodePeriods(periods = []) {
  let mask = 0;
  periods.forEach(p => {
    if (p >= 0) mask |= (1 << p);
  });
  return mask.toString(16).padStart(4, "0").toUpperCase();
}

function decodePeriods(hex) {
  const mask = parseInt(hex, 16);
  const periods = [];
  for (let i = 0; i < 16; i++) {
    if (mask & (1 << i)) periods.push(i);
  }
  return periods;
}

function unpackMetadata(hex) {
  const value = parseInt(hex, 16);

  const type = (value >> 29) & 0x03;
  const branchMask = (value >> 22) & 0x7F;
  const yearMask = (value >> 16) & 0x3F;
  const sectionMask = (value >> 1) & 0x7FFF;
  const scope = value & 0x01; // Extracts the final flag bit safely

  return {
    type: reverseScopes("notification_type", type),
    scope: scope, // Added direct output assignment
    branches: Array.from({ length: 7 }, (_, b) => b).filter(b => branchMask & (1 << b)).map(b => reverseScopes("branch", b)),
    years: Array.from({ length: 6 }, (_, y) => y).filter(y => yearMask & (1 << y)).map(y => reverseScopes("year", y)),
    sections: Array.from({ length: 15 }, (_, s) => s).filter(s => sectionMask & (1 << s)).map(s => reverseScopes("section", s))
  };
}