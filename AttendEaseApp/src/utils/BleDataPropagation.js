import React, { useEffect, useState } from 'react';
import { View, Button, PermissionsAndroid, Platform } from 'react-native';
import BLEAdvertise from 'react-native-ble-advertise';
import { scopes, reverseScopes, decToHex, hexToDec } from '../constant/scopes';
import { startMeshScannerLoop, stopMeshScannerLoop } from './BleDataScanning';
import AsyncStorage from '@react-native-async-storage/async-storage';

let notification_queue = [];
let isBroadCasting = false;
const companyId = 0xFFFF;
const appid = "41545445"; // ATTE (8 characters)
const burst_size = 5;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function BleDataPropagation(database, remoteMessage) {
  const ble_on = await AsyncStorage.getItem("ble_state");
  if (!ble_on) return;

  console.log("Incoming Remote Message: ", remoteMessage);

  const hasPermission = await requestBLEPermissions();
  console.log("Has permission: ", hasPermission);

  if (!remoteMessage?.data?.scope) {
    console.log("No valid scope found in push payload.");
    return;
  }

  if (!hasPermission) {
    console.log("Cannot broadcast: Permissions missing.");
    return;
  }

  BLEAdvertise.setCompanyId(companyId);

  const metadata = JSON.parse(remoteMessage.data.metadata || "{}");
  const notificationScope = remoteMessage.data.scope.split("_");

  // Extract raw identifiers from your mapping configuration file
  const typeCode = scopes("notification_type", remoteMessage.data.type.replace(" ", "_").toLowerCase());
  const branchCode = scopes("branch", notificationScope[0]);
  const yearCode = scopes("year", notificationScope[1]);
  const sectionCode = scopes("section", notificationScope[2]);
  // Combine them together into a single text sequence, stripping out any stray marks
  const cleanScopeData = `${typeCode}${branchCode}${yearCode}${sectionCode}`;
  // SAFETY CHECK: Ensure it fits the 4-character slot by slicing or padding
  // This step prevents app crashes if your scopes file changes design later
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
    if (metadata.leave_type === "duration") {
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

    const applicant = database.execute("select day, period_id from timetable where teacher_id = ? limit 1").rows._array[0];

    // Stitch everything together following the strict 8-4-4-4-12 size rules
    const uuid = `${appid}-${scopeBlock}-${encodedPeriods}-${fromDiff}${toDiff}-${notification_id}${decToHex(3 + scopes("day", applicant?.day))}${scopes(applicant.period_id)}${metadata.leave_type === "period" ? "0" : metadata.leave_type === "day" ? "1" : "2"}1`;

    const maxHops = 5;
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
    const encodedSubstitutor = `${scopes("day", substitutor?.day)}${decToHex(substitutor?.period_id)}`.padStart(4, "0").toUpperCase();


    const uuid = `${appid}-${scopeBlock}-${encodedPeriod}-${encodedSubstitutor}-${notification_id}CCC1`;

    const maxHops = 5;
    const currentHops = 0;
    const major = (maxHops << 8) | currentHops;
    const minor = (0xC8 << 8) | 0x0A;

    queueNotification([{ broadcasted: 0, uuid, major, minor }]);
  }

  // Case 2: Announcements (Fragmented Packets)
  else if (typeCode === 2) {
    const notification = [];
    const announcementScope = packAnnouncementMetadata(typeCode, metadata.scope, metadata.target_branch, metadata.target_year, metadata.target_section);

    const randomHex = Math.floor(Math.random() * 0xFFF).toString(16).padEnd(3, '0').toUpperCase();
    const dynamicScopeBlock = `2${randomHex}`;

    // Packet Index 0: Metadata Envelope Setup
    const uuidMetadata = `${appid}-${dynamicScopeBlock}-${announcementScope.slice(0, 4)}-${announcementScope.slice(4, 8)}-${notification_id}2000`;

    const maxHops = 5;
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

  console.log("--- Starting Dynamic BLE Transmission Loop ---");

  await BLEAdvertise.stopBroadcast();
  await delay(200); // Small driver register stabilization buffer

  while (notification_queue.length > 0) {
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
        console.log("Notification completely synchronized. Dropping from queue.");
        continue;
      }

      console.log(`Bursting notification: ${activeChunks.length} active chunk(s) remaining...`);

      // 3. RAPID ATOMIC BURST PHASE
      for (let index = 0; index < activeChunks.length; index++) {
        const packet = activeChunks[index];
        try {
          await await BLEAdvertise.stopBroadcast();
          await delay(50)
          
          isBroadCasting = true;
          await BLEAdvertise.broadcast(packet.uuid, packet.major, packet.minor);

          packet.broadcasted += 1;
          console.log(`Broadcasted chunk [${packet.broadcasted}/${burst_size}]: ${packet.uuid}`);
        } catch (err) {
          console.error("Broadcast hardware failure caught:", err);
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

    // Shut down the radio immediately after the burst to clear the airspace
    await stop();

    // delay in cycles of advertisement burst
    if (notification_queue.length > 0) {
      console.log(`[RX Window] Listening for 4s... (${notification_queue.length} items in line)`);
      await delay(4000);
    }
  }

  // Final cleanup once the carousel naturally grinds to a halt
  console.log(`All notification packets verified at ${burst_size} broadcasts. Engine Idle.`);
  await stop();
  isProcessingQueue = false;
}



// helper functions 

export function queueNotification(notification) {
  notification_queue.push(notification);
}

export function broadcast(uuid, major, minor) {
  BLEAdvertise.broadcast(uuid, major, minor)
    .then(() => console.log("Broadcasting custom payload safely!"))
    .catch(err => console.error("Broadcast failed:", err));
}

export async function stop() {
  return BLEAdvertise.stopBroadcast()
    .then(async () => {
      console.log('Broadcast stopped successfully');
      isBroadCasting = false;
      await delay(50);
      // start scanning for new ble notifications
      // await startMeshScannerLoop();
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


function packAnnouncementMetadata(type, scope, branches = [], years = [], sections = []) {
  const branchMask = Array.from({ length: 7 }, (_, b) => b).reduce((mask, b) => branches.includes(reverseScopes("branch", b)) ? mask | (1 << b) : mask, 0);
  const yearMask = Array.from({ length: 6 }, (_, y) => y).reduce((mask, y) => years.includes(reverseScopes("year", y)) ? mask | (1 << y) : mask, 0);
  const sectionMask = Array.from({ length: 15 }, (_, s) => s).reduce((mask, s) => sections.includes(reverseScopes("section", s)) ? mask | (1 << s) : mask, 0);

  // Added scope straight into the primary metadata generator
  return packMetadata(type, scope, branchMask, yearMask, sectionMask);
}

// 30-29 → type (2 bits)
// 28-22 → branches (7 bits)
// 21-16 → years (6 bits)
// 15-1 → sections (15 bits)
// 0 → scope (1 bit)

function packMetadata(type, scope, branchMask, yearMask, sectionMask) {
  return (
    ((type & 0x03) << 29) |
    ((branchMask & 0x7F) << 22) |
    ((yearMask & 0x3F) << 16) |
    ((sectionMask & 0x7FFF) << 1) |
    (scope & 0x01)
  ).toString(16).padStart(8, "0").toUpperCase();
}