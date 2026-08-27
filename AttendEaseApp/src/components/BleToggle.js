import React, { useEffect, useState, useMemo, memo } from 'react';
import {
  View,
  Text,
  Switch,
  Platform,
  PermissionsAndroid,
  Alert,
  FlatList,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo';
import { BleManager } from 'react-native-ble-plx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startMeshScannerLoop, stopMeshScannerLoop } from '../utils/BleDataScanning';
import { AppStates } from '../context/AppStates'; 

const plxManager = new BleManager();

async function requestBLEPermissions() {
  if (Platform.OS !== 'android') return true;
  try {
    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return (
        granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.BLUETOOTH_ADVERTISE'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
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
    while (currentState !== 'PoweredOn') {
      const userChoice = await new Promise((resolve) => {
        Alert.alert(
          'Bluetooth Required',
          'Please enable Bluetooth from your system settings to continue receiving offline notifications.',
          [
            { text: 'Cancel', onPress: () => resolve('CANCEL'), style: 'cancel' },
            { text: 'Try Again', onPress: () => resolve('RETRY') },
          ],
          { cancelable: false }
        );
      });

      if (userChoice === 'CANCEL') return false;
      plxManager.enable().catch((e) => console.log("Native system enable skipped:", e));
      await new Promise(resolve => setTimeout(resolve, 800));
      currentState = await plxManager.state();
    }
    return true;
  } catch (e) {
    console.log('Bluetooth Loop Enable Error:', e);
    return false;
  }
}

const DeviceItem = memo(({ item }) => (
  <View className="p-4 py-3 border-b border-zinc-100 dark:border-neutral-700 bg-white dark:bg-neutral-800">
    <Text className="font-bold text-zinc-900 dark:text-white">
      {item.device?.id || 'Unknown Device'}
    </Text>
    <Text className="font-bold text-zinc-900 dark:text-white">
      {item.device?.name || 'Unknown Device'}
    </Text>
    <Text className="text-sm text-zinc-500 font-mono mt-0.5">uuid: {item?.uuid || 'N/A'}</Text>
    <Text className="text-sm text-neutral-600 dark:text-neutral-300">RSSI: {item.device?.rssi}</Text>
  </View>
));

export default function BleToggle({ bleOn, setBleOn }) {
  const [networkAvailable, setNetworkAvailable] = useState(true);
  const [smartScan, setSmartScan] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'general', 'attendease_native'

  const { bleDevices } = AppStates();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkAvailable(state.isConnected === true && state.isInternetReachable === true);
    });

    async function loadStoredConfigs() {
      try {
        const storedBleState = await AsyncStorage.getItem("ble_state");
        const storedSmartScan = await AsyncStorage.getItem("smart_scan_state");
        if (storedSmartScan) setSmartScan(JSON.parse(storedSmartScan));
        if (storedBleState) {
          const parsedBle = JSON.parse(storedBleState);
          if (parsedBle) handleToggle(true, JSON.parse(storedSmartScan) || false);
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
    await AsyncStorage.setItem("ble_state", JSON.stringify(!bluetoothEnabled ? bluetoothEnabled : value));
    setBleOn(!bluetoothEnabled ? bluetoothEnabled : value);
    if (value && bluetoothEnabled) await startMeshScannerLoop();
  };

  const handleSmartScanToggle = async (value) => {
    setSmartScan(value);
    await AsyncStorage.setItem("smart_scan_state", JSON.stringify(value));
    if (bleOn) handleToggle(true, value);
  };

  // Helper to categorize device traffic
  const getDeviceType = (uuid) => {
    if (uuid && uuid.toUpperCase().startsWith("41545445")) return 'attendease_native';
    return 'general';
  };

  // Memoized filter calculation for performance
  const filteredDevices = useMemo(() => {
    return (bleDevices || []).filter(item => {
      if (activeFilter === 'all') return true;
      return getDeviceType(item.uuid) === activeFilter;
    });
  }, [bleDevices, activeFilter]);

  return (
    <View className="space-y-4">
      {/* Offline Notifications Switch */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-base font-semibold text-zinc-900 dark:text-neutral-300">Offline Notifications</Text>
          <Text className="text-base text-zinc-500 mt-1 leading-5">Receive important alerts even without internet access.</Text>
        </View>
        <Switch value={bleOn} onValueChange={(val) => handleToggle(val)} trackColor={{ false: '#D4D4D8', true: '#86EFAC' }} thumbColor={bleOn ? '#16A34A' : '#F4F4F5'} />
      </View>

      {/* Smart Scan Switch */}
      <View className="flex-row items-center justify-between border-t border-zinc-100 dark:border-neutral-600 pt-4">
        <View className="flex-1 pr-4">
          <Text className="text-base font-semibold text-zinc-900 dark:text-neutral-300">Smart Scan</Text>
          <Text className="text-base text-zinc-500 mt-1 leading-5">Only scans during college timing (8:00 AM – 6:00 PM) to conserve battery.</Text>
        </View>
        <Switch value={smartScan} onValueChange={handleSmartScanToggle} trackColor={{ false: '#D4D4D8', true: '#86EFAC' }} thumbColor={smartScan ? '#16A34A' : '#F4F4F5'} />
      </View>

      {/* Device & Error Display Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-neutral-900 h-5/6 rounded-t-3xl p-5">
            
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-zinc-100 dark:border-neutral-800">
              <Text className="text-xl font-bold text-zinc-900 dark:text-white">
                NearBy Devices: {filteredDevices.length}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="chevron-down" size={20} />
              </TouchableOpacity>
            </View>

            {/* Filter Buttons */}
            <View className="flex-row gap-2 mb-4">
              {[
                { key: 'all', label: 'All' }, 
                { key: 'general', label: 'General' }, 
                { key: 'attendease_native', label: 'AttendEase' }
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  onPress={() => setActiveFilter(filter.key)}
                  className={`px-4 py-1.5 rounded-full ${
                    activeFilter === filter.key 
                      ? 'bg-indigo-500' 
                      : 'bg-white border-zinc-300 dark:bg-neutral-800'
                  }`}
                >
                  <Text className={activeFilter === filter.key ? 'text-white font-bold' : 'text-zinc-600 dark:text-zinc-300'}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flex: 1 }}>
              <FlatList
                data={filteredDevices}
                keyExtractor={(item) => item.device.id}
                renderItem={({ item }) => <DeviceItem item={item} />}
                initialNumToRender={8}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
                ListEmptyComponent={
                  <Text className="text-zinc-400 italic text-center p-8">No scanning devices match this filter...</Text>
                }
              />
            </View>

          </View>
        </View>
      </Modal>

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

      <TouchableOpacity onPress={() => setModalVisible(true)} className="mt-4">
        <Text className="text-base text-neutral-800 font-semibold dark:text-neutral-300 underline">AttendEase BLE Network</Text>
      </TouchableOpacity>
    </View>
  );
}