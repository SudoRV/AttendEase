import { PermissionsAndroid, Platform } from 'react-native';
import BLEAdvertise from 'react-native-ble-advertise';
import { scopeAll, scopes, reverseScopes, decToHex } from '../constant/scopes';
import { startMeshScannerLoop, stopMeshScannerLoop } from './BleDataScanning';
import AsyncStorage from '@react-native-async-storage/async-storage';

let notification_queue = [];
let isBroadCasting = false;
const companyId = 0xFFFF;
const appid = "41545445"; // ATTE (8 characters)
const burst_size = 5;

let isBleBusy = false; // The Mutex lock

async function safeBleScanStart() {
  if (isBleBusy) {
    console.log("BLE Hardware is busy, skipping request...");
    return;
  }
  isBleBusy = true;
  try {
    await startMeshScannerLoop();
  } catch (err) {
    console.error("BLE Operation Error:", err);
  } finally {
    isBleBusy = false;
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function BleDataPropagation(database, remoteMessage) {
  console.log("Incoming Remote Message: ", remoteMessage);
  // loading user data
  const user_creds = await AsyncStorage.getItem("user_creds");
  const userData = JSON.parse(user_creds || "{}");

  // BLE toggled state 
  const ble_on = await AsyncStorage.getItem("ble_state");
  if (!ble_on) return;

  // checking for valid scope
  if (!remoteMessage?.data?.scope) {
    console.log("No valid scope found in push payload.");
    return;
  }
  if (remoteMessage?.data?.scope.includes("Individual")) {
    console.log("Individual notification, stopping BLE!");
    return;
  };

  // BLE Permission
  const hasPermission = await requestBLEPermissions();
  if (!hasPermission) {
    console.warn("Cannot broadcast: Permissions missing.");
    return;
  }



  // setting company id
  BLEAdvertise.setCompanyId(companyId);


  const metadata = JSON.parse(remoteMessage.data.metadata || "{}"); // usefull for announcement scope

  const notificationScope = remoteMessage.data.scope.replace(`COLLEGE_${userData?.college_id}_`, "").split("_").slice(1);

  // Extract raw identifiers from your mapping configuration file
  const rawType = (remoteMessage.data.type || "").replace(" ", "_").toLowerCase();
  const typeCode = await scopes("notification_type", rawType);
  const branchCode = await scopes("branch", notificationScope[0]);
  const yearCode = await scopes("year", notificationScope[1]);
  const sectionCode = await scopes("section", notificationScope[2]);

  if ((!rawType || !branchCode || !yearCode || !sectionCode) && typeCode !== 2) {
    console.warn("skipping ble broadcast, invalid scope");
    return;
  };

  const cleanScopeData = `${typeCode}${branchCode}${yearCode}${sectionCode}`;
  const scopeBlock = cleanScopeData.padStart(4, '0').substring(0, 4).toUpperCase();

  const notification_id = (sHash(remoteMessage.messageId) >>> 0)
    .toString(16).toUpperCase()
    .padStart(8, "0");

  // --- Process Type Cases ---

  // Case 0: Class Cancellation
  if (typeCode === 0) {
    // data to propagate ( teacher name (through period id), from, to, on date using difference from current date )

    let fromDiff = decToHex(0).padStart(2, "0").toUpperCase();
    let toDiff = decToHex(0).padStart(2, "0").toUpperCase();
    if (metadata.leave_type !== "period") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // from date encoding
      const fromDate = new Date(metadata.from);
      fromDate.setHours(0, 0, 0, 0);
      fromDiff = (fromDate - today) / (1000 * 60 * 60 * 24);
      fromDiff = decToHex(fromDiff).padStart(2, "0").toUpperCase();

      // to date encoding
      const toDate = new Date(metadata.to);
      toDate.setHours(0, 0, 0, 0);
      toDiff = (toDate - today) / (1000 * 60 * 60 * 24);
      toDiff = decToHex(toDiff).padStart(2, "0").toUpperCase();
    }

    // it will be used to get the teacher name 
    const encodedPeriods = encodePeriods(metadata?.period_id || []);

    let applicant = null;
    try {
      const result = database?.execute?.(
        "SELECT day, period_id FROM timetable WHERE teacher_id = ? LIMIT 1",
        [metadata?.teacher_id]
      );
      applicant = result?.rows?._array?.[0] || null;
    } catch (dbErr) {
      console.warn("Database execution error on applicant query:", dbErr);
    }

    // Stitch everything together following the strict 8-4-4-4-12 size rules
    const uuid = `${appid}-${scopeBlock}-${encodedPeriods}-${fromDiff}${toDiff}-${notification_id}${decToHex(3 + (await scopes("day", applicant?.day || -1)) || 7)}${decToHex(!!(applicant?.period_id + 1) ? applicant?.period_id : 14)}${metadata.leave_type === "period" ? "0" : metadata.leave_type === "day" ? "1" : "2"}1`;

    const maxHops = 6;
    const currentHops = 0;
    const major = (maxHops << 8) | currentHops;
    const minor = (0xC8 << 8) | 0x0A;

    queueNotification([{ broadcasted: 0, uuid, major, minor }]);
  }

  // Case 1: Class Substitution
  else if (typeCode === 1) {
    // can be used for substitutee teacher name and subject name
    const encodedPeriod = `${metadata?.status}${decToHex(metadata.period_id)}`.padStart(4, "0").toUpperCase();

    // fetch substitutor data from offline cachce
    const substitutor = database.execute(
      "SELECT day, period_id FROM timetable WHERE teacher_id = ? LIMIT 1",
      [metadata.substitutor]
    ).rows._array[0];
    const encodedSubstitutor = `${await scopes("day", substitutor?.day || -1) || 7}${decToHex(!!(substitutor?.period_id + 1) ? substitutor?.period_id : 14)}`.padStart(4, "0").toUpperCase();

    const uuid = `${appid}-${scopeBlock}-${encodedPeriod}-${encodedSubstitutor}-${notification_id}CCC1`;

    const maxHops = 6;
    const currentHops = 0;
    const major = (maxHops << 8) | currentHops;
    const minor = (0xC8 << 8) | 0x0A;

    queueNotification([{ broadcasted: 0, uuid, major, minor }]);
  }

  // Case 2: Announcements (Fragmented Packets)
  else if (typeCode === 2) {
    const notification = [];
    const announcementScope = await packAnnouncementMetadata(typeCode, metadata.scope, metadata.target_branch, metadata.target_year, metadata.target_section);
    // console.log(announcementScope)

    const randomHex = Math.floor(Math.random() * 0xFFF).toString(16).padEnd(3, '0').toUpperCase();
    const dynamicScopeBlock = `2${randomHex}`;

    // Packet Index 0: Metadata Envelope Setup
    const uuidMetadata = `${appid}-${dynamicScopeBlock}-${announcementScope.slice(0, 4)}-${announcementScope.slice(4, 8)}-${notification_id}2000`;

    const maxHops = 6;
    const currentHops = 0;
    const major = (maxHops << 8) | currentHops;
    const minor = (0xC8 << 8) | 0x0A;

    notification.push({ broadcasted: 0, uuid: uuidMetadata, major, minor });

    const title = remoteMessage.data.title.substring(0, 27) || "";
    const body = remoteMessage.data.body.substring(0, 117) || "";

    // Slices EVERY chunk into a uniform 9-character maximum layout
    const t_chunks = title.match(/.{1,9}/gs) || [];
    const b_chunks = body.match(/.{1,9}/gs) || [];

    // 1. Process Title Chunks
    t_chunks.forEach((c, index) => {
      let hexChunk = Array.from(c).map(char => char.charCodeAt(0).toString(16).toUpperCase()).join("");

      if (index === 0) {
        // ONLY CHUNK 0 CARRIES THE 2-HEX MAX MARKER
        const maxMarker = decToHex(t_chunks.length - 1).padStart(2, "0").toUpperCase();
        hexChunk = `${maxMarker}${hexChunk}`.padEnd(20, "0");
      } else {
        // Chunks 1+ fill up the 20 hex char frame entirely with text characters
        hexChunk = hexChunk.padEnd(20, "0");
      }

      const chunk1 = hexChunk.substring(0, 4);
      const chunk2 = hexChunk.substring(4, 8);
      const chunk3 = hexChunk.substring(8, 12);
      const chunk4 = hexChunk.substring(12, 16);
      const chunk5 = hexChunk.substring(16, 20);

      const localizedHexIndex = decToHex(index).toUpperCase();
      const uuid = `${appid}-${chunk1}-${chunk2}-${chunk3}-${notification_id}2${localizedHexIndex}1${t_chunks.length - 1 === index ? 1 : 0}`;

      notification.push({ broadcasted: 0, uuid, major: parseInt(chunk4, 16), minor: parseInt(chunk5, 16) });
    });

    // 2. Process Body Chunks
    b_chunks.forEach((c, index) => {
      let hexChunk = Array.from(c).map(char => char.charCodeAt(0).toString(16).toUpperCase()).join("");

      if (index === 0) {
        // ONLY CHUNK 0 CARRIES THE 2-HEX MAX MARKER
        const maxMarker = decToHex(b_chunks.length - 1).padStart(2, "0").toUpperCase();
        hexChunk = `${maxMarker}${hexChunk}`.padEnd(20, "0");
      } else {
        // Chunks 1+ fill up the 20 hex char frame entirely with text characters
        hexChunk = hexChunk.padEnd(20, "0");
      }

      const chunk1 = hexChunk.substring(0, 4);
      const chunk2 = hexChunk.substring(4, 8);
      const chunk3 = hexChunk.substring(8, 12);
      const chunk4 = hexChunk.substring(12, 16);
      const chunk5 = hexChunk.substring(16, 20);

      const localizedHexIndex = decToHex(index).toUpperCase();
      const uuid = `${appid}-${chunk1}-${chunk2}-${chunk3}-${notification_id}2${localizedHexIndex}2${b_chunks.length - 1 === index ? 1 : 0}`;

      notification.push({ broadcasted: 0, uuid, major: parseInt(chunk4, 16), minor: parseInt(chunk5, 16) });
    });

    queueNotification(notification);
  }
  else {
    console.log("Can't process this notification")
  }

  if (isBroadCasting) return;
  const randomTime = Math.floor(Math.random() * (9000 - 3000 + 1)) + 3000;
  const processQueueTimeout = setTimeout(async () => {
    clearTimeout(processQueueTimeout);
    await processQueue();
  }, randomTime)
}



// notification queue broadcaster
// Global tracking flag instead of a rigid setInterval
let isProcessingQueue = false;

export async function processQueue() {
  // Prevent overlapping loop executions
  if (isProcessingQueue) return;
  isProcessingQueue = true;
  BLEAdvertise.setCompanyId(companyId);

  // console.log("--- Starting Dynamic BLE Transmission Loop ---");

  while (notification_queue.length > 0) {
    try {
      await stopMeshScannerLoop();
      await BLEAdvertise.stopBroadcast();
      await delay(300); // Robust hardware stabilization cooldown
    } catch (e) {
      console.log("Initial radio clear warning:", e);
    }

    // broadcast each notifications whose broadcasted count is <= burst size
    const currentBurst = notification_queue.filter(nq => nq[0].broadcasted < burst_size);

    notification_queue = [];

    for (let cbIndex = 0; cbIndex < currentBurst.length; cbIndex++) {
      const currentPacket = currentBurst[cbIndex];

      // 1. Pull the next notification array group off the FRONT of the queue
      const currentNotificationPackets = currentPacket;

      if (!Array.isArray(currentNotificationPackets) || currentNotificationPackets.length === 0) continue;

      // 2. FILTER PHASE: Only keep chunks that STILL need transmissions (< burst size)
      // This automatically removes any chunks that have reached burst size broadcasts
      const activeChunks = currentNotificationPackets.filter(packet => packet.broadcasted < burst_size);

      if (activeChunks.length === 0) {
        // console.log("Notification completely synchronized. Dropping from queue.");
        continue;
      }

      // console.log(`Bursting notification: ${activeChunks.length} active chunk(s) remaining...`);

      // 3. RAPID ATOMIC BURST PHASE
      for (let index = 0; index < activeChunks.length; index++) {
        const packet = activeChunks[index];
        try {
          await BLEAdvertise.stopBroadcast();
          await delay(50)

          isBroadCasting = true;

          try {
            await BLEAdvertise.broadcast(packet.uuid, packet.major, packet.minor);
          } catch (e) {
            console.error(e)
          }

          packet.broadcasted += 1;
          // console.log(`Broadcasted chunk [${packet.broadcasted}/${burst_size}]: ${packet.uuid}`);
        } catch (err) {
          console.error("Broadcast harfdware failure caught:", err);
        }

        // Air duration for this chunk before moving to the next
        // inter packets delay
        const dynamicChunkDelay = activeChunks.length <= 4 ? 200 : 100;
        await delay(dynamicChunkDelay);
      }

      // We re-evaluate the filter because the broadcast counts just incremented inside the loop!
      const chunksNeedingRetry = activeChunks.filter(packet => packet.broadcasted < burst_size);

      if (chunksNeedingRetry.length > 0) {
        // Move the notification array containing only unexpired chunks to the BACK of the line
        notification_queue.push(chunksNeedingRetry);
      }

      // inter burst delay
      const dynamicPacketDelay = currentBurst.length <= 4 ? 200 : 100;
      await delay(dynamicPacketDelay);
    }

    // delay in cycles of advertisement burst
    if (notification_queue.length > 0) {
      // console.log(`[RX Window] Listening for 4s... (${notification_queue.length} items in line)`);
      await stop();
      await delay(4000);
    }
  }

  // Final cleanup once the carousel naturally grinds to a halt
  console.log(`All notification packets verified at ${burst_size} broadcasts. Engine Idle.`);
  await delay(1000);
  await stop();
  isProcessingQueue = false;
}



// helper functions 

export function queueNotification(notification) {
  notification_queue.push(notification);
}

export function broadcast(uuid, major, minor) {
  try {
    BLEAdvertise.broadcast(uuid, major, minor)
      .then(() => () => {
        // console.log("Broadcasting custom payload safely!")
      })
      .catch(err => console.error("Broadcast failed:", err));
  } catch (e) {
    console.error(e)
  }
}

export async function stop() {
  return BLEAdvertise.stopBroadcast()
    .then(async () => {
      // console.log('Broadcast stopped successfully');
      isBroadCasting = false;
      await delay(2000);
      // start scanning for new ble notifications
      await safeBleScanStart();
    })
    .catch(err => console.error('Failed to stop broadcast:', err));
}

async function requestBLEPermissions() {
  if (Platform.OS !== 'android') return true;
  try {
    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      ]);
      return (
        granted['android.permission.BLUETOOTH_ADVERTISE'] === PermissionsAndroid.RESULTS.GRANTED &&
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

function encodePeriods(periods = []) {
  let mask = 0;
  periods.forEach(p => {
    if (p >= 0) mask |= (1 << p);
  });
  return mask.toString(16).padStart(4, "0").toUpperCase();
}

function sHash(str) {
  let hash = 0x811c9dc5;

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);

    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}



// 30-29 → type (2 bits)
// 28-22 → branches (7 bits)
// 21-16 → years (6 bits)
// 15-1 → sections (15 bits)
// 0 → scope (1 bit)

export function packMetadata(type, scope, branchMask, yearMask, sectionMask) {
  const packedValue =
    ((type & 0x03) << 29) |
    ((branchMask & 0x7f) << 22) |
    ((yearMask & 0x3f) << 16) |
    ((sectionMask & 0x7fff) << 1) |
    (scope & 0x01);

  return (packedValue >>> 0).toString(16).padStart(8, "0").toUpperCase();
}

async function encodeMask(scopeKey, items = []) {
  if (!items || !items.length) return 0;

  const scopeMap = await scopeAll(scopeKey);
  return items.reduce((mask, item) => {
    // Normalize clean string or number lookup
    const key = typeof item === "string" ? item.trim() : item;
    const bitIndex = scopeMap[key];

    if (bitIndex !== undefined && bitIndex >= 0) {
      return mask | (1 << bitIndex);
    }
    return mask;
  }, 0);
}

async function packAnnouncementMetadata(type, scope, branches = [], years = [], sections = []) {

  const branchMask = await encodeMask("branch", branches);
  const yearMask = await encodeMask("year", years);
  const sectionMask = await encodeMask("section", sections);

  const scopeHex = packMetadata(type, scope, branchMask, yearMask, sectionMask);

  return scopeHex;
}