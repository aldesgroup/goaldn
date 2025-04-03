import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, TouchableOpacity, View } from "react-native";
import { BleDisconnectPeripheralEvent, Peripheral } from "react-native-ble-manager";
import { CloseIconOption, CombineOptions } from "../../components/app/Navigator-options";
import { Txt } from "../../components/ui/txt";
import { useHideTabBar } from "../hooks";
import {
	bleManagerAtom,
	connectedDeviceAtom,
	isBondingRequiredAtom,
	isConnectedAtom,
} from "./BleConnectionAtoms";
import {
	checkAndRequestBlePermissions,
	checkBluetoothEnabled,
	permissionsGrantedAtom,
} from "./blePermissions";

// these are options that can be used when configuring this screen with react-navigation/native-stack
//@ts-ignore
export const bleScreenOptions = CombineOptions(
	CloseIconOption(),
	({ navigation }: { navigation: any }) => ({ animation: "fade_from_bottom" })
);

//@ts-ignore
export function BleConnectionScreen({ navigation }) {
	// --------------------------------------------------------------------------------------------
	// --- external, shared state
	// --------------------------------------------------------------------------------------------
	const [bleManager] = useAtom(bleManagerAtom);
	const [connectedDevice, setConnectedDevice] = useAtom(connectedDeviceAtom);
	const [isBondingRequired] = useAtom(isBondingRequiredAtom);
	const [_, setIsConnected] = useAtom(isConnectedAtom);
	const [, setPermissionsGranted] = useAtom(permissionsGrantedAtom);

	// --------------------------------------------------------------------------------------------
	// internal state
	// --------------------------------------------------------------------------------------------
	const [isScanning, setIsScanning] = useState(false);
	const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
	const [devices, setDevices] = useState<Peripheral[]>([]);
	const [error, setError] = useState("");
	const [permissionStatus, setPermissionStatus] = useState("checking");

	// --------------------------------------------------------------------------------------------
	// internal, but peristent, state
	// --------------------------------------------------------------------------------------------
	const isScanStarted = useRef<boolean | null>(false);

	// --------------------------------------------------------------------------------------------
	// effects
	// --------------------------------------------------------------------------------------------
	useHideTabBar();
	useEffect(() => {
		// Check permissions when component mounts
		checkPermissions();

		// Start scanning right away - NOPE, not for now
		if (!isScanStarted.current) {
			startOrStopScan();
		}

		// This BLE manager starts operations, that we have to listen to, to handle their result
		const listeners: any[] = [
			bleManager.onDiscoverPeripheral(handleDiscoverPeripheral),
			bleManager.onStopScan(() => setIsScanning(false)),
			bleManager.onConnectPeripheral(handleConnectPeripheral),
			bleManager.onDisconnectPeripheral(handleDisconnectedPeripheral),
		];

		return () => {
			// No cleanup here - BleManager is now a singleton that persists throughout the application lifecycle
			// but at least scanning should be stopped
			if (!isScanStarted.current) {
				bleManager.stopScan().then(() => {
					console.log("Scanning has been stopped!");
					setIsScanning(false);
				});
			}

			// stopping the listening
			for (const listener of listeners) {
				listener.remove();
			}
		};
	}, []);

	// --------------------------------------------------------------------------------------------
	// utils - handlers for the listeners
	// --------------------------------------------------------------------------------------------
	const handleDiscoverPeripheral = (peripheral: Peripheral) => {
		// only considering the devices with a name
		if (peripheral.name) {
			// Add device to list if it exists, has a name, and put the desired ones on top
			// Add device to the list, then apply filtering and sorting
			setDevices((prevDevices) => {
				// Check if device is already in the list
				const isDuplicate = prevDevices.some((d) => d.id === peripheral.id);

				if (isDuplicate) {
					return prevDevices;
				}

				// Create new array with the current device
				const updatedDevices = [...prevDevices, peripheral];

				// 1) Filter out devices with no name
				// 2 & 3) Sort devices - put "MyPrefix_" devices first, then sort alphabetically
				return (
					updatedDevices
						// .filter((d: Peripheral) => d.name) // Remove unnamed devices
						.sort((a, b: Peripheral) => {
							const aHasPrefix = (a.name || "").startsWith("Aldes");
							const bHasPrefix = (b.name || "").startsWith("Aldes");

							// If one has prefix and the other doesn't, prioritize the one with prefix
							if (aHasPrefix && !bHasPrefix) return -1;
							if (!aHasPrefix && bHasPrefix) return 1;

							// Otherwise sort alphabetically
							return (a.name || "").localeCompare(b.name || "");
						})
				);
			});
		}
	};

	const handleConnectPeripheral = (event: any) => {
		console.log(`[handleConnectPeripheral][${event.peripheral}] connected.`);
	};

	const handleDisconnectedPeripheral = (event: BleDisconnectPeripheralEvent) => {
		console.debug(`[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`);
	};

	// --------------------------------------------------------------------------------------------
	// utils - the rest
	// --------------------------------------------------------------------------------------------
	const checkPermissions = async () => {
		setPermissionStatus("checking");
		try {
			const granted = await checkAndRequestBlePermissions();
			setPermissionsGranted(granted);
			setPermissionStatus(granted ? "granted" : "denied");
		} catch (err) {
			if (err instanceof Error) {
				setError(`Permission error: ${err.message}`);
			} else {
				console.log("Unknown error while checking permissions:", err);
			}
			setPermissionStatus("error");
			setPermissionsGranted(false);
		}
	};

	const startOrStopScan = async () => {
		try {
			isScanStarted.current = true;

			setError("");

			if (isScanning) {
				await bleManager.stopScan();
				setIsScanning(false);
				return;
			}

			console.log("device scanning will start");

			// Check if Bluetooth is enabled (Android 12+ only)
			const isBluetoothEnabled = await checkBluetoothEnabled();
			if (!isBluetoothEnabled) {
				setError("Bluetooth is not enabled");
				return;
			}

			// Clear previous scan results
			setDevices([]);
			setIsScanning(true);

			// Scanning
			try {
				bleManager.scan([], 30, false);
			} catch (scanErr) {
				if (scanErr instanceof Error) {
					setError(`Error while scanning for BLE devices: ${scanErr.message}`);
				} else {
					console.log("Unknown error while scanning for BLE devices:", scanErr);
				}
				setIsScanning(false);
			}
		} finally {
			isScanStarted.current = false;
		}
	};

	const connectToDevice = async (device?: Peripheral) => {
		try {
			// First, let's reset the situation a bit
			await bleManager.stopScan();
			setError("");
			setIsScanning(false);
			setIsConnected(false);

			// Keeping track of the currently connected device, if any
			let lastConnectedDevice = null;

			// Disconnecting the current device if any
			if (connectedDevice) {
				console.log("Dropping the connection to: " + connectedDevice.id);

				// we'll probably need this
				lastConnectedDevice = connectedDevice;

				// to show something is going on
				setConnectingDevice(connectedDevice.id);

				// actually disconnecting
				await bleManager.disconnect(connectedDevice.id);

				// we're done
				setConnectingDevice(null);
				setConnectedDevice(null);
			}

			// Connecting to a new one, if any
			if (device) {
				setConnectingDevice(device.id);

				// Connect to the selected device
				await bleManager.connect(device.id);

				// Making its services available
				await bleManager.retrieveServices(device.id);

				// Bonding if necessary
				if (isBondingRequired) {
					// Detecting if bonding has already been done
					const bondedPeripherals = await bleManager.getBondedPeripherals();
					const alreadyBonded = bondedPeripherals.some(
						(bondedDevice) => bondedDevice.id === device.id
					);

					// nope, let's do this
					if (!alreadyBonded) {
						await bleManager.createBond(device.id);
						console.log("Bonding '" + device.name + "' successful");
					}
				}

				// Update connected state
				setConnectedDevice(device);
				setIsConnected(true);

				// Go back to the previous screen
				navigation.goBack();
			} else {
				// we've just disconnected without connecting to a new device
				// this should make our device disappear;
				// so we're cheating here and doing as if we've just re-discovered our old device
				if (lastConnectedDevice) {
					handleDiscoverPeripheral(lastConnectedDevice);
				}
			}

			return true;
		} catch (connErr) {
			if (connErr instanceof Error) {
				setError(`Error while connecting to a BLE device: ${connErr.message}`);
			} else {
				// console.log("Unknown error while connecting to a BLE device:", connErr);
				setError("Unknown error while connecting to a BLE device:" + connErr);
			}
			setIsConnected(false);
			setConnectedDevice(null);
			return false;
		} finally {
			setConnectingDevice(null);
		}
	};

	interface deviceItemProps {
		item: Peripheral;
	}

	const RenderDeviceItem = ({ item }: deviceItemProps) => {
		const device = item;
		const isDeviceConnected =
			(connectedDevice && connectedDevice.id === device.id) || undefined;

		return (
			<View className="flex-row items-center justify-between py-3 px-4 border-b border-gray-200">
				<View className="flex-1 mr-4">
					<Txt raw className="text-base font-medium text-gray-800">
						{device.name || "Unnamed Device"}
					</Txt>
					<Txt raw className="text-sm text-gray-500">
						{device.id}
					</Txt>
					<Txt raw className="text-xs text-gray-400">
						RSSI: {device.rssi}
					</Txt>
				</View>

				<TouchableOpacity
					className={`px-4 py-2 rounded-lg ${
						isDeviceConnected ? "bg-green-500" : "bg-blue-500"
					}`}
					onPress={() =>
						isDeviceConnected ? connectToDevice() : connectToDevice(device)
					}
				>
					{connectingDevice === device.id ? (
						<View>
							<Txt className="text-white font-medium">
								{isDeviceConnected ? "Disconnecting..." : "Connecting..."}
							</Txt>
							<ActivityIndicator size="small" color="white" />
						</View>
					) : (
						<Txt className="text-white font-medium">
							{isDeviceConnected ? "Disconnect" : "Connect"}
						</Txt>
					)}
				</TouchableOpacity>
			</View>
		);
	};

	// TODO handle error... cf. theo3.gg... neverthrow.. ?
	return (
		<View className="flex-1 p-4 bg-white">
			{error && (
				<View className="mb-4 p-3 bg-red-100 rounded-lg">
					<Txt className="text-red-800">{error}</Txt>
				</View>
			)}

			{permissionStatus === "denied" && (
				<TouchableOpacity
					className="mb-4 p-3 bg-yellow-100 rounded-lg"
					onPress={checkPermissions}
				>
					<Txt className="text-yellow-800">
						Bluetooth permissions required. Tap to grant permissions.
					</Txt>
				</TouchableOpacity>
			)}

			{connectedDevice && <RenderDeviceItem item={connectedDevice} />}

			<View className="flex-1">
				<FlatList
					data={Object.values(devices)}
					keyExtractor={(item) => item.id}
					renderItem={RenderDeviceItem}
					contentContainerClassName="pb-4"
					ListEmptyComponent={
						<View className="flex-1 items-center justify-center py-8">
							<Txt className="text-gray-500">
								{isScanning
									? "Scanning for devices..."
									: "No devices found. Tap Scan to begin."}
							</Txt>
						</View>
					}
				/>
			</View>

			<View className="pt-4 border-t border-gray-200">
				<TouchableOpacity
					className="py-3 rounded-lg items-center justify-center"
					onPress={startOrStopScan}
					// disabled={isScanning || permissionStatus === "checking"}
					disabled={permissionStatus === "checking"}
				>
					{isScanning ? (
						<View className="flex-row items-center">
							<ActivityIndicator size="small" color="black" />
							<Txt className="text-black font-medium ml-2">Scanning...</Txt>
						</View>
					) : (
						<Txt className="text-black font-medium">Scan for Devices</Txt>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
}
