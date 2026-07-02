#include <NimBLEDevice.h>

struct BeaconData {
  std::string uuid;
  uint16_t major;
  uint16_t minor;
};

// Your frame configurations
BeaconData frames[] = {
  { "41545445-0140-0002-0204-1999AAAC5221", 1280, 51210 },  // 0
  { "41545445-1141-0011-0003-9221EABACCC1", 1280, 51210 },  // 1

  { "41545445-2DD8-4090-0002-76F23CA22000", 1280, 51210 },  // 2
  { "41545445-0068-6900-0000-76F23CA22011", 0, 0 },         // 3
  { "41545445-0068-6579-0000-76F23CA22021", 0, 0 }          // 4
};

const int FRAME_COUNT = sizeof(frames) / sizeof(frames[0]);

int currentSelection = 0;
int seqIndex = 2;
bool isSequencing = false;

bool advertise = false;
const unsigned long ADVERTISE_SWITCH_MS = 2000;

NimBLEAdvertising *advertising;

// Convert UUID string to 16 raw bytes.
// Example:
// 41545445-0140-0002-0204-1999AAAC5221
// becomes:
// 41 54 54 45 01 40 00 02 02 04 19 99 AA AC 52 21
bool uuidToBytes(const std::string &uuid, uint8_t *output) {
  int byteIndex = 0;

  for (size_t i = 0; i < uuid.length() && byteIndex < 16;) {
    // Skip UUID hyphens
    if (uuid[i] == '-') {
      i++;
      continue;
    }

    // Must have two hexadecimal characters left
    if (i + 1 >= uuid.length()) {
      return false;
    }

    char hexPair[3] = {
      uuid[i],
      uuid[i + 1],
      '\0'
    };

    char *endPtr;
    long value = strtol(hexPair, &endPtr, 16);

    // Invalid hex pair, such as "G1"
    if (*endPtr != '\0') {
      return false;
    }

    output[byteIndex++] = (uint8_t)value;
    i += 2;
  }

  return byteIndex == 16;
}

void printPayload(const uint8_t *payload, size_t length) {
  Serial.print("Raw custom data: ");

  for (size_t i = 0; i < length; i++) {
    if (payload[i] < 0x10) {
      Serial.print("0");
    }

    Serial.print(payload[i], HEX);

    if (i < length - 1) {
      Serial.print(" ");
    }
  }

  Serial.println();
}

void startAdvertising(const BeaconData &data, int frameNumber) {
  advertising = NimBLEDevice::getAdvertising();
  advertising->stop();

  NimBLEAdvertisementData advert;

  // 0x02 = General Discoverable
  // 0x04 = Bluetooth Classic not supported
  advert.setFlags(0x06);

  uint8_t payload[25] = { 0 };

  // Compnay ID
  payload[0] = 0xFF;
  payload[1] = 0xFF;

  // iBeacon header
  payload[2] = 0x02;
  payload[3] = 0x15;

  // UUID begins from payload[0]
  if (!uuidToBytes(data.uuid, &payload[4])) {
    Serial.println("ERROR: Invalid UUID");
    return;
  }

  // Major: payload[16], payload[17]
  payload[20] = (data.major >> 8) & 0xFF;
  payload[21] = data.major & 0xFF;

  // Minor: payload[18], payload[19]
  payload[22] = (data.minor >> 8) & 0xFF;
  payload[23] = data.minor & 0xFF;

  // Tx Power
  payload[24] = 0xC7;

  NimBLEAdvertisementData scanResp;
  scanResp.setName("AttendEase ESP32-C3");

  // Put your 20 bytes into BLE manufacturer data
  advert.setManufacturerData(
    std::string((char *)payload, sizeof(payload)));

  advertising->setAdvertisementData(advert);
  advertising->setScanResponseData(scanResp);
  advertising->start();

  // Logs
  Serial.println("--------------------------------");
  Serial.print("Advertising frame: ");
  Serial.println(frameNumber);

  Serial.print("UUID: ");
  Serial.println(data.uuid.c_str());

  Serial.print("Major: ");
  Serial.println(data.major);

  Serial.print("Minor: ");
  Serial.println(data.minor);

  printPayload(payload, sizeof(payload));
  Serial.println("--------------------------------");
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  NimBLEDevice::init("AttendEase ESP32-C3");

  Serial.println("ESP32-C3 advertiser started.");
  Serial.println("Send 0, 1, 2, 3, or 4 in Serial Monitor.");
  Serial.println("Input 2 starts sequence: 2 -> 3 -> 4 -> repeat.");
}

unsigned long lastAdvertise = 0;
short rounds = 0;

void loop() {
  // Read serial input: 0, 1, 2, 3, or 4
  if (Serial.available()) {
    int input = Serial.parseInt();

    if (input >= 0 && input < FRAME_COUNT) {
      currentSelection = input;
      isSequencing = (input == 2);

      if (isSequencing) {
        seqIndex = 2;
      }

      Serial.print("Selected frame: ");
      Serial.println(input);

      // Advertise immediately after selection.
      lastAdvertise = 0;
      rounds = 0;
      advertise = true;
    } else {
      Serial.println("Invalid input. Send 0 to 4.");
    }

    // Remove newline characters left by Serial Monitor.
    while (Serial.available()) {
      Serial.read();
    }
  }

  if (advertise == true) {
    if (millis() - lastAdvertise >= 4000 || seqIndex > 2) {
      if (rounds < 2) {

        if (isSequencing) {
          currentSelection = seqIndex;
        }
        
        Serial.print("\nRound: ");
        Serial.println(rounds + 1);
        startAdvertising(frames[currentSelection], currentSelection);
        delay(300);

        if (isSequencing) {
          seqIndex++;
        }

        else {
          rounds++;
          lastAdvertise = millis();
        }

        if(seqIndex > 4) {
          seqIndex = 2;
          rounds++;
          lastAdvertise = millis();
        } 
        
      } else {
        rounds = 0;
        seqIndex = 2;
        currentSelection = 0;
        delay(2000);
        advertising->stop();
        advertise = false;
      }
    }
  }
}