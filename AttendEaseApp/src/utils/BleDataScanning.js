import { NativeModules, DeviceEventEmitter, Alert } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { reverseScopes } from '../constant/scopes';
import { getDBConnection, saveNotification } from '../database/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { queueNotification, processQueue } from './BleDataPropagation';
import notifee, { AndroidStyle, EventType, AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import decodeAdvertisement from './DecodeAdvertisement';


const TARGET_APP_ID = "41545445";

const plxManager = new BleManager();
let isScanningLoopActive = false;

let updateDevicesCallback = null;
let updateErrorCallback = null;
const discoveredDevicesMap = new Map();

export function initializeScannerCallbacks(setDevices, setError) {
  updateDevicesCallback = setDevices;
  updateErrorCallback = setError;
}

async function requestBluetoothPermissions() {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return (
        granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }
  return true;
}

// Core Data Structures tracking active over-the-air fragments
const announcements_registry = {};

/**
 * UTILITY: Converts Hex payload back to pure ASCII characters
 */
function hexToAscii(hexStr) {
  let str = '';
  for (let i = 0; i < hexStr.length; i += 2) {
    const charCode = parseInt(hexStr.substring(i, i + 2), 16);
    if (charCode > 0) str += String.fromCharCode(charCode);
  }
  return str;
}

// Helper to convert the 16-byte raw array into a standard hyphenated UUID string
function bytesToUUID(bytes) {
  return Array.from(bytes, (byte) => {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2).toUpperCase();
  }).reduce((acc, current, index) => {
    // Inserts standard UUID formatting hyphens at the correct structural layout points
    if ([4, 6, 8, 10].includes(index)) {
      return acc + '-' + current;
    }
    return acc + current;
  }, "");
}

// Helper to reconstruct two independent 8-bit bytes into a single 16-bit unsigned short integer
function bytesToUnsignedShort(byte1, byte2) {
  return ((byte1 & 0xFF) << 8) | (byte2 & 0xFF);
}

/**
 * UTILITY: Unpacks metadata bitmask strings matching your reverse profile map
 */
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

/**
 * UTILITY: Decodes bitmask arrays for academic period assignment blocks
 */
function decodePeriods(hex) {
  const mask = parseInt(hex, 16);
  const periods = [];
  for (let i = 0; i < 16; i++) {
    if (mask & (1 << i)) periods.push(i);
  }
  return periods;
}

function reBroadcast(notifications) {
  // 1. Find the active notification object (fallback to the first one)
  const targetNotification = notifications.find(n => n.init === true) || notifications[0];

  if (!targetNotification) {
    console.error("No valid notification object found.");
    return;
  }

  // 2. Extract the current hop configurations from the target's major field
  const maxHops = targetNotification.major >> 8;
  const currentHops = targetNotification.major & 0xFF;

  console.log(`Received - Max Hops: ${maxHops}, Current Hops: ${currentHops}`);

  // 3. Check if it has room to hop further
  if (currentHops < maxHops) {
    // 4. Increment the hop count by 1
    const nextHops = currentHops + 1;

    // 5. Repack maxHops and the NEW currentHops back into the target's major field
    targetNotification.major = (maxHops << 8) | nextHops;

    console.log(`Re-broadcasting payload with updated hop count: ${nextHops}/${maxHops}`);

    // 6. Send it to the queue for transmission
    queueNotification(notifications);
    processQueue();
  } else {
    console.log("Packet dropped: Maximum hop limit reached.");
  }
}

const channelMap = {
  "CLASS_CANCELLED": "class_cancellation_alerts",
  "CLASS_SUBSTITUTION": "class_substitution_alerts",
  "ANNOUNCEMENT": "announcement_alerts"
};

async function notify(notification) {
  const channelId = channelMap[notification.type.toUpperCase()];

  await notifee.displayNotification({
    id: channelId,
    title: notification.title || "Notification",
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
        text: notification.body || "Message",
      },

      fullScreenAction: {
        id: 'default',
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

/**
 * ENGINE: Processes incoming frames directly mirrored from your Python parser
 */
async function processIncomingFrame(uuid_str, major, minor) {
  
  const database = getDBConnection();
  const user_creds = await AsyncStorage.getItem("user_creds");
  const userData = JSON.parse(user_creds || "{}");

  // 1. Clean up standard hyphens to parse string chunks easily
  const clean_uuid = uuid_str.replace(/-/g, "").toUpperCase();

  // 2. Validation Check: Verify AppID match
  const appid = clean_uuid?.substring(0, 8);

  if (appid !== TARGET_APP_ID) {
    console.log("not native app advertisement");
    return null;
  }

  console.log(`RAW BLE DATA -> UUID: ${uuid_str} | Major: ${major} | Minor: ${minor}`);

  // 3. Extract Common Core Variables using literal Python slices
  const scope_block = clean_uuid.substring(8, 12);

  // Handle type 2 sentinel '2CCC' explicitly matching Python fallback check
  const firstChar = scope_block[0];
  const type_code = (!isNaN(parseInt(firstChar, 10)) && isFinite(firstChar)) ? parseInt(firstChar, 16) : 2;

  const notification_id = clean_uuid.substring(20, 28);
  const tail_flags = clean_uuid.substring(28, 32);

  // check if notification exists
  const notificationExists = database.execute("select * from notifications where notification_id = ? limit 1", [notification_id]).rows._array[0];

  if (notificationExists) {
    console.log("notification exists with id: ", notification_id);
    return;
  }

  if (userData?.role === "Teacher" && [0, 1].includes(type_code) && tail_flags[0] !== "2") {
    console.log("rebroadcasting for students.")
    reBroadcast([{ broadcasted: 0, uuid: uuid_str, major, minor }]);
    return;
  }

  // =================================================================
  // --- CASE 0: Class Cancellation ---
  // =================================================================
  if (type_code === 0 && tail_flags[0] !== "2") {
    const branch = reverseScopes("branch", parseInt(scope_block[1], 16));
    const year = reverseScopes("year", parseInt(scope_block[2], 16));
    const section = reverseScopes("section", parseInt(scope_block[3], 16));

    const encoded_periods = clean_uuid.substring(12, 16);
    const from_diff = parseInt(clean_uuid.substring(16, 18), 16);
    const to_diff = parseInt(clean_uuid.substring(18, 20), 16);

    const leave_type_flag = tail_flags[2]; // Character index 30 of UUID
    const leave_map = { "0": "period", "1": "day", "2": "duration" };
    const leave_type = leave_map[leave_type_flag] || `Unknown(${leave_type_flag})`;

    const day = parseInt(tail_flags[0], 16) - 3;
    const periodId = parseInt(tail_flags[1], 16);

    const teacher = database.execute("select * from timetable where day = ? and period_id = ?", [reverseScopes("day", day), periodId]).rows._array[0];

    const message = `Period ${decodePeriods(encoded_periods).map((p) => p)
      .join(", ")} of ${teacher?.teacher_name || "some teacher"} cancelled, on leave ${leave_type === "duration" ? `from ${new Date(new Date().getTime() + (from_diff * 24 * 60 * 60 * 1000)).toLocaleDateString()} to ${new Date(new Date().getTime() + (to_diff * 24 * 60 * 60 * 1000)).toLocaleDateString()}` : `for ${new Date().toLocaleDateString()}`}`;

    const notification = {
      notification_id,
      scope: `${branch}_${year}_${section}`,
      source: "BLE",
      type: reverseScopes("notification_type", type_code),
      title: "Class Cancellation",
      body: message
    };

    // save notification
    saveNotification(database, notification);

    // re broadcast it
    reBroadcast([{ broadcasted: 0, uuid: uuid_str, major, minor }]);

    // check if scope matches and popup notification
    if ((userData?.branch_id === branch || branch === "all") && (userData?.year === parseInt(year) || year === "all") && (userData?.section === section || section === "all")) {
      // Alert.alert(notification.title, notification.body);
      notify(notification);
    }
  }

  // =================================================================
  // --- CASE 1: Class Substitution ---
  // =================================================================
  else if (type_code === 1 && tail_flags[0] !== "2") {
    const branch = reverseScopes("branch", parseInt(scope_block[1], 16));
    const year = reverseScopes("year", parseInt(scope_block[2], 16));
    const section = reverseScopes("section", parseInt(scope_block[3], 16));

    const encoded_period = clean_uuid.substring(12, 16);
    const encoded_substitutor = clean_uuid.substring(16, 20);

    const substitute_status = parseInt(encoded_period[2], 16);
    const original_period_id = parseInt(encoded_period[3], 16);

    const sub_day = reverseScopes("day", parseInt(encoded_substitutor[2], 16));
    const sub_period_id = parseInt(encoded_substitutor[3], 16);

    const substitutee = database.execute("select * from timetable where day = ? and period_id = ?", [new Date().toLocaleDateString("en-Gb", { weekday: "long" }), original_period_id]).rows._array[0];
    const substitutor = database.execute("select * from timetable where day = ? and period_id = ?", [sub_day, sub_period_id]).rows._array[0];
    // if (!substitutee && !substitutor) return;

    const message = substitute_status === 1 ? `Class ${substitutee?.subject_name || "some"} of ${substitutee?.teacher_name || "some teacher"} is substituted by ${substitutor?.teacher_name || "some teacher"}` : `Substitution of class ${substitutee?.subject_name || "some"} cancelled by ${substitutor?.teacher_name || "some teacher"}`;

    const notification = {
      notification_id,
      scope: `${branch}_${year}_${section}`,
      source: "BLE",
      type: reverseScopes("notification_type", type_code),
      title: "Class Substitution",
      body: message
    };

    // save notification
    saveNotification(database, notification);

    // re broadcast it
    reBroadcast([{ broadcasted: 0, uuid: uuid_str, major, minor }]);

    // check if scope matches and popup notification
    if ((userData?.branch_id === branch || branch === "all") && (userData?.year === parseInt(year) || year === "all") && (userData?.section === section || section === "all")) {
      // Alert.alert(notification.title, notification.body);
      notify(notification);
    }
  }

  // =================================================================
  // --- CASE 2: Announcements (Fragmented String Data Chunks) ---
  // =================================================================
  else if (type_code === 2 || tail_flags[0] === "2") {
    try {
      if (!announcements_registry[notification_id]) {
        announcements_registry[notification_id] = {
          "notification_id": notification_id,
          "chunks_received": [],
          "scope": null,
          "title_fragments": {},
          "body_fragments": {},
          "max_title_idx": null,
          "max_body_idx": null,
          "rawNotifications": []
        };
      }

      const current_active = announcements_registry[notification_id];
      const chunk_index = parseInt(tail_flags[1], 16);
      const chunk_type = tail_flags[2]; // 0=Metadata Envelope, 1=Title Text, 2=Body Text
      const is_final_packet = (tail_flags[3] === "1");

      const tracking_key = `${chunk_type}_${chunk_index}`;

      // A. Handle Metadata Envelope
      if (chunk_type === "0") {
        const metadata_hex = clean_uuid.substring(12, 20);
        current_active["scope"] = unpackMetadata(metadata_hex);

        if (!current_active["chunks_received"].includes(tracking_key)) {
          current_active["chunks_received"].push(tracking_key);
          current_active["announcement_timeout"] = setTimeout(() => {
            processAnnouncement(database, userData, notification_id, tail_flags, current_active);
          }, 16000)
        }

        current_active.rawNotifications.push({ init: true, broadcasted: 0, uuid: uuid_str, major, minor });
      }

      // B. HANDLE TEXT PAYLOAD DATA CHUNKS (Title or Body)
      else if (["1", "2"].includes(chunk_type) && !current_active["chunks_received"].includes(tracking_key)) {
        current_active["chunks_received"].push(tracking_key);

        current_active.rawNotifications.push({ broadcasted: 0, uuid: uuid_str, major, minor });

        const chunk1 = clean_uuid.substring(8, 12);
        const chunk2 = clean_uuid.substring(12, 16);
        const chunk3 = clean_uuid.substring(16, 20);
        const chunk4 = major.toString(16).padStart(4, "0").toUpperCase();
        const chunk5 = minor.toString(16).padStart(4, "0").toUpperCase();

        // Reassemble the raw 20-character hex data block
        const raw_hex_stream = `${chunk1}${chunk2}${chunk3}${chunk4}${chunk5}`;

        let reconstructed_text = '';

        // BRANCH DECODING BASED ON CHUNK INDEX POSITION:
        if (chunk_index === 0) {
          // Chunk 0 contains your max marker at the front (Indices 0:2)
          const max_idx_hex = raw_hex_stream.substring(0, 2);
          const max_expected_slots = parseInt(max_idx_hex, 16);

          if (chunk_type === "1") {
            current_active["max_title_idx"] = max_expected_slots;
          } else if (chunk_type === "2") {
            current_active["max_body_idx"] = max_expected_slots;
          }

          // Strip off the first 2 marker characters before decoding
          const clean_hex_payload = raw_hex_stream.substring(2);
          reconstructed_text = hexToAscii(clean_hex_payload);
        } else {
          // Chunks 1+ contain NO marker, decode the full 20 hex characters directly
          reconstructed_text = hexToAscii(raw_hex_stream);
        }

        // LINE-FOR-LINE MATCH: Saved directly to fragments matching Python structure blocks
        if (chunk_type === "1") {
          current_active["title_fragments"][chunk_index] = reconstructed_text;
        } else if (chunk_type === "2") {
          current_active["body_fragments"][chunk_index] = reconstructed_text;
        }
      }

      // === C. DYNAMIC CONTINUITY CHECK PHASE ===
      if (
        current_active["scope"] !== null &&
        current_active["max_title_idx"] !== null &&
        current_active["max_body_idx"] !== null
      ) {

        processAnnouncement(database, userData, notification_id, tail_flags, current_active);
        clearTimeout(current_active.announcement_timeout);
      } else {
        // console.log("⏳ Awaiting initial Index 0 payload packets to establish sequence bounds...");
      }

    } catch (e) {
      console.error(`Error processing announcement chunk: ${e.message}`);
    }
  }
}

async function processAnnouncement(database, userData, notification_id, tail_flags, current_active) {
  let title_continuous = true;
  for (let i = 0; i <= current_active["max_title_idx"]; i++) {
    if (current_active["title_fragments"][i] === undefined) {
      title_continuous = false;
      break;
    }
  }

  let body_continuous = true;
  for (let i = 0; i <= current_active["max_body_idx"]; i++) {
    if (current_active["body_fragments"][i] === undefined) {
      body_continuous = false;
      break;
    }
  }

  if (title_continuous || body_continuous) {
    const sortedTitleKeys = Object.keys(current_active["title_fragments"]).sort((a, b) => a - b);
    const final_title = sortedTitleKeys.map(k => current_active["title_fragments"][k]).join("");

    const sortedBodyKeys = Object.keys(current_active["body_fragments"]).sort((a, b) => a - b);
    const final_body = sortedBodyKeys.map(k => current_active["body_fragments"][k]).join("");

    const notification = {
      notification_id,
      scope: JSON.stringify(current_active["scope"]),
      source: "BLE",
      type: reverseScopes("notification_type", parseInt(tail_flags[0])),
      title: final_title.trim(),
      body: final_body.trim()
    };

    // save notification
    saveNotification(database, notification);

    // re broadcast it
    reBroadcast(current_active.rawNotifications);

    // check if scope matches and popup notification
    if (current_active["scope"].branches.some(b => b === userData.branch_id || b === "all") && current_active["scope"].years.some(y => y === `${userData.year}` || y === "all") && current_active["scope"].sections.some(s => s === userData.section || s === "all")) {
      // Alert.alert(notification.title, notification.body);
      notify(notification);
    }

    delete announcements_registry[notification_id];
  } else {
    // console.log("⏳ Index sequences incomplete or contain gaps. Waiting for missing fragments to bridge...");
  }
}

function base64ToHex(base64Str) {
  const rawBinary = Buffer.from(base64Str, 'base64');
  return rawBinary.toString('hex').toUpperCase();
}


/**
 * RECEIVER CALLBACK: Intercepts raw native BLE events
 */

const handleDiscoverPeripheral = (device) => {
  const manufacturerData = device.manufacturerData;
  const { uuid, major, minor, rssi } = decodeAdvertisement(manufacturerData);

  // console.log("payload: ", device.name, uuid, major, minor)

  if (updateDevicesCallback) {
    const devicePayload = {
      device,
      type: uuid?.substring(0, 8) === TARGET_APP_ID ? "attendease_native" : "general",
      uuid,
      major,
      minor
    };

    discoveredDevicesMap.set(device.id, devicePayload);
    updateDevicesCallback(Array.from(discoveredDevicesMap.values()));
  }

  if (manufacturerData) {
    processIncomingFrame(uuid, major, minor);
  }
};

/**
 * INTERFACE EXPORT: Start scanning loop
 */

// processIncomingFrame("41545445-0140-0002-0204-1999AAAC5221", 1280, 51210);
// processIncomingFrame("41545445-1141-0011-0003-9221EABCCC1", 1280, 51210);

// processIncomingFrame("41545445-2DD8-4090-0002-76F23CA22000", 1280, 51210);
// processIncomingFrame("41545445-0068-6900-0000-76F23CA22011", 0, 0);
// processIncomingFrame("41545445-0068-6579-0000-76F23CA22021", 0, 0);

export async function startMeshScannerLoop() {
  if (isScanningLoopActive) return;

  const hasPermission = await requestBluetoothPermissions();
  if (!hasPermission) {
    console.log('🛑 BLE Core Scanner: Permissions denied.');
    return;
  }

  isScanningLoopActive = true;

  // Start scanning immediately. Null filters mean look for absolutely EVERYTHING in range.
  console.log('🟢 BLE Core Scanner Started');
  plxManager.startDeviceScan(
    null,
    {
      allowDuplicates: true,
      scanMode: 2 // Maps directly to Android's native high-speed SCAN_MODE_LOW_LATENCY
    },
    (error, device) => {
      if (error) {
        console.error('🛑 PLX Scan Runtime Exception:', error);
        return;
      }

      if (device) {
        // FORCED DIAGNOSTIC LOG: This will flood your console instantly when it sees your Noise watch
        // console.log(`🔥 [PLX SEES] MAC: ${device.id} | Name: ${device.name || 'Unknown'} | RSSI: ${device.rssi}`);

        try {
          handleDiscoverPeripheral(device);
        } catch (e) {
          console.warn(e);
        }
      }
    }
  );
}

/**
 * INTERFACE EXPORT: Stop scanning loop
 */
export async function stopMeshScannerLoop() {
  isScanningLoopActive = false;
  plxManager.stopDeviceScan();
  console.log('🛑 BLE PLX Scanner Loop Terminated.');
}