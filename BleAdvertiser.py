import asyncio
from winrt.windows.devices.bluetooth.advertisement import (
    BluetoothLEAdvertisement,
    BluetoothLEAdvertisementPublisher,
    BluetoothLEManufacturerData
)
from winrt.windows.storage.streams import DataWriter

# =================================================================
# CONFIGURATION: Build your Case 0 Mesh Frame
# =================================================================
APP_ID = "41545445"
SCOPE_BLOCK = "0140"        # Type 0 (Class Cancel), Branch 1, Year 4, Sec 0
ENCODED_PERIODS = "0002"    # Period index
DIFFS = "0204"              # from_diff=02, to_diff=04
NOTIFICATION_ID = "9999AAAC"
TAIL_FLAGS = "5221"         # Case 0 target flag string

# Reassemble into the exact 32-character pure hex sequence (16 bytes raw)
PURE_HEX_PAYLOAD = f"{APP_ID}{SCOPE_BLOCK}{ENCODED_PERIODS}{DIFFS}{NOTIFICATION_ID}{TAIL_FLAGS}"

# Hops Tracking (Major Field)
MAX_HOPS = 5
CURRENT_HOPS = 0
MAJOR = (MAX_HOPS << 8) | CURRENT_HOPS  # 1280

# Payload Signature (Minor Field)
MINOR = 51210

async def main():
    print("📡 Initializing Validated WinRT iBeacon Broadcaster...")
    print(f"Target UUID Hex:  {PURE_HEX_PAYLOAD}")
    print(f"Target Major:     {MAJOR}")
    print(f"Target Minor:     {MINOR}")
    print("---------------------------------------------------------------")

    adv = BluetoothLEAdvertisement()
    
    # 1. Initialize the Native Windows DataWriter
    writer = DataWriter()
    
    # 2. Write the standard iBeacon Prefix headers that Windows looks for:
    # 0x02 = Data Type (iBeacon), 0x15 = Remaining Data Length (21 bytes)
    writer.write_byte(0x02)
    writer.write_byte(0x15)
    
    # 3. Write your 16-byte Mesh UUID Core Payload
    uuid_bytes = bytes.fromhex(PURE_HEX_PAYLOAD)
    writer.write_bytes(uuid_bytes)
    
    # 4. Write Major (2 Bytes - Big Endian)
    writer.write_byte((MAJOR >> 8) & 0xFF)
    writer.write_byte(MAJOR & 0xFF)
    
    # 5. Write Minor (2 Bytes - Big Endian)
    writer.write_byte((MINOR >> 8) & 0xFF)
    writer.write_byte(MINOR & 0xFF)
    
    # 6. Write default Tx Power calibration byte (-59 dBm fallback)
    writer.write_byte(0xC5)
    
    # 7. Package everything inside Apple's official registered Company ID (0x004C)
    manufacturer_data = BluetoothLEManufacturerData()
    manufacturer_data.company_id = 0x004C
    manufacturer_data.data = writer.detach_buffer()
    
    adv.manufacturer_data.append(manufacturer_data)

    publisher = BluetoothLEAdvertisementPublisher(adv)
    
    try:
        print("🚀 Requesting Windows OS to start advertising...")
        publisher.start()
        
        print("\n🟢 ADVERTISING ACTIVE SUCCESSFULLY!")
        print("Your PC is now broadcasting your exact mesh architecture array over the air.")
        print("Keep this terminal open and check your phone's debug app logs.")
        print("ℹ️  Press Ctrl+C to terminate transmission.")
        
        while True:
            await asyncio.sleep(1)
            
    except asyncio.CancelledError:
        pass
    except Exception as e:
        print(f"❌ Failed to run Windows BLE Engine: {e}")
    finally:
        print("\n🛑 Stopping Native Windows Publisher...")
        publisher.stop()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nSimulation terminated by user.")