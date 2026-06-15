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

import { BleManager } from 'react-native-ble-plx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startMeshScannerLoop, stopMeshScannerLoop } from '../utils/BleDataScanning';

// Instantiate the single control manager instance for PLX
const plxManager = new BleManager();

async function requestBLEPermissions() {
  if (Platform.OS !== 'android') return true;

  try {
    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, // Required by Android OS for BLE operations
      ]);

      return (
        granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.BLUETOOTH_ADVERTISE'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
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

export async function enableBluetooth() {
  if (Platform.OS !== 'android') return true;

  try {
    let currentState = await plxManager.state();

    // Keep looping as long as the Bluetooth hardware is not turned on
    while (currentState !== 'PoweredOn') {

      // 1. Create a promise that waits for the user's manual selection on the Alert box
      const userChoice = await new Promise((resolve) => {
        Alert.alert(
          'Bluetooth Required',
          'Please enable Bluetooth from your system settings to continue receiving offline notifications.',
          [
            {
              text: 'Cancel',
              onPress: () => resolve('CANCEL'),
              style: 'cancel',
            },
            {
              text: 'Try Again',
              onPress: () => resolve('RETRY'),
            },
          ],
          { cancelable: false } // Prevents closing the alert by tapping outside
        );
      });

      // 2. If the user selects Cancel, abort the loop and return false
      if (userChoice === 'CANCEL') {
        console.log("Bluetooth enabling aborted by user.");
        return false;
      }

      // 3. Optional: Trigger the native system settings prompt to help the user out
      plxManager.enable().catch((e) => console.log("Native system enable skipped:", e));

      // 4. Wait a brief moment for the hardware adapter to cycle, then read the new state
      await new Promise(resolve => setTimeout(resolve, 800));
      currentState = await plxManager.state();
      console.log("Re-evaluating BLE Hardware State inside loop:", currentState);
    }

    return true;

  } catch (e) {
    console.log('Bluetooth Loop Enable Error:', e);
    return false;
  }
}

export default function BleToggle({ bleOn, setBleOn }) {
  const [networkAvailable, setNetworkAvailable] = useState(true);
  const [smartScan, setSmartScan] = useState(false);

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

  const handleToggle = async (value, currentSmartScanMode = smartScan) => {
    if (!value) {
      await AsyncStorage.setItem("ble_state", JSON.stringify(value));
      setBleOn(value);
      await stopMeshScannerLoop();
      return;
    }

    await hasInternetAccess();

    const permissionGranted = await requestBLEPermissions();
    if (!permissionGranted) {
      Alert.alert('Permissions Required', 'Bluetooth permissions are required.');
      setBleOn(false);
      return;
    }

    const bluetoothEnabled = await enableBluetooth();

    await AsyncStorage.setItem("ble_state", JSON.stringify(value));
    setBleOn(value);


    if (value && bluetoothEnabled) await startMeshScannerLoop();
  };

  const handleSmartScanToggle = async (value) => {
    setSmartScan(value);
    await AsyncStorage.setItem("smart_scan_state", JSON.stringify(value));

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

      {/* Smart Scan Switch */}
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
        <View className="flex-row items-center">
          <View className={`w-3 h-3 rounded-full ${bleOn ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
          <Text className={`ml-2 text-base font-medium ${bleOn ? 'text-emerald-700' : 'text-zinc-500'}`}>
            {bleOn ? 'BLE Active' : 'BLE Disabled'}
          </Text>
        </View>

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