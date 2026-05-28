import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import BleManager from 'react-native-ble-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function requestBLEPermissions() {
  if (Platform.OS !== 'android') return true;

  try {
    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      ]);

      return (
        granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.BLUETOOTH_ADVERTISE'] === PermissionsAndroid.RESULTS.GRANTED
      );
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('BLE Permission Error:', err);
    return false;
  }
}

async function hasInternetAccess() {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable === true;
  } catch (e) {
    console.log('Network Error:', e);
    return false;
  }
}

async function enableBluetooth() {
  try {
    await BleManager.enableBluetooth();
    return true;
  } catch (e) {
    console.log('Bluetooth Enable Error:', e);
    return false;
  }
}

export default function BleToggle({ bleOn, setBleOn }) {
  const [networkAvailable, setNetworkAvailable] = useState(true);
  const [smartScan, setSmartScan] = useState(false); // ✅ Added smart scan state

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkAvailable(
        state.isConnected === true && state.isInternetReachable === true
      );
    });

    async function loadStoredConfigs() {
      try {
        const storedBleState = await AsyncStorage.getItem("ble_state");
        const storedSmartScan = await AsyncStorage.getItem("smart_scan_state");

        if (storedSmartScan) {
          setSmartScan(JSON.parse(storedSmartScan));
        }

        if (storedBleState) {
          const parsedBle = JSON.parse(storedBleState);
          if (parsedBle) {
            // Re-run toggle logic on startup if it was previously saved as ON
            handleToggle(true, JSON.parse(storedSmartScan) || false);
          }
        }
      } catch (e) {
        console.log("Error loading config:", e);
      }
    }
    loadStoredConfigs();

    return () => unsubscribe();
  }, []);

  // ✅ Fixed handleToggle to properly handle the UI switch states and Smart Scan filters
  const handleToggle = async (value, currentSmartScanMode = smartScan) => {
    await AsyncStorage.setItem("ble_state", JSON.stringify(value));
    setBleOn(value);

    // If turning OFF, stop execution here
    if (!value) {
      return;
    }

    await hasInternetAccess();

    const permissionGranted = await requestBLEPermissions();
    if (!permissionGranted) {
      Alert.alert('Permissions Required', 'Bluetooth permissions are required.');
      setBleOn(false); // Snap switch back to off
      return;
    }

    const bluetoothEnabled = await enableBluetooth();
    if (!bluetoothEnabled) {
      Alert.alert('Bluetooth Required', 'Please enable Bluetooth to continue.');
      setBleOn(false); // Snap switch back to off
      return;
    }
  };

  // ✅ Handled the new Smart Scan switch updates
  const handleSmartScanToggle = async (value) => {
    setSmartScan(value);
    await AsyncStorage.setItem("smart_scan_state", JSON.stringify(value));
    
    // If the master BLE feature is already running, immediately re-run state evaluation
    if (bleOn) {
      handleToggle(true, value);
    }
  };

  return (
    <View className="space-y-4">
      {/* Primary Switch: Offline Notifications */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-base font-semibold text-zinc-900 dark:text-neutral-300">
            Offline Notifications
          </Text>
          <Text className="text-base text-zinc-500 mt-1 leading-5">
            Receive important alerts even without internet access.
          </Text>
        </View>

        <Switch
          value={bleOn}
          onValueChange={(val) => handleToggle(val)}
          trackColor={{
            false: '#D4D4D8',
            true: '#86EFAC',
          }}
          thumbColor={bleOn ? '#16A34A' : '#F4F4F5'}
        />
      </View>

      {/* ✅ New Switch: Smart Scan Toggle Selection */}
      <View className="flex-row items-center justify-between border-t border-zinc-100 dark:border-neutral-600 pt-4">
        <View className="flex-1 pr-4">
          <Text className="text-base font-semibold text-zinc-900 dark:text-neutral-300">
            Smart Scan
          </Text>
          <Text className="text-base text-zinc-500 mt-1 leading-5">
            Only scans during college timing (8:00 AM – 6:00 PM) to conserve battery.
          </Text>
        </View>

        <Switch
          value={smartScan}
          onValueChange={handleSmartScanToggle}
          trackColor={{
            false: '#D4D4D8',
            true: '#86EFAC',
          }}
          thumbColor={smartScan ? '#16A34A' : '#F4F4F5'}
        />
      </View>

      {/* Status Details Footer */}
      <View className="border-t border-zinc-100 dark:border-neutral-600 pt-4 space-y-2">
        {/* BLE Status */}
        <View className="flex-row items-center">
          <View className={`w-3 h-3 rounded-full ${bleOn ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
          <Text className={`ml-2 text-base font-medium ${bleOn ? 'text-emerald-700' : 'text-zinc-500'}`}>
            {bleOn ? 'BLE Active' : 'BLE Disabled'}
          </Text>
        </View>

        {/* Network Status */}
        <View className="flex-row items-center">
          <View className={`w-3 h-3 rounded-full ${networkAvailable ? 'bg-sky-500' : 'bg-red-500'}`} />
          <Text className={`ml-2 text-base font-medium ${networkAvailable ? 'text-sky-700' : 'text-red-600'}`}>
            {networkAvailable ? 'Internet Available' : 'No Internet Access'}
          </Text>
        </View>
      </View>
    </View>
  );
}