// atoms.js - Jotai atoms for BLE state management
import { atom } from "jotai";
import BleManager, { Peripheral } from "react-native-ble-manager";

// Create a singleton instance of BleManager that persists across component lifecycles
let started = false;

export const getBleManager = () => {
	if (!started) {
		BleManager.start();
		started = true;
	}

	return BleManager;
};

// Stores the BLE manager instance
export const bleManagerAtom = atom<typeof BleManager>(getBleManager());

// Stores the currently connected device
export const connectedDeviceAtom = atom<Peripheral | null>(null);

// Stores connection status
export const isConnectedAtom = atom(false);

// Stores the bonding requirement
export const isBondingRequiredAtom = atom(false);
