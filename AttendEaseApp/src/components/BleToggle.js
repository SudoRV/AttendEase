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
    // Android 12+
    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      ]);

      return (
        granted['android.permission.BLUETOOTH_SCAN'] ===
        PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.BLUETOOTH_CONNECT'] ===
        PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.BLUETOOTH_ADVERTISE'] ===
        PermissionsAndroid.RESULTS.GRANTED
      );
    }

    // Android < 12
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

    return (
      state.isConnected === true &&
      state.isInternetReachable === true
    );
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

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkAvailable(
        state.isConnected === true &&
        state.isInternetReachable === true
      );
    });

    // check for old ble config
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

    return () => unsubscribe();
  }, []);

  const handleToggle = async (value) => {
    // save to localstorage
    await AsyncStorage.setItem("ble_state", JSON.stringify(value));

    // OFF
    if (!value) {
      setBleOn(false);
      return;
    }

    // Check Network
    const online = await hasInternetAccess();

    // if (online) {
    //   Alert.alert(
    //     'Internet Available',
    //     'BLE mesh is mainly useful during no-network situations.'
    //   );
    // }

    // Request Permissions
    const permissionGranted = await requestBLEPermissions();

    if (!permissionGranted) {
      Alert.alert(
        'Permissions Required',
        'Bluetooth permissions are required.'
      );
      return;
    }

    // Enable Bluetooth
    const bluetoothEnabled = await enableBluetooth();

    if (!bluetoothEnabled) {
      Alert.alert(
        'Bluetooth Required',
        'Please enable Bluetooth to continue.'
      );
      return;
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
        <View
          className={`w-3 h-3 rounded-full ${bleOn ? 'bg-emerald-500' : 'bg-zinc-400'
            }`}
        />

        <Text
          className={`ml-2 text-base font-medium ${bleOn ? 'text-emerald-700' : 'text-zinc-500'
            }`}
        >
          {bleOn ? 'BLE Active' : 'BLE Disabled'}
        </Text>
      </View>

      {/* Network Status */}
      <View className="mt-3 flex-row items-center">
        <View
          className={`w-3 h-3 rounded-full ${networkAvailable ? 'bg-sky-500' : 'bg-red-500'
            }`}
        />

        <Text
          className={`ml-2 text-base font-medium ${networkAvailable
            ? 'text-sky-700'
            : 'text-red-600'
            }`}
        >
          {networkAvailable
            ? 'Internet Available'
            : 'No Internet Access'}
        </Text>
      </View>
    </View>
  );
}