import { PermissionsAndroid, Platform } from 'react-native';
import { scopeAll, scopes, reverseScopes, decToHex } from '../constant/scopes';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    startAdvertising,
    stopAdvertising,
    startScan,
    stopScan,
    addDeviceFoundListener,
    requestBluetoothPermission,
    isBluetoothEnabled,
} from 'react-native-bluetooth-ble';

const APP_ID = "AE";

const services = {
    class_cancelled: "CC",
    cancellation_removed: "CR",

    class_substituted: "CS",
    substitution_removed: "SR",

    announcement_metadata: "AM",
    announcement_title: "AT",
    announcement_body: "AB",
}

function createServiceUuid32(service) {
    if (!/^[A-za-z]{2}$/.test(service)) {
        throw new Error("Service must be exactly two characters")
    }

    const id = APP_ID + service;

    const uuid32 = Array.from(id)
        .map(char =>
            char.charCodeAt(0).toString(16).padStart(2, "0")
        )
        .join("")
        .toUpperCase();

    return `${uuid32}-0000-1000-8000-00805F9B34FB`;
}

export async function initializeBLE() {
    const permissionGranted =
        await requestBluetoothPermission();

    if (!permissionGranted) {
        throw new Error('Bluetooth permission denied');
    }

    const enabled =
        await isBluetoothEnabled();

    if (!enabled) {
        throw new Error('Bluetooth is disabled');
    }

    return true;
}

export async function stopAdvertiser() {

    await stopAdvertising();

    console.log('BLE Advertising stopped');
}

export default async function BleAdvertiser(database, remoteMessage) {
    // console.log("Incoming Remote Message: ", remoteMessage);
    // loading user data
    const user_creds = await AsyncStorage.getItem("user_creds");
    const user = JSON.parse(user_creds || "{}");

    // BLE toggled state 
    const ble_on = await AsyncStorage.getItem("ble_state");
    if (!ble_on) return;
    await initializeBLE();

    // checking for valid scope
    if (!remoteMessage?.data?.scope) {
        console.log("No valid scope found in push payload.");
        return;
    }
    if (remoteMessage?.data?.scope.includes("Individual")) {
        console.log("Individual notification, stopping BLE!");
        return;
    };

    const metadata = JSON.parse(remoteMessage.data.metadata || "{}"); // usefull for announcement scope

    const notificationScope = remoteMessage.data.scope.replace(`COLLEGE_${user?.college_id}_`, "").split("_");

    // Extract raw identifiers from your mapping configuration file
    const notificationType = (remoteMessage.data.type || "").replace(" ", "_").toLowerCase();
    const courseCode = await scopes("course", notificationScope[0]);
    const branchCode = await scopes("branch", notificationScope[1]);
    const yearCode = await scopes("year", notificationScope[2]);
    const sectionCode = await scopes("section", notificationScope[3]);

    console.log(notificationScope, notificationType, courseCode, branchCode, yearCode, sectionCode, metadata)

    // class cancellation
    if(notificationType === "class_cancelled") { // will do this class cancellation later
        const action = "class_cancelled"; // cancellation_removed

        const serviceUuid32 = createServiceUuid32(services[action]);

        console.log(serviceUuid32)
    }
}