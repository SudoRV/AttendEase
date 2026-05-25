import React, { useEffect, useState } from 'react';
import { View, Button, PermissionsAndroid, Platform } from 'react-native';
import BLEAdvertise from 'react-native-ble-advertise';
import { scopes, decToHex, hexToDec } from '../constant/scopes';
import { AppStates } from '../context/AppStates';

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
    if (typeCode === 1) {
      // data to propagate ( teacher name (through period id), from, to, on date using difference from current date )

      let toDiff;
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
      uuid = `${appid}-${scopeBlock}-${encodedPeriods}-${toDiff}-${notification_id}1684`;

      const maxHops = 5;
      const currentHops = 0;
      major = (maxHops << 8) | currentHops;
      minor = (0xC8 << 8) | 0x0A;
    }
    // for class substitution
    else if (typeCode === 2) {
      // can be used for substitutee teacher name and subject name
      const encodedPeriod = `${metadata?.status}${decToHex(metadata.period_id)}`.padStart(4, "0").toUpperCase();

      // fetch substitutot data from offline cachce
      const substitutor = database.execute(
        "SELECT day, period_id FROM timetable WHERE teacher_id = ? LIMIT 1",
        [metadata.substitutor]
      ).rows._array[0];
      const encodedSubstitutor = `${scopes("day", substitutor?.day)}${decToHex(substitutor?.period_id)}`.padStart(4, "0").toUpperCase();

      // 4. Stitch everything together following the strict 8-4-4-4-12 size rules
      uuid = `${appid}-${scopeBlock}-${encodedPeriod}-${encodedSubstitutor}-${notification_id}1684`;

      const maxHops = 5;
      const currentHops = 0;
      major = (maxHops << 8) | currentHops;
      minor = (0xC8 << 8) | 0x0A;
    }
    // for announcments
    else if (typeCode === 3) {
      // need to send scope ( branches, years, sections )
      const yearMask = encodePeriods(metadata.target_year.map(y => scopes("year", y)), true);
      const branchMask = encodePeriods(metadata.target_branch.map(b => scopes("branch", b)), true);
      const sectionMask = encodePeriods(metadata.target_section.map(s => scopes("section", s)), true);

      console.log(yearMask, branchMask, sectionMask)
      const announcementScope = packMetadata(typeCode, branchMask, yearMask, sectionMask);
      console.log(announcementScope)
      console.log(unpackMetadata(announcementScope))

      // // 4. Stitch everything together following the strict 8-4-4-4-12 size rules
      uuid = `${appid}-${yearMask}-${branchMask}-${sectionMask}-${notification_id}A684`;

      const maxHops = 5;
      const currentHops = 0;
      major = (maxHops << 8) | currentHops;
      minor = (0xC8 << 8) | 0x0A;
    }
    else {
      return;
    }

    console.log(uuid, major, minor)
    if (!uuid || !major || !minor) return;

    BLEAdvertise.broadcast(uuid, major, minor)
      .then(() => console.log("Broadcasting custom payload safely!"))
      .catch(err => console.error("Broadcast failed:", err));
  };

  const stop = () => {
    BLEAdvertise.stopBroadcast()
      .then(() => console.log('Broadcast stopped successfully'))
      .catch(err => console.error('Failed to stop broadcast:', err));
  };

  if (hasPermission) {
    start();
  } else {
    console.log("Cannot broadcast: Permissions missing.");
  }
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


function encodePeriods(periods = [], bin) {
  let mask = 0;

  periods.forEach(p => {
    mask |= (1 << (p - 1));
  });

  if(bin) return mask;

  return mask.toString(16).padStart(4, "0").toUpperCase();
}


function decodePeriods(hex) {
  const mask = parseInt(hex, 16);

  const periods = [];

  for (let i = 0; i < 16; i++) {
    if (mask & (1 << i)) {
      periods.push(i + 1);
    }
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


// for announcements only
// 23-22 → type
// 21-16 → branches
// 15-11 → years
// 10-1  → sections
// 0      → reserved

function packMetadata(
  type,
  branchMask,
  yearMask,
  sectionMask
) {
  return (
    ((type & 0x03) << 22) |
    ((branchMask & 0x3F) << 16) |
    ((yearMask & 0x1F) << 11) |
    ((sectionMask & 0x3FF) << 1)
  ).toString(16)
    .padStart(6, "0");
}

function unpackMetadata(value) {
  return {
    type: (value >> 22) & 0x03,
    branchMask: (value >> 16) & 0x3F,
    yearMask: (value >> 11) & 0x1F,
    sectionMask: (value >> 1) & 0x3FF
  };
}