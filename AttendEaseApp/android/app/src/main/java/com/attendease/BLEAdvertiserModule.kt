package com.attendease

import android.bluetooth.BluetoothAdapter
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.os.ParcelUuid
import android.util.Log

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray

class BLEAdvertiserModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private var advertiser: BluetoothLeAdvertiser? = null
    private var startPromise: Promise? = null

    override fun getName(): String {
        return "BLEAdvertiser"
    }

    private val advertiseCallback = object : AdvertiseCallback() {

        override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
            Log.d("BLEAdvertiser", "Advertising successfully started")

            startPromise?.resolve(true)
            startPromise = null
        }

        override fun onStartFailure(errorCode: Int) {
            Log.e(
                "BLEAdvertiser",
                "Advertising failed with error code: $errorCode"
            )

            startPromise?.reject(
                "ADVERTISE_FAILED",
                "Advertising failed: $errorCode"
            )
            startPromise = null
        }
    }

    @ReactMethod
    fun startAdvertising(
        uuid: String,
        data: ReadableArray,
        promise: Promise
    ) {
        try {
            val bluetoothAdapter = BluetoothAdapter.getDefaultAdapter()

            if (bluetoothAdapter == null) {
                promise.reject(
                    "BLE_ERROR",
                    "Bluetooth not supported"
                )
                return
            }

            if (!bluetoothAdapter.isEnabled) {
                promise.reject(
                    "BLE_ERROR",
                    "Bluetooth is disabled"
                )
                return
            }

            advertiser = bluetoothAdapter.bluetoothLeAdvertiser

            if (advertiser == null) {
                promise.reject(
                    "BLE_ERROR",
                    "BLE advertising not supported"
                )
                return
            }

            val serviceUuid = ParcelUuid.fromString(uuid)

            val bytes = ByteArray(data.size()) {
                data.getInt(it).toByte()
            }

            val advertiseSettings =
                AdvertiseSettings.Builder()
                    .setAdvertiseMode(
                        AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY
                    )
                    .setTxPowerLevel(
                        AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM
                    )
                    .setConnectable(false)
                    .build()

            val advertiseData =
                AdvertiseData.Builder()
                    .addServiceUuid(serviceUuid)
                    .addServiceData(
                        serviceUuid,
                        bytes
                    )
                    .build()

            startPromise = promise

            advertiser?.startAdvertising(
                advertiseSettings,
                advertiseData,
                advertiseCallback
            )

        } catch (e: Exception) {
            promise.reject(
                "BLE_ERROR",
                e.message ?: "Unknown error",
                e
            )
        }
    }

    @ReactMethod
    fun stopAdvertising(promise: Promise) {
        try {
            advertiser?.stopAdvertising(advertiseCallback)

            Log.d("BLEAdvertiser", "Advertising stopped")

            promise.resolve(true)

        } catch (e: Exception) {
            promise.reject(
                "BLE_ERROR",
                e.message ?: "Failed to stop advertising",
                e
            )
        }
    }
}