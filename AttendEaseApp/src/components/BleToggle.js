import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Switch,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import { BleManager, State } from 'react-native-ble-plx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { processScanner } from "../utils/BleDataScanning";

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

export default function BleToggle({ bleOn, setBleOn }) {
  const [networkAvailable, setNetworkAvailable] = useState(true);

  // Instantiate BleManager once using useMemo so it persists across renders
  const manager = useMemo(() => new BleManager(), []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkAvailable(
        state.isConnected === true && state.isInternetReachable === true
      );
    });

    async function checkBleState() {
      const ble_on = await AsyncStorage.getItem("ble_state");
      if (ble_on) {
        try {
          const parsedValue = JSON.parse(ble_on);
          handleToggle(parsedValue);
        } catch (e) {
          handleToggle(false);
        }
      }
    }
    checkBleState();

    // Clean up BleManager when component unmounts to free native channels
    return () => {
      unsubscribe();
      manager.destroy();
    };
  }, [manager]);

  const enableBluetoothSafe = async () => {
    try {
      const currentState = await manager.state();

      if (currentState === State.PoweredOn) {
        return true;
      }

      if (Platform.OS === 'android') {
        // ble-plx custom direct hardware switch engine for Android
        await manager.enable();
        return true;
      } else {
        // iOS Strategy: Apple prevents code from flipping the physical switch.
        // We warn the user to toggle it open via Control Center.
        Alert.alert(
          'Bluetooth Disabled',
          'Please turn on Bluetooth from your iOS Control Center or Settings to active offline notifications.'
        );
        return false;
      }
    } catch (e) {
      console.log('Bluetooth Activation Error:', e);
      return false;
    }
  };

  const handleToggle = async (value) => {
    await AsyncStorage.setItem("ble_state", JSON.stringify(value));

    if (!value) {
      setBleOn(false);
      return;
    }

    const online = await hasInternetAccess();

    const permissionGranted = await requestBLEPermissions();
    if (!permissionGranted) {
      Alert.alert('Permissions Required', 'Bluetooth permissions are required.');
      setBleOn(false);
      return;
    }

    const bluetoothEnabled = await enableBluetoothSafe();
    if (!bluetoothEnabled) {
      setBleOn(false);
      return;
    }

    const hour = new Date().getHours();
    if (hour > 8 && hour < 18) {
      processScanner();
    }
    setBleOn(true);
  };

  return (
    <View className="">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-base font-semibold text-zinc-900">
            Offline Notifications
          </Text>
          <Text className="text-base text-zinc-500 mt-1 leading-5">
            Receive important alerts even without internet access.
          </Text>
        </View>

        <Switch
          value={bleOn}
          onValueChange={handleToggle}
          trackColor={{
            false: '#D4D4D8',
            true: '#86EFAC',
          }}
          thumbColor={bleOn ? '#16A34A' : '#F4F4F5'}
        />
      </View>

      {/* BLE Status */}
      <View className="mt-5 flex-row items-center">
        <View className={`w-3 h-3 rounded-full ${bleOn ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
        <Text className={`ml-2 text-base font-medium ${bleOn ? 'text-emerald-700' : 'text-zinc-500'}`}>
          {bleOn ? 'BLE Active' : 'BLE Disabled'}
        </Text>
      </View>

      {/* Network Status */}
      <View className="mt-3 flex-row items-center">
        <View className={`w-3 h-3 rounded-full ${networkAvailable ? 'bg-sky-500' : 'bg-red-500'}`} />
        <Text className={`ml-2 text-base font-medium ${networkAvailable ? 'text-sky-700' : 'text-red-600'}`}>
          {networkAvailable ? 'Internet Available' : 'No Internet Access'}
        </Text>
      </View>
    </View>
  );
}