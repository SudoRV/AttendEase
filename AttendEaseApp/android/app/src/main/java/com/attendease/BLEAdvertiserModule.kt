package com.attendease

import android.bluetooth.BluetoothAdapter
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.os.ParcelUuid
import android.util.Log
import com.facebook.react.bridge.*
import java.util.*

class BLEAdvertiserModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var advertiser: BluetoothLeAdvertiser? = null

    override fun getName(): String {
        return "BLEAdvertiser"
    }

    @ReactMethod
    fun startAdvertising(message: String, promise: Promise) {
        val bluetoothAdapter = BluetoothAdapter.getDefaultAdapter()
        
        if (bluetoothAdapter == null || !bluetoothAdapter.isMultipleAdvertisementSupported) {
            promise.reject("BLE_ERROR", "Bluetooth LE Advertising not supported on this device.")
            return
        }

        advertiser = bluetoothAdapter.bluetoothLeAdvertiser

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(false)
            .build()

        val serviceUUID = ParcelUuid(UUID.fromString("12345678-1234-1234-1234-123456789abc"))

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(true)
            .addServiceUuid(serviceUUID)
            // Note: If you want to use the 'message' variable, you can add it as ServiceData
            // but remember BLE advertising packets have a strict 31-byte limit!
            .build()

        advertiser?.startAdvertising(settings, data, advertiseCallback)
        promise.resolve("Advertising starting...")
    }

    @ReactMethod
    fun stopAdvertising() {
        advertiser?.stopAdvertising(advertiseCallback)
    }

    private val advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
            Log.d("BLEAdvertiser", "Advertising successfully started")
        }

        override fun onStartFailure(errorCode: Int) {
            Log.e("BLEAdvertiser", "Advertising failed with error code: $errorCode")
        }
    }
}