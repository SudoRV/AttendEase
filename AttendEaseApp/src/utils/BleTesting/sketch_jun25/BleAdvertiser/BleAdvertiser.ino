#include <NimBLEDevice.h>

struct BeaconData {
  std::string uuid;
  uint16_t major;
  uint16_t minor;
};

// Your frame configurations
BeaconData frames[] = {
  {"41545445-0140-0002-0204-1999AAAC5221", 1280, 51210}, // 0
  {"41545445-1141-0011-0003-9221EABCCC1", 1280, 51210},  // 1
  {"41545445-2DD8-4090-0002-76F23CA22000", 1280, 51210}, // 2
  {"41545445-0068-6900-0000-76F23CA22011", 0, 0},        // 3
  {"41545445-0068-6579-0000-76F23CA22021", 0, 0}         // 4
};

const int FRAME_COUNT = sizeof(frames) / sizeof(frames[0]);

int currentSelection = 0;
int seqIndex = 2;
bool isSequencing = false;

unsigned long lastAdvertiseTime = 0;
const unsigned long ADVERTISE_SWITCH_MS = 200;

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
  NimBLEAdvertising *advertising = NimBLEDevice::getAdvertising();

  advertising->stop();

  NimBLEAdvertisementData advert;

  // 0x02 = General Discoverable
  // 0x04 = Bluetooth Classic not supported
  advert.setFlags(0x06);

  /*
    Custom payload layout:

    Bytes 0 to 15  = UUID  (16 bytes)
    Bytes 16 to 17 = Major (2 bytes, big-endian)
    Bytes 18 to 19 = Minor (2 bytes, big-endian)
  */
  uint8_t payload[20] = {0};

  // UUID begins from payload[0]
  if (!uuidToBytes(data.uuid, &payload[0])) {
    Serial.println("ERROR: Invalid UUID");
    return;
  }

  // Major: payload[16], payload[17]
  payload[16] = (data.major >> 8) & 0xFF;
  payload[17] = data.major & 0xFF;

  // Minor: payload[18], payload[19]
  payload[18] = (data.minor >> 8) & 0xFF;
  payload[19] = data.minor & 0xFF;

  // Put your 20 bytes into BLE manufacturer data
  advert.setManufacturerData(
    std::string((char *)payload, sizeof(payload))
  );

  advertising->setAdvertisementData(advert);
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
      lastAdvertiseTime = 0;
    } else {
      Serial.println("Invalid input. Send 0 to 4.");
    }

    // Remove newline characters left by Serial Monitor.
    while (Serial.available()) {
      Serial.read();
    }
  }

  if (millis() - lastAdvertiseTime >= ADVERTISE_SWITCH_MS) {
    if (isSequencing) {
      startAdvertising(frames[seqIndex], seqIndex);

      seqIndex++;

      if (seqIndex > 4) {
        seqIndex = 2;
      }
    } else {
      startAdvertising(frames[currentSelection], currentSelection);
    }

    lastAdvertiseTime = millis();
  }
}