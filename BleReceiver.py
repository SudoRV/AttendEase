import asyncio
from bleak import BleakScanner
import math

APPLE_COMPANY_ID = 0xFFFF


def parse_ibeacon(manufacturer_data):

    if APPLE_COMPANY_ID not in manufacturer_data:
        return None

    data = manufacturer_data[APPLE_COMPANY_ID]

    # iBeacon packet minimum length
    if len(data) < 23:
        return None

    # iBeacon prefix check
    if data[0] != 0x02 or data[1] != 0x15:
        return None

    uuid_bytes = data[2:18]

    major = int.from_bytes(
        data[18:20],
        byteorder="big"
    )

    minor = int.from_bytes(
        data[20:22],
        byteorder="big"
    )

    tx_power = int.from_bytes(
        data[22:23],
        byteorder="big",
        signed=True
    )

    # UUID formatting
    hex_string = uuid_bytes.hex()

    uuid = (
        f"{hex_string[0:8]}-"
        f"{hex_string[8:12]}-"
        f"{hex_string[12:16]}-"
        f"{hex_string[16:20]}-"
        f"{hex_string[20:32]}"
    ).upper()

    return {
        "uuid": uuid,
        "major": major,
        "minor": minor,
        "tx_power": tx_power
    }


def decode_major(major):

    max_hops = (major >> 8) & 0xFF
    current_hops = major & 0xFF

    return {
        "max_hops": max_hops,
        "current_hops": current_hops
    }


def estimate_distance(tx_power, rssi):

    # invalid RSSI
    if rssi == 0:
        return -1

    ratio = rssi / tx_power

    if ratio < 1.0:
        return round(pow(ratio, 10), 2)

    distance = (
        0.89976 *
        pow(ratio, 7.7095) +
        0.111
    )

    return round(distance, 2)


def detection_callback(device, advertisement_data):

    parsed = parse_ibeacon(
        advertisement_data.manufacturer_data
    )

    if not parsed:
        return

    rssi = advertisement_data.rssi

    distance = estimate_distance(
        parsed["tx_power"],
        rssi
    )

    print("\nFOUND IBEACON")
    print("-" * 50)

    print("DEVICE:", device.address)

    print("\nUUID:")
    print(parsed["uuid"])

    print("\nMAJOR:")
    print(parsed["major"])

    decoded_major = decode_major(
        parsed["major"]
    )

    print("  MAX HOPS:",
          decoded_major["max_hops"])

    print("  CURRENT HOPS:",
          decoded_major["current_hops"])

    print("\nMINOR:")
    print(parsed["minor"])

    print("\nTX POWER:")
    print(parsed["tx_power"], "dBm")

    print("\nRSSI:")
    print(rssi, "dBm")

    print("\nESTIMATED DISTANCE:")
    print(distance, "meters")

    print("-" * 50)


async def main():

    print("Scanning BLE advertisements...\n")

    scanner = BleakScanner(
        detection_callback
    )

    await scanner.start()

    await asyncio.sleep(30)

    await scanner.stop()


asyncio.run(main())