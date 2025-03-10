// import React, { useEffect, useState } from "react";
// import { AppState, AppStateStatus, Text } from "react-native";
// import {
// 	bleManagerAtom,
// 	connectedDeviceAtom,
// 	destroyBleManager,
// 	isConnectedAtom,
// } from "./BleConnectionAtoms";
// import { useAtom } from "jotai";

export function BLEConnectionMonitor() {
	// const [bleManager] = useAtom(bleManagerAtom);
	// const [connectedDevice, setConnectedDevice] = useAtom(connectedDeviceAtom);
	// const [isConnected, setIsConnected] = useAtom(isConnectedAtom);

	// useEffect(() => {
	// 	// Handle app state changes
	// 	const handleAppStateChange = (nextAppState: AppStateStatus) => {
	// 		if (nextAppState === "background" || nextAppState === "inactive") {
	// 			console.log("detected app state change: ", nextAppState);
	// 			if (!!connectedDevice) {
	// 				console.log(
	// 					"there's a connected device! " +
	// 						connectedDevice.name +
	// 						" (" +
	// 						connectedDevice.id +
	// 						")"
	// 				);
	// 			}

	// 			// Attempt to disconnect device when app goes to background
	// 			disconnectDevice();
	// 		}
	// 	};

	// 	// Add app state change listener
	// 	const subscription = AppState.addEventListener("change", handleAppStateChange);

	// 	return () => {
	// 		// Cleanup function
	// 		try {
	// 			// Remove app state listener
	// 			subscription.remove();

	// 			// Disconnect the device
	// 			disconnectDevice();

	// 			// Destroy the BLE manager
	// 			destroyBleManager();

	// 			console.log("BLE Cleanup completed successfully");
	// 		} catch (error) {
	// 			console.error("Error during BLE cleanup:", error);
	// 		}
	// 	};
	// }, [connectedDevice, bleManager]); // Empty dependency array ensures this runs once

	// const disconnectDevice = async () => {
	// 	if (connectedDevice) {
	// 		try {
	// 			console.log("trying to disconnect device " + connectedDevice.id);

	// 			// Attempt to cancel connection
	// 			await bleManager.cancelDeviceConnection(connectedDevice.id);

	// 			// Verify disconnection
	// 			const connectedDevices = await bleManager.connectedDevices([]);
	// 			const isStillConnected = connectedDevices.some(
	// 				(device) => device.id === connectedDevice.id
	// 			);

	// 			if (!isStillConnected) {
	// 				console.log("Device successfully disconnected");
	// 				setConnectedDevice(null);
	// 				setIsConnected(false);
	// 			} else {
	// 				console.warn("Device disconnect verification failed");
	// 			}
	// 		} catch (error) {
	// 			console.error("Disconnect error:", error);
	// 		}
	// 	}
	// };

	return <></>;
}
