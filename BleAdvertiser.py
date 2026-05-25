import asyncio
from winrt.windows.devices.bluetooth.advertisement import (
    BluetoothLEAdvertisementPublisher, 
    BluetoothLEManufacturerData,
    BluetoothLEAdvertisementPublisherStatus
)
from winrt.windows.storage.streams import DataWriter

def handle_status_changed(sender, args):
    print(f"\n[Windows Status Update] State: {args.status.name}")
    if args.error.value != 0:
        print(f"❌ Error Code: {args.error.name}")
    if args.status == BluetoothLEAdvertisementPublisherStatus.STARTED:
        print("🚀 SUCCESS! Your PC is broadcasting the AttendEase token over the air.")

async def main():
    publisher = BluetoothLEAdvertisementPublisher()
    publisher.add_status_changed(handle_status_changed)
    
    # 1. Strip out the local name completely to free up all 31 packet bytes.
    # publisher.advertisement.local_name = ... -> REMOVED
    
    # 2. Pack your actual attendance token data
    writer = DataWriter()
    writer.write_string("R101")  # Length: 4 bytes
    
    manufacturer_data = BluetoothLEManufacturerData()
    manufacturer_data.company_id = 0xFFFF  # Length: 2 bytes
    manufacturer_data.data = writer.detach_buffer()
    
    # Attach data to advertisement array
    publisher.advertisement.manufacturer_data.append(manufacturer_data)

    print("Initializing streamlined BLE payload for legacy hardware...")
    
    try:
        publisher.start()
        print("Publish command sent. Waiting for hardware confirmation...")
        
        while True:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        print("\nStopping BLE Advertisement...")
        publisher.stop()
        await asyncio.sleep(0.5)

if __name__ == "__main__":
    asyncio.run(main())