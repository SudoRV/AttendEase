import { Platform, PermissionsAndroid, NativeModules, NativeEventEmitter } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { Buffer } from 'buffer';
import { scopes, reverseScopes, decToHex, hexToDec } from "../constant/scopes";
import { getDBConnection } from '../database/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize the native BleManager bridge and event emitter framework
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const database = getDBConnection();

let isScanning = false;
let bleDiscoverListener = null;

let announcement = {
  init: false,
  notification_id: null,
  title: null,
  body: null
};

// Helper to cleanly convert native array bytes or Base64 data to Hex strings
function payloadToHex(data) {
  if (!data) return '';
  // react-native-ble-manager usually provides arrays of raw byte values on Android
  if (Array.isArray(data)) {
    return Buffer.from(data).toString('hex').toUpperCase();
  }
  // Fallback to string handling if it's arriving as base64 string format
  return Buffer.from(data, 'base64').toString('hex').toUpperCase();
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

// The Processor: Filters and handles valid incoming packets
function processNotification(companyIdHex, uuid, major, minor) {
  let title, body;
  const companyId = 0xFFFF;
  const appid = "41545445"; // ATTE

  console.log("Checking packet:", appid, uuid, major, minor);
  const receivedCompanyId = parseInt(companyIdHex, 16);

  // 1. SAFETY CHECK: Ignore packets that don't match your custom 0xFFFF Company ID
  if (receivedCompanyId !== companyId) return;

  // SAFETY CHECK: Ignore all Bluetooth packets that don't belong to your app
  if (!uuid.toUpperCase().startsWith(appid)) return;

  console.log("Valid App Packet Received!");
  console.log(`UUID: ${uuid} | Major: ${major} | Minor: ${minor}`);

  const blocks = uuid.split('-');
  const chunk1 = blocks[1]; 
  const chunk2 = blocks[2]; 
  const chunk3 = blocks[3]; 

  const finalBlock = blocks[4];
  const notification_id = finalBlock.substring(0, 8);
  const notification_completed = finalBlock[11];

  // Check if notification already received 
  const olderNotifications = database.execute("select * from notifications where notification_id = ?", [notification_id]).rows.length;

  console.log("Older notifications count:", olderNotifications);
  if (olderNotifications > 0) {
    console.log("notification already exists with id: ", notification_id);
    return;
  }

  const notificationType = hexToDec(chunk1[0]);
  const announcementScope = notificationType === 2 ? unpackMetadata(chunk2 + chunk2) : null;
  const notificationScope = chunk1.slice(1, 4);
  const scopeBranch = notificationScope[0];
  const scopeYear = notificationScope[1];
  const scopeSection = notificationScope[2];

  // Class cancellation
  if (notificationType === 0) {
    const leave_type = hexToDec(finalBlock[10]);
    const periods = decodePeriods(chunk2);
    const toDiff = hexToDec(chunk3);
    const from = new Date().toLocaleDateString();
    const to = leave_type === 2 ? new Date(new Date() + toDiff * 24 * 60 * 60 * 1000) : new Date();
    const teacherName = database.execute("select teacher_name from timetable where day = ? and period_id = ?", [new Date().toLocaleDateString("en-Gb", { weekday: "long" }), periods[0]]).rows._array[0];

    const message = `Period ${periods.map((p) => p.period_id).join(", ")} of ${teacherName} cancelled, on leave ${new Date(from).toDateString() === to.toDateString()
        ? `for ${new Date(from).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
        : `from ${new Date(from).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} to ${new Date(to).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      }`;

    title = "Class Cancellation";
    body = message;
  }

  // Class substitution
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

  // Announcement processing
  else if (notificationType === 2) {
    const dataType = hexToDec(finalBlock[10]);

    if (!!announcement.init === false && dataType === 0) {
      announcement.init = true;
      announcement.notification_id = notification_id;
    }

    else if (announcement.init === true && (dataType === 1 || dataType === 2) && announcement.notification_id === notification_id) {
      const hexChunk = chunk1 + chunk2 + chunk3 + major + minor;

      let decodedString = "";
      for (let i = 0; i < hexChunk.length; i += 2) {
        const hexByte = hexChunk.substring(i, i + 2);
        if (hexByte === "00") break;

        const charCode = parseInt(hexByte, 16);
        decodedString += String.fromCharCode(charCode);
      }

      if (dataType === 1) {
        announcement.title += decodedString;
      } else {
        announcement.body += decodedString;
      }
    }

    if (announcement.init === true && announcement.notification_id === notification_id && notification_completed) {
      title = announcement.title;
      body = announcement.body;

      announcement = { init: false, notification_id: null, title: null, body: null };
    }
  }

  if (title && body) {
    const notificationTypeLabel = reverseScopes("notification_type", notificationType);
    const branchLabel = reverseScopes("branch", scopeBranch);
    const yearLabel = reverseScopes("year", scopeYear);
    const sectionLabel = reverseScopes("section", scopeSection);

    console.log("\n╔═══════════════════════════════════════════════════════════╗");
    console.log("║           ✓ SYNTHESIZED NOTIFICATION DECODED             ║");
    console.log("╚═══════════════════════════════════════════════════════════╝");
    
    console.log("\n📋 NOTIFICATION METADATA:");
    console.log(`  • ID: ${notification_id}`);
    console.log(`  • Type: ${notificationTypeLabel} (Code: ${notificationType})`);
    console.log(`  • Status: ${notification_completed ? "Complete" : "Pending"}`);
    
    console.log("\n🎯 TARGET SCOPE:");
    console.log(`  • Branch: ${branchLabel}`);
    console.log(`  • Year: ${yearLabel}`);
    console.log(`  • Section: ${sectionLabel}`);
    
    console.log("\n📢 NOTIFICATION CONTENT:");
    console.log(`  • Title: "${title}"`);
    console.log(`  • Body: "${body}"`);
    
    // Additional details based on notification type
    if (notificationType === 0) {
      // Class Cancellation
      const leave_type = hexToDec(finalBlock[10]);
      const periods = decodePeriods(chunk2);
      const leave_type_label = leave_type === 0 ? "Period" : leave_type === 1 ? "Day" : "Duration";
      console.log("\n🏫 CLASS CANCELLATION DETAILS:");
      console.log(`  • Leave Type: ${leave_type_label}`);
      console.log(`  • Affected Periods: [${periods.join(", ")}]`);
    } else if (notificationType === 1) {
      // Class Substitution
      const substitutee = chunk2;
      const substitutionStatus = hexToDec(substitutee[2]);
      console.log("\n🔄 CLASS SUBSTITUTION DETAILS:");
      console.log(`  • Status: ${substitutionStatus ? "Active" : "Cancelled"}`);
    } else if (notificationType === 2) {
      // Announcement
      if (announcementScope) {
        console.log("\n📣 ANNOUNCEMENT SCOPE:");
        console.log(`  • Target Branches: [${announcementScope.branches.join(", ")}]`);
        console.log(`  • Target Years: [${announcementScope.years.join(", ")}]`);
        console.log(`  • Target Sections: [${announcementScope.sections.join(", ")}]`);
      }
    }
    
    console.log("\n╔═══════════════════════════════════════════════════════════╗");
    console.log("║              ✓ NOTIFICATION READY FOR DISPLAY             ║");
    console.log("╚═══════════════════════════════════════════════════════════╝\n");
    
    // Insert local DB notification saving or visual push dispatch mechanisms here
  }
}

// The Scanner Engine: Built around ble-manager native broadcast event listeners
export async function startScanning() {
  const smartScanStateRaw = await AsyncStorage.getItem("smart_scan_state");
  const smartScanState = JSON.parse(smartScanStateRaw);

  const hour = new Date().getHours();
  if (smartScanState && (hour < 8 || hour > 18)) return;

  if (isScanning) return;

  // Verify your core OS hardware permissions are active
  const hasPermission = await requestBLEPermissions();
  if (!hasPermission) {
    console.error("Scanner Aborted: Missing Bluetooth/Location permissions.");
    return;
  }

  try {
    // Fire up the native module pipeline context
    await BleManager.start({ showAlert: false });
    
    // Explicitly toggle on hardware state on Android architectures
    await BleManager.enableBluetooth();
    console.log("Bluetooth hardware stack powered up successfully.");

    isScanning = true;

    // Attach native broadcaster listener event to capture data broadcasts
    bleDiscoverListener = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      (peripheral) => {
        // Access manufacturer data map out of the native advertising payload block
        if (peripheral && peripheral.advertising && peripheral.advertising.manufacturerData) {
          const hexData = payloadToHex(peripheral.advertising.manufacturerData);

          // Extract metrics matching standard iBeacon structure lengths (>= 24 bytes / 48 chars hex)
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
        }
      }
    );

    // Start scanning. First argument [] lets us look for all universal service IDs.
    // Setting 0 for duration keeps scanning continuously until manually stopped.
    await BleManager.scan([], 0, true);
    console.log("Scanner Engine: Continuously scanning for active payloads...");

  } catch (error) {
    console.error("Failed to safely initialize or run scanning engine:", error);
    isScanning = false;
  }
}

// Clear out and detach native listener elements cleanly
export function stopScanning() {
  BleManager.stopDeviceScan()
    .then(() => {
      console.log("Scan process halted cleanly.");
    })
    .catch((err) => console.error("Error calling stopDeviceScan:", err));

  if (bleDiscoverListener) {
    bleDiscoverListener.remove();
    bleDiscoverListener = null;
  }
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
  const scope = value & 0x01; 

  return {
    type: reverseScopes("notification_type", type),
    scope: scope, 
    branches: Array.from({ length: 7 }, (_, b) => b).filter(b => branchMask & (1 << b)).map(b => reverseScopes("branch", b)),
    years: Array.from({ length: 6 }, (_, y) => y).filter(y => yearMask & (1 << y)).map(y => reverseScopes("year", y)),
    sections: Array.from({ length: 15 }, (_, s) => s).filter(s => sectionMask & (1 << s)).map(s => reverseScopes("section", s))
  };
}