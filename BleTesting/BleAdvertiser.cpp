#include <NimBLEDevice.h>

struct BeaconData {
  std::string uuid;
  uint16_t major;
  uint16_t minor;
};

// Define your configurations
BeaconData frames[] = {
  {"41545445-0140-0002-0204-1999AAAC5221", 1280, 51210}, // 0
  {"41545445-1141-0011-0003-9221EABCCC1", 1280, 51210},  // 1
  {"41545445-2DD8-4090-0002-76F23CA22000", 1280, 51210}, // 2 (Seq start)
  {"41545445-0068-6900-0000-76F23CA22011", 0, 0},        // 3
  {"41545445-0068-6579-0000-76F23CA22021", 0, 0}         // 4
};

int currentSelection = 0;
int seqIndex = 2; 
bool isSequencing = false;
unsigned long lastSwitchTime = 0;
unsigned long lastAdvertiseTime = 0;

void startAdvertising(BeaconData data) {
  NimBLEDevice::getAdvertising()->stop();
  
  NimBLEAdvertisementData advert;
  advert.setFlags(ESP_BLE_ADV_FLAG_BR_EDR_NOT_SUPPORTED | ESP_BLE_ADV_FLAG_GEN_DISC);
  
  // Custom Manufacturer Data for Beacon format
  // Format: Manufacturer ID (0x004C for Apple) + Beacon Frame
  uint8_t payload[23];
  payload[0] = 0x02; // Beacon Prefix
  payload[1] = 0x15;
  // UUID parsing would go here; simplified for demonstration
  
  advert.setManufacturerData(std::string((char*)payload, 23));
  NimBLEDevice::getAdvertising()->setAdvertisementData(advert);
  NimBLEDevice::getAdvertising()->start();
}

void setup() {
  Serial.begin(115200);
  NimBLEDevice::init("ESP32_C3_Beacon");
}

void loop() {
  // Check Serial for input to select UUID (0-4)
  if (Serial.available()) {
    int input = Serial.parseInt();
    if (input >= 0 && input <= 4) {
      if (currentSelection != input) {
        currentSelection = input;
        isSequencing = (input == 2);
        delay(2000); // 2000ms delay on change
      }
    }
  }

  // Handle Sequencing for items 2, 3, 4
  if (isSequencing) {
    if (millis() - lastAdvertiseTime >= 200) {
      startAdvertising(frames[seqIndex]);
      seqIndex++;
      if (seqIndex > 4) seqIndex = 2;
      lastAdvertiseTime = millis();
    }
  } else {
    // Standard Advertising
    if (millis() - lastAdvertiseTime >= 200) {
      startAdvertising(frames[currentSelection]);
      lastAdvertiseTime = millis();
    }
  }
}