import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

// 1. Instantiate the manager globally so it persists across renders
export const bleManager = new BleManager();

let scannerInterval = null;
let isScanning = false;

// 2. Helper to cleanly convert ble-plx Base64 manufacturer data to Hex
function base64ToHex(base64) {
  return Buffer.from(base64, 'base64').toString('hex').toUpperCase();
}

// 3. The Processor: Filters and handles valid incoming packets
function processNotification(companyIdHex, uuid, major, minor) {
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
  const typeFlag = finalBlock.substring(8, 12); // e.g., 1684, 0184, 0284

  // ----------------------------------------------------
  // YOUR CORE LOGIC HERE
  // ----------------------------------------------------
  // Example: Check typeFlag to know if this is Title data, Body data, or Class Cancellation
  // Example: Convert major/minor and chunk1/2/3 hex back into your 10-character string




}

// 4. The Scanner Engine: Handles time-slicing and data extraction
export function processScanner() {
  // Prevent multiple scanner loops from running simultaneously
  if (scannerInterval) return;

  scannerInterval = setInterval(() => {
    const currentMinute = new Date().getMinutes();

    // EVEN MINUTE: Start scanning
    if (currentMinute % 1 === 0) {
      if (!isScanning) {
        isScanning = true;
        console.log("Scanner: Even minute. Starting scan...");
        
        bleManager.startDeviceScan(null, { allowDuplicates: true }, (error, device) => {
          if (error) {
            console.error("Scan error:", error);
            return;
          }

          // Ensure the packet has manufacturer data before parsing
          if (device && device.manufacturerData) {
            const hexData = base64ToHex(device.manufacturerData);
            
            // Standard iBeacon manufacturer data is usually 50 hex characters (25 bytes)
            // Structure: [CompanyID FFFF] [0215] [UUID 32 chars] [Major 4 chars] [Minor 4 chars] [TX Power]
            if (hexData.length >= 48) {
              const companyIdHex = hexData.substring(0, 4).toUpperCase();

              const uuidStr = hexData.substring(8, 40);   // 16 bytes (32 hex characters)
              const majorHex = hexData.substring(40, 44); // 2 bytes (4 hex characters)
              const minorHex = hexData.substring(44, 48); // 2 bytes (4 hex characters)

              // Format UUID back to standard 8-4-4-4-12 string format with hyphens
              const formattedUuid = `${uuidStr.slice(0,8)}-${uuidStr.slice(8,12)}-${uuidStr.slice(12,16)}-${uuidStr.slice(16,20)}-${uuidStr.slice(20)}`;
              
              const major = parseInt(majorHex, 16);
              const minor = parseInt(minorHex, 16);

              // Pass the extracted packet to your validation and processing function
              processNotification(companyIdHex, formattedUuid, major, minor);
            }
          }
        });
      }
    } 
    // ODD MINUTE: Stop scanning to save battery and comply with time-slicing logic
    else {
      if (isScanning) {
        console.log("Scanner: Odd minute. Stopping scan...");
        bleManager.stopDeviceScan();
        isScanning = false;
      }
    }
  }, 2000); // Check the system clock every 2 seconds
}