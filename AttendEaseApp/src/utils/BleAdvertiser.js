import { PermissionsAndroid, Platform } from 'react-native';
import { scopeAll, scopes, reverseScopes, decToHex } from '../constant/scopes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveNotification } from "../database/database";

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


class NotificationQueue {
    constructor(burstSize) {
        this.notification_queue = new Set();
        this.is_queue_processing = false;
        this.burst_size = burstSize;
        this.is_broadcasting = false;
        this.processQueueTimeout = null;
    }

    get size() {
        return this.notification_queue.size;
    }

    extract() {
        const activeQueue = Array.from(this.notification_queue);
        const activeNotifications = activeQueue.filter(an => an.broadcasted < 5);
        this.notification_queue.clear();

        return activeNotifications;
    }

    add(notification) {
        const exists = [...this.notification_queue]
            .some(item => item.id === notification.id);

        if (exists) return;

        this.notification_queue.add(notification);

        if (this.processQueueTimeout) return;
        if (this.is_broadcasting || this.is_queue_processing) return;
        const randomTime = Math.floor(Math.random() * (9000 - 3000 + 1)) + 3000;
        this.processQueueTimeout = setTimeout(async () => {
            this.processQueueTimeout = null;
            this.processQueue();
        }, randomTime)
    }

    async processQueue() {
        if (this.is_queue_processing) return;

        this.is_queue_processing = true;

        try {
            while (this.notification_queue.size > 0) { // Fix: .size instead of .length
                const activeQueue = this.extract();       // Fix: this.extract getter

                for (const activePacket of activeQueue) {

                    await stopAdvertiser();
                    // stop scanner

                    await delay(50);

                    // advertise the active packet
                    try {
                        await startAdvertising({
                            serviceUUIDs: [activePacket.uuid],
                            advertisingData: {
                                serviceData32: [
                                    {
                                        uuid: activePacket.uuid,
                                        data: activePacket.payload,
                                    },
                                ],
                            },
                        });
                        console.log("Advertising notification: ", activePacket.id);
                    } catch (error) {
                        console.error(error);
                    }

                    // update broadcasted by 1
                    activePacket.broadcasted = (activePacket.broadcasted || 0) + 1;
                    // add notification again in queue if broadcasted still less than 5
                    if (activePacket.broadcasted < 5) {
                        notification_queue.add(activePacket);
                    }

                    await stopAdvertiser();
                    // start scanner 

                    await delay(1000);
                }

                // if notifications in queue wait for 4s for another cycle 
                if (notification_queue.size > 0) {
                    await stopAdvertiser();
                    // start scanner

                    await delay(4000);
                }
            }
        } finally {
            this.is_queue_processing = false;
        }
    }
}

const notification_queue = new NotificationQueue(5);

const services = {
    class_cancelled: "CC",
    cancellation_removed: "CR",

    class_substituted: "CS",
    substitution_removed: "SR",

    announcement: "AT",
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

async function stopAdvertiser() {
    try {
        await stopAdvertising();
        console.log('Advertising stopped');
    } catch (error) {
        console.error('Stop failed:', error);
    }
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
    const cleanScopeData = `${courseCode}${branchCode}${yearCode}${sectionCode}`;
    const scopeBlock = cleanScopeData.padStart(4, '0').substring(0, 4).toUpperCase();

    // notification id
    const notification_id = generateNotificationId(remoteMessage.data.type, remoteMessage.data.scope, remoteMessage.data?.timestamp || remoteMessage.sentTime);

    // check if notification not exists and return 

    // save notification if not exists
    saveNotification(database, {
        notification_id: notification_id,
        scope: remoteMessage.data.scope,
        source: "FCM",
        type: remoteMessage.data.type,
        title: remoteMessage.data.title,
        body: remoteMessage.data.body
    });


    // class cancellation
    if (notificationType === "class_cancelled") { // will do this class cancellation later
        const action = "class_cancelled"; // cancellation_removed

        let fromDiff = decToHex(0).padStart(2, "0").toUpperCase();
        let toDiff = decToHex(0).padStart(2, "0").toUpperCase();
        if (metadata.leave_type !== "period") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // from date encoding
            const fromDate = new Date(metadata.from);
            fromDate.setHours(0, 0, 0, 0);
            fromDiff = (fromDate - today) / (1000 * 60 * 60 * 24);
            if (fromDiff > 15) {
                fromDiff = 16;
            }
            fromDiff = decToHex(fromDiff).padStart(2, "0").toUpperCase();

            // to date encoding
            const toDate = new Date(metadata.to);
            toDate.setHours(0, 0, 0, 0);
            toDiff = (toDate - today) / (1000 * 60 * 60 * 24);
            if (toDiff > 15) {
                toDiff = 16;
            }
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
        const dayOffset = decToHex(3 + (await scopes("day", applicant?.day ?? -1) || 7)).padStart(1, "0").toUpperCase();
        const periodVal = decToHex((applicant?.period_id !== undefined && applicant?.period_id !== null) ? applicant.period_id : 14).padStart(2, "0").toUpperCase();

        const serviceUuid32 = createServiceUuid32(services[action]);
        const payload = `${notification_id}${scopeBlock}0${dayOffset}${periodVal}${encodedPeriods}${fromDiff}${toDiff}`; // 10 bytes / 20 hex char ( 0 is current hops, max is 6 )

        console.log(serviceUuid32, payload)
        notification_queue.add({
            id: notification_id,
            uuid: serviceUuid32,
            payload,
            broadcasted: 0
        })
    }


    else if (notificationType === "class_substitution") {
        const action = Number(metadata.status) === 1 ? "class_substituted" : "substitution_removed";
        // console.log(metadata.status, action)
        const periodId = decToHex(metadata.period_id).padStart(2, "0").toUpperCase(); // used to encode substitutee / substituted class

        let substitutor = null;
        try {
            const result = database?.execute?.(
                "SELECT day, period_id FROM timetable WHERE teacher_id = ? LIMIT 1",
                [metadata?.substitutor]
            );
            substitutor = result?.rows?._array?.[0] || null;
        } catch (dbErr) {
            console.warn("Database execution error on substitutor query:", dbErr);
        }

        // used to encode substitutor
        const dayOffset = decToHex((await scopes("day", substitutor?.day ?? -1)) || 7).padStart(1, "0").toUpperCase();
        const periodVal = decToHex((substitutor?.period_id !== undefined && substitutor?.period_id !== null) ? substitutor.period_id : 14).padStart(2, "0").toUpperCase();

        const serviceUuid32 = createServiceUuid32(services[action]);
        const payload = `${notification_id}${scopeBlock}0${dayOffset}${periodVal}${periodId}`; // 8 bytes / 16 hex char ( 0 is current hops, max is 6 )

        console.log(serviceUuid32, payload)
        notification_queue.add({
            id: notification_id,
            uuid: serviceUuid32,
            payload,
            broadcasted: 0
        })
    }


    else if (notificationType === "announcement") {
        const announcementScope = await packAnnouncementMetadata(2, metadata.scope, metadata.target_branch, metadata.target_year, metadata.target_section);

        const serviceUuid32 = createServiceUuid32(services[notificationType]);

        let message = stringToHex(`${remoteMessage.data.title}\x1F${remoteMessage.data.body.slice(0,)}`).slice(0, 384);
        const maxIndex = Math.ceil(message.length / 32)

        let index = 0;
        while (message.length > 0) {
            const hexIndex = decToHex(index++).padStart(2, "0").toUpperCase();
            const data = message.slice(0, 32);
            message = message.slice(32, message.length);

            const payload = `${hexIndex}${maxIndex}0${notification_id}${announcementScope}${data}`;

            notification_queue.add({
                id: notification_id,
                uuid: serviceUuid32,
                payload,
                broadcasted: 0
            })
        }
    }
}












// helpers

function encodePeriods(periods = []) {
    let mask = 0;
    periods.forEach(p => {
        if (p >= 0) mask |= (1 << p);
    });
    return mask.toString(16).padStart(4, "0").toUpperCase();
}

function generateNotificationId(type, scope, timestamp) {
    const input = `${type}|${scope}|${timestamp}`;

    // FNV-1a 32-bit hash
    let hash = 0x811c9dc5;

    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }

    // Keep lower 24 bits = 3 bytes
    const id24 = hash >>> 0 & 0xFFFFFF;

    return id24
        .toString(16)
        .toUpperCase()
        .padStart(6, "0");
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

function stringToHex(str) {
    return Array.from(new TextEncoder().encode(str))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
}