import React, { useEffect, useState } from 'react';
import { View, Button, PermissionsAndroid, Platform } from 'react-native';
import BLEAdvertise from 'react-native-ble-advertise';
import { scopes, reverseScopes, decToHex, hexToDec } from '../constant/scopes';
import { AppStates } from '../context/AppStates';

const notification_queue = [];

export default async function BleDataPropagation(userData, database, remoteMessage) {
  console.log(remoteMessage);

  const hasPermission = await requestBLEPermissions();
  console.log("Has permission: ", hasPermission);

  if (!remoteMessage?.data?.scope) {
    console.log("No valid scope found in push payload.");
    return;
  }

  const companyId = 0xFFFF;
  const appid = "41545445"; // ATTE (8 characters)
  BLEAdvertise.setCompanyId(companyId);

  const metadata = JSON.parse(remoteMessage.data.metadata || "{}");
  const notificationScope = remoteMessage.data.scope.split("_");

  // 1. Extract raw identifiers from your mapping configuration file
  const typeCode = scopes("notification_type", remoteMessage.data.type.replace(" ", "_").toLowerCase());
  const branchCode = scopes("branch", notificationScope[0]);
  const yearCode = scopes("year", notificationScope[1]);
  const sectionCode = scopes("section", notificationScope[2]);
  // 2. Combine them together into a single text sequence, stripping out any stray marks
  const cleanScopeData = `${typeCode}${branchCode}${yearCode}${sectionCode}`;
  // 3. SAFETY CHECK: Ensure it fits the 4-character slot by slicing or padding
  // This step prevents app crashes if your scopes file changes design later
  const scopeBlock = cleanScopeData.padStart(4, '0').substring(0, 4).toUpperCase();

  const notification_id = (sHash(remoteMessage.messageId) >>> 0)
    .toString(16).toUpperCase()
    .padStart(8, "0");

  const start = () => {
    let uuid;
    let major;
    let minor;

    // for class cancellation
    if (typeCode === 0) {
      // data to propagate ( teacher name (through period id), from, to, on date using difference from current date )

      let toDiff = decToHex(0).padStart(4, "0").toUpperCase();;
      if (metadata.leave_type === "duration") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const toDate = new Date(metadata.to);
        toDate.setHours(0, 0, 0, 0);

        toDiff = (toDate - today) / (1000 * 60 * 60 * 24);
        toDiff = decToHex(toDiff).padStart(4, "0").toUpperCase();
      }

      // it will be used to get the teacher name 
      // console.log(metadata.period_id, encodePeriods(metadata?.period_id || []), toDiff)
      const encodedPeriods = encodePeriods(metadata?.period_id || []);

      // 4. Stitch everything together following the strict 8-4-4-4-12 size rules
      uuid = `${appid}-${scopeBlock}-${encodedPeriods}-${toDiff}-${notification_id}2A${metadata.leave_type === "period" ? "0" : metadata.leave_type === "day" ? "1" : "2"}1`;

      const maxHops = 5;
      const currentHops = 0;
      major = (maxHops << 8) | currentHops;
      minor = (0xC8 << 8) | 0x0A;

      queueNotification(uuid, major, minor);
    }
    // for class substitution
    else if (typeCode === 1) {
      // can be used for substitutee teacher name and subject name
      const encodedPeriod = `${metadata?.status}${decToHex(metadata.period_id)}`.padStart(4, "0").toUpperCase();

      // fetch substitutor data from offline cachce
      const substitutor = database.execute(
        "SELECT day, period_id FROM timetable WHERE teacher_id = ? LIMIT 1",
        [metadata.substitutor]
      ).rows._array[0];
      const encodedSubstitutor = `${scopes("day", substitutor?.day)}${decToHex(substitutor?.period_id)}`.padStart(4, "0").toUpperCase();

      // 4. Stitch everything together following the strict 8-4-4-4-12 size rules
      uuid = `${appid}-${scopeBlock}-${encodedPeriod}-${encodedSubstitutor}-${notification_id}C2A1`;

      const maxHops = 5;
      const currentHops = 0;
      major = (maxHops << 8) | currentHops;
      minor = (0xC8 << 8) | 0x0A;

      queueNotification(uuid, major, minor);
    }
    // for announcments
    else if (typeCode === 2) {
      // need to send scope ( branches, years, sections )
      const announcementScope = packAnnouncementMetadata(typeCode, metadata.scope, metadata.target_branch, metadata.target_year, metadata.target_section);
      // console.log("Packed metadata payload:", unpackMetadata(announcementScope));

      // // 4. Stitch everything together following the strict 8-4-4-4-12 size rules
      uuid = `${appid}-2BCF-${announcementScope.slice(0, 4)}-${announcementScope.slice(4, 8)}-${notification_id}B000`; //0 init of announcement,  0 notification id data / 1 title data / 2 body data, 0 notification incomplete

      const maxHops = 5;
      const currentHops = 0;
      major = (maxHops << 8) | currentHops;
      minor = (0xC8 << 8) | 0x0A;

      queueNotification(uuid, major, minor);

      // divide announcement in parts

      const title = remoteMessage.data.title || "";
      const body = remoteMessage.data.body || "";

      // console.log(title, body)

      // Using the 'gs' flag to slice into exactly 10-character chunks safely
      const t_chunks = title.match(/.{1,10}/gs) || [];
      const b_chunks = body.match(/.{1,10}/gs) || [];

      // 1. Process Title Chunks
      t_chunks.forEach((c, index) => {
        // Convert 10 text characters into exactly 20 hex characters
        const hexChunk = Array.from(c)
          .map(char => char.charCodeAt(0).toString(16).toUpperCase())
          .join("")
          .padEnd(20, "0"); // Pad short strings with trailing zeros

        // Split the 20 hex characters into the respective target locations
        const chunk1 = hexChunk.substring(0, 4);   // 2 text chars -> UUID Block 2
        const chunk2 = hexChunk.substring(4, 8);   // 2 text chars -> UUID Block 3
        const chunk3 = hexChunk.substring(8, 12);  // 2 text chars -> UUID Block 4
        const chunk4 = hexChunk.substring(12, 16); // 2 text chars -> Major
        const chunk5 = hexChunk.substring(16, 20); // 2 text chars -> Minor

        // STRICT 8-4-4-4-12 UUID FORMAT
        // Total characters: 8 + 4 + 4 + 4 + 12 = 32 hex digits (Flawless standard compliance)
        const uuid = `${appid}-${chunk1}-${chunk2}-${chunk3}-${notification_id}B11${t_chunks.length - 1 === index ? 1 : 0}`;

        // Parse the remaining 4-character hex strings into numeric integers for BLE transmission
        const major = parseInt(chunk4, 16);
        const minor = parseInt(chunk5, 16);

        // console.log(`Title Chunk ${index} Broadcast Data:`);
        // console.log(`  UUID:  ${uuid}`);
        // console.log(`  Major: ${major} (Hex: 0x${chunk4})`);
        // console.log(`  Minor: ${minor} (Hex: 0x${chunk5})`);

        queueNotification(uuid, major, minor);
      });

      // 2. Process Body Chunks
      b_chunks.forEach((c, index) => {
        const hexChunk = Array.from(c).map(char => char.charCodeAt(0).toString(16).toUpperCase()).join("").padEnd(20, "0");

        const chunk1 = hexChunk.substring(0, 4);
        const chunk2 = hexChunk.substring(4, 8);
        const chunk3 = hexChunk.substring(8, 12);
        const chunk4 = hexChunk.substring(12, 16);
        const chunk5 = hexChunk.substring(16, 20);

        // Uses '0284' flag inside the final 12-char block to signify Body Data
        const uuid = `${appid}-${chunk1}-${chunk2}-${chunk3}-${notification_id}C12${b_chunks.length - 1 === index ? 1 : 0}`;

        const major = parseInt(chunk4, 16);
        const minor = parseInt(chunk5, 16);

        // console.log(`Body Chunk ${index} Broadcast Data:`);
        // console.log(`  UUID:  ${uuid}`);
        // console.log(`  Major: ${major} (Hex: 0x${chunk4})`);
        // console.log(`  Minor: ${minor} (Hex: 0x${chunk5})`);

        queueNotification(uuid, major, minor);
      });
    }
    else {
      return;
    }

    processQueue()
  };

  if (hasPermission) {
    start();
  } else {
    console.log("Cannot broadcast: Permissions missing.");
  }
}



// notification queue broadcaster
let transmissionInterval = null;

function processQueue() {
  if (transmissionInterval) return;

  transmissionInterval = setInterval(async () => {
    // 1. If queue is empty, shut down the transmitter
    if (notification_queue.length === 0) {
      clearInterval(transmissionInterval);
      transmissionInterval = null;
      await stop();
      return;
    }

    // Pull the next packet completely off the FRONT of the queue
    const currentPacket = notification_queue.shift();

    try {
      await BLEAdvertise.stopBroadcast();
      await BLEAdvertise.broadcast(currentPacket.uuid, currentPacket.major, currentPacket.minor);

      currentPacket.broadcasted += 1;
      console.log(`Broadcasted packet [${currentPacket.broadcasted}/5]: ${currentPacket.uuid}`);

      // 3. If it hasn't hit 5 broadcasts yet, push it to the BACK of the queue
      if (currentPacket.broadcasted < 3) {
        notification_queue.push(currentPacket);
      }
      // If it is exactly 5, it just disappears into the void (deleted naturally)

    } catch (err) {
      console.error("Broadcast cycle failed:", err);
      // Put it back in the queue so we don't lose it due to an error
      notification_queue.push(currentPacket);
    }

  }, 3000); // 3 seconds gap before moving to the next item in the cycle
}











// helper functions 

function queueNotification(uuid, major, minor) {
  notification_queue.push({ broadcasted: 0, uuid, major, minor });
}

export function broadcast(uuid, major, minor) {
  BLEAdvertise.broadcast(uuid, major, minor)
    .then(() => console.log("Broadcasting custom payload safely!"))
    .catch(err => console.error("Broadcast failed:", err));
}

export async function stop() {
  return BLEAdvertise.stopBroadcast()
    .then(() => console.log('Broadcast stopped successfully'))
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

function decodePeriods(hex) {
  const mask = parseInt(hex, 16);
  const periods = [];
  for (let i = 0; i < 16; i++) {
    if (mask & (1 << i)) periods.push(i);
  }
  return periods;
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