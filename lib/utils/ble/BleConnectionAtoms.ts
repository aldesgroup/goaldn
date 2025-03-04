// atoms.js - Jotai atoms for BLE state management
import { atom } from "jotai";
import { BleManager, Device } from "react-native-ble-plx";

// Create a singleton instance of BleManager that persists across component lifecycles
let bleManagerInstance: BleManager | null = null;

export const getBleManager = () => {
	if (!bleManagerInstance) {
		bleManagerInstance = new BleManager();
	}
	return bleManagerInstance;
};

// Cleanup function to be called on unmount
export const destroyBleManager = () => {
	if (bleManagerInstance) {
		bleManagerInstance.destroy();
		bleManagerInstance = null;
		console.log("Ble manager destroyed");
	}
};

// Stores the BLE manager instance
export const bleManagerAtom = atom<BleManager>(getBleManager());

// Stores the currently connected device
export const connectedDeviceAtom = atom<Device | null>(null);

// Stores connection status
export const isConnectedAtom = atom(false);
