import asyncio
from bleak import BleakScanner
import struct
import sys

# --- Configuration Constants (Matching your RN App) ---
TARGET_COMPANY_ID = 0xFFFF
TARGET_APP_ID = "41545445"  # "ATTE" in Hex

# --- Hardcoded Scope Mapping Matrix ---
SCOPES_MAP = {
    "notification_type": {0: "class_cancellation", 1: "class_substitution", 2: "announcement"},
    "scope": {0: "students", 1: "teachers"},
    "branch": {0: "all", 1: "CSE", 2: "AI", 3: "RA", 4: "ME", 5: "CE", 6: "BCA"},
    "year": {0: "all", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5"},
    "section": {0: "all", 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F", 7: "G", 8: "H", 9: "I", 10: "J", 11: "K", 12: "L", 13: "M", 14: "N"},
    "day": {0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday", 5: "Saturday", 6: "Sunday"}
}

# Dynamic storage container holding distinct notifications parsed by ID maps
announcements_registry = {}

def safe_reverse_lookup(category, value):
    return SCOPES_MAP.get(category, {}).get(value, f"Unknown({value})")

def decode_periods(hex_str):
    """Decodes bitmask back to period ID integers"""
    try:
        mask = int(hex_str, 16)
        return [i for i in range(16) if (mask & (1 << i))]
    except ValueError:
        return []

def unpack_announcement_metadata(hex_str):
    """Unpacks the 32-bit bit field used for announcement metadata strictly mapping to JS logic"""
    try:
        # 1. Parse hex string to integer
        raw_value = int(hex_str, 16)
        
        # 2. CRITICAL FIX: Force exact 32-bit unsigned wrapping (Mimics JS >>> 0 behavior)
        value = raw_value & 0xFFFFFFFF
        
        # 3. Extract bitfields using explicit masks to prevent leaking higher bits
        type_code = (value >> 29) & 0x03       # Bits 30-29 (2 bits)
        branch_mask = (value >> 22) & 0x7F     # Bits 28-22 (7 bits)
        year_mask = (value >> 16) & 0x3F       # Bits 21-16 (6 bits)
        section_mask = (value >> 1) & 0x7FFF   # Bits 15-1  (15 bits)
        scope_flag = value & 0x01              # Bit 0      (1 bit)
        
        # Debug trace lines to verify exact values matching your JS fields
        # print(f"[DEBUG BITS] Type: {type_code}, Branch Mask: {bin(branch_mask)}, Year Mask: {bin(year_mask)}, Section Mask: {bin(section_mask)}, Scope: {scope_flag}")
        
        branches = [safe_reverse_lookup("branch", b) for b in range(7) if (branch_mask & (1 << b))]
        years = [safe_reverse_lookup("year", y) for y in range(6) if (year_mask & (1 << y))]
        sections = [safe_reverse_lookup("section", s) for s in range(15) if (section_mask & (1 << s))]
        
        return {
            "type": safe_reverse_lookup("notification_type", type_code),
            "scope": safe_reverse_lookup("scope", scope_flag),
            "target_branches": branches,
            "target_years": years,
            "target_sections": sections
        }
    except Exception as e:
        return f"Error parsing metadata bits: {e}"

def hex_to_ascii(hex_str):
    """Converts hex chunks back into text strings cleanly"""
    try:
        bytes_object = bytes.fromhex(hex_str)
        return bytes_object.decode("utf-8", errors="ignore").replace("\x00", "")
    except ValueError:
        return ""

def parse_uuid_payload(uuid_str, major, minor):
    global announcements_registry
    
    # Clean up standard hyphens to parse string chunks easily
    clean_uuid = uuid_str.replace("-", "").upper()
    
    # Validation Check: Verify AppID match
    appid = clean_uuid[0:8]
    if appid != TARGET_APP_ID:
        return None

    print(f"\n================ MATCH FOUND ================")
    print(f"RAW BLE DATA -> UUID: {uuid_str} | Major: {major} | Minor: {minor}")
    print(f"------------------------------------------------")

    # Extract Common Core Variables
    scope_block = clean_uuid[8:12]
    type_code = int(scope_block[0], 16) if scope_block[0].isdigit() else 2 # Handle type 2 sentinel '2CCC'
    
    notification_id = clean_uuid[20:28]
    tail_flags = clean_uuid[28:32]  # Final 4 characters of the 12-char block

    # --- CASE 0: Class Cancellation ---
    if type_code == 0 and tail_flags[0] != "2":
        branch = safe_reverse_lookup("branch", int(scope_block[1], 16))
        year = safe_reverse_lookup("year", int(scope_block[2], 16))
        section = safe_reverse_lookup("section", int(scope_block[3], 16))
        
        encoded_periods = clean_uuid[12:16]
        from_diff_hex = clean_uuid[16:18]
        to_diff_hex = clean_uuid[18:20]
        
        leave_type_flag = tail_flags[2] # Character index 30 of UUID
        leave_map = {"0": "period", "1": "day", "2": "duration"}
        leave_type = leave_map.get(leave_type_flag, f"Unknown({leave_type_flag})")

        print(f"Type: CLASS CANCELLATION (Code 0)")
        print(f"Scope Targeting: Branch={branch}, Year={year}, Section={section}")
        print(f"Notification ID: {notification_id}")
        print(f"Affected Periods: {decode_periods(encoded_periods)}")
        print(f"Date Offsets (Relative to today): From={int(from_diff_hex, 16)} days, To={int(to_diff_hex, 16)} days")
        print(f"Leave Schedule Profile: {leave_type}")

    # --- CASE 1: Class Substitution ---
    elif type_code == 1 and tail_flags[0] != "2":
        branch = safe_reverse_lookup("branch", int(scope_block[1], 16))
        year = safe_reverse_lookup("year", int(scope_block[2], 16))
        section = safe_reverse_lookup("section", int(scope_block[3], 16))
        
        encoded_period = clean_uuid[12:16]
        encoded_substitutor = clean_uuid[16:20]
        
        substitute_status = encoded_period[2]
        original_period_id = int(encoded_period[3], 16)
        
        sub_day = safe_reverse_lookup("day", int(encoded_substitutor[2], 16))
        sub_period_id = int(encoded_substitutor[3], 16)

        print(f"Type: CLASS SUBSTITUTION (Code 1)")
        print(f"Scope Targeting: Branch={branch}, Year={year}, Section={section}")
        print(f"Notification ID: {notification_id}")
        print(f"Original Status Block: Status={substitute_status}, Period ID={original_period_id}")
        print(f"Assigned Substitute Slot: Cached Day={sub_day}, Target Period ID={sub_period_id}")

    # --- CASE 2: Announcements (Fragmented String Data Chunks) ---
    elif type_code == 2 or tail_flags[0] == "2":
        print(f"Type: ANNOUNCEMENT PACKET FRAGMENT (Code 2)")
        print(f"Notification ID: {notification_id}")
        
        try:
            if notification_id not in announcements_registry:
                announcements_registry[notification_id] = {
                    "notification_id": notification_id,
                    "chunks_received": [],
                    "scope": None,
                    "title_fragments": {},  
                    "body_fragments": {},
                    "max_title_idx": None, # Tracks total expected title slots
                    "max_body_idx": None   # Tracks total expected body slots
                }
                
            current_active = announcements_registry[notification_id]
            chunk_index = int(tail_flags[1], 16) 
            chunk_type = tail_flags[2]           # 0=Metadata Envelope, 1=Title Text, 2=Body Text
            is_final_packet = (tail_flags[3] == "1")
            
            tracking_key = f"{chunk_type}_{chunk_index}"
            
            # A. Handle Metadata Envelope
            if chunk_type == "0":
                metadata_hex = clean_uuid[12:20]
                current_active["scope"] = unpack_announcement_metadata(metadata_hex)
                print(f"Metadata Envelope Processed: {current_active['scope']}")
                if tracking_key not in current_active["chunks_received"]:
                    current_active["chunks_received"].append(tracking_key)

            # B. HANDLE TEXT PAYLOAD DATA CHUNKS (Title or Body)
            elif chunk_type in ("1", "2") and (tracking_key not in current_active["chunks_received"]):
                current_active["chunks_received"].append(tracking_key)
                
                chunk1 = clean_uuid[8:12]   
                chunk2 = clean_uuid[12:16]  
                chunk3 = clean_uuid[16:20]  
                chunk4 = f"{major:04X}"     
                chunk5 = f"{minor:04X}"     
                
                # Reassemble the raw 20-character hex data block
                raw_hex_stream = f"{chunk1}{chunk2}{chunk3}{chunk4}{chunk5}"
                
                # BRANCH DECODING BASED ON CHUNK INDEX POSITION:
                if chunk_index == 0:
                    # Chunk 0 contains your max marker at the front (Indices 0:2)
                    max_idx_hex = raw_hex_stream[0:2]
                    max_expected_slots = int(max_idx_hex, 16)
                    
                    if chunk_type == "1":
                        current_active["max_title_idx"] = max_expected_slots
                    elif chunk_type == "2":
                        current_active["max_body_idx"] = max_expected_slots
                    
                    # Strip off the first 2 marker characters before decoding
                    clean_hex_payload = raw_hex_stream[2:]
                    reconstructed_text = hex_to_ascii(clean_hex_payload)
                else:
                    # Chunks 1+ contain NO marker, decode the full 20 hex characters directly
                    reconstructed_text = hex_to_ascii(raw_hex_stream)
                
                if chunk_type == "1":
                    current_active["title_fragments"][chunk_index] = reconstructed_text
                elif chunk_type == "2":
                    current_active["body_fragments"][chunk_index] = reconstructed_text
                    
            print(f"Processed Chunk -> Type: {chunk_type}, Index: {chunk_index}, IsFinal: {is_final_packet}")
            print("here ======", current_active)        
            
            # === C. DYNAMIC CONTINUITY CHECK PHASE ===
            # Verify that the Metadata Scope AND the Max Bounds from chunk 0 have been parsed
            if (current_active["scope"] is not None and 
                current_active["max_title_idx"] is not None and 
                current_active["max_body_idx"] is not None):
                
                # Check if Title indices are completely continuous from 0 to max_title_idx
                title_continuous = all(idx in current_active["title_fragments"] for idx in range(current_active["max_title_idx"] + 1))
                
                # Check if Body indices are completely continuous from 0 to max_body_idx
                body_continuous = all(idx in current_active["body_fragments"] for idx in range(current_active["max_body_idx"] + 1))
                
                # Dynamic Condition: Trigger only when ALL fragments are present seamlessly
                if title_continuous and body_continuous:
                    # Stitch components strictly by sequential order
                    final_title = "".join([current_active["title_fragments"][k] for k in sorted(current_active["title_fragments"].keys())])
                    final_body = "".join([current_active["body_fragments"][k] for k in sorted(current_active["body_fragments"].keys())])
                    
                    print(f"\n🎉 ===> REASSEMBLED BROADCAST ANNOUNCEMENT <===")
                    print(f"Target Scope Audience: {current_active['scope']}")
                    print(f"Final Message Title:   {final_title.strip()}")
                    print(f"Final Message Body:    {final_body.strip()}")
                    print(f"================================================\n")
                    
                    # Clear memory registers for this notification ID wrapper safely
                    announcements_registry.pop(notification_id)
                else:
                    print("⏳ Index sequences incomplete or contain gaps. Waiting for missing fragments to bridge...")
            else:
                print("⏳ Awaiting initial Index 0 payload packets to establish sequence bounds...")
                
        except Exception as e:
            print(f"Error processing announcement chunk: {e}")

    print("================================================\n")


# --- Low-Latency Native BLE Hook Pipeline Worker ---
packet_processing_queue = asyncio.Queue()

async def packet_processing_worker():
    """
    Decoupled background worker thread optimizing raw radio event delivery rates.
    """
    while True:
        device, advertisement_data = await packet_processing_queue.get()
        try:
            if TARGET_COMPANY_ID in advertisement_data.manufacturer_data:
                raw_bytes = advertisement_data.manufacturer_data[TARGET_COMPANY_ID]
                
                if len(raw_bytes) >= 22:
                    # Unpack standard network big-endian payload configurations safely
                    uuid_bytes, major, minor = struct.unpack(">16sHH", raw_bytes[2:22])
                    
                    uuid_hex = uuid_bytes.hex().upper()
                    formatted_uuid = f"{uuid_hex[0:8]}-{uuid_hex[8:12]}-{uuid_hex[12:16]}-{uuid_hex[16:20]}-{uuid_hex[20:32]}"
                    
                    # Direct processing engine execution
                    parse_uuid_payload(formatted_uuid, major, minor)
        except Exception as e:
            print(f"Internal background processing queue exception error: {e}")
            
        packet_processing_queue.task_done()

def advertisement_callback(device, advertisement_data):
    """
    High-speed callback. Instantly fields hardware advertisements 
    and drops elements directly onto the consumer queue.
    """
    if TARGET_COMPANY_ID in advertisement_data.manufacturer_data:
        packet_processing_queue.put_nowait((device, advertisement_data))

import sys  # Add this import at the top of your file if not already present

async def main():
    print(f"Initializing Aggressive Low-Latency Scanner for AppID: {TARGET_APP_ID}...")
    
    # 1. Spin up background queue worker thread
    worker_task = asyncio.create_task(packet_processing_worker())
    
    # 2. Configure hardware-level active scanner overrides
    # 'active=True' forces the controller to request scan responses immediately
    # 'scanning_mode="active"' tells Windows/WinRT to bypass standard background caching thresholds
    scanner = BleakScanner(
        detection_callback=advertisement_callback,
        active=True,
        scanning_mode="active"
    )
    
    # 3. Start scanning with platform-specific high-duty overrides
    if sys.platform.startswith("linux"):
        print("Linux platform detected. Applying 100% continuous duty cycle BlueZ overrides...")
        await scanner.start(
            bluez={"ScanParams": {"interval": 0x0010, "window": 0x0010}}
        )
    else:
        # Windows / macOS clean startup execution
        print(f"Platform context: {sys.platform}. Executing high-speed native OS adapter scan...")
        await scanner.start()
    
    try:
        # Keep engine core context alive efficiently
        while True:
            await asyncio.sleep(3600.0) 
    except KeyboardInterrupt:
        print("\nStopping BLE scanning engine pipeline clean.")
        await scanner.stop()
        worker_task.cancel()

if __name__ == "__main__":
    asyncio.run(main())