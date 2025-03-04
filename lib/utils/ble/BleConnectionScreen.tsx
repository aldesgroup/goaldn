import {
	ActivityIndicator,
	FlatList,
	PermissionsAndroid,
	Platform,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { CloseIcon } from "../icons";
import { Button } from "../../components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import {
	bleManagerAtom,
	connectedDeviceAtom,
	isConnectedAtom,
	destroyBleManager,
} from "./BleConnectionAtoms";

// Import permission utilities
import {
	permissionsGrantedAtom,
	checkAndRequestBlePermissions,
	checkBluetoothEnabled,
} from "./blePermissions";
import { Device } from "react-native-ble-plx";

// these are options that can be used when configuring this screen with react-navigation/native-stack
//@ts-ignore
export function bleConnectionScreenOptions({ navigation }) {
	return {
		// to differ from "normal" navigation (slide-in effect, with back arrow)
		animation: "fade_from_bottom",
		headerRight: () => (
			<TouchableOpacity className="" onPress={() => navigation.goBack()}>
				<CloseIcon color="grey" />
			</TouchableOpacity>
		),
		headerBackVisible: false,
	};
}

//@ts-ignore
export function BleConnectionScreen({ navigation }) {
	const [bleManager] = useAtom(bleManagerAtom);
	const [connectedDevice, setConnectedDevice] = useAtom(connectedDeviceAtom);
	const [, setIsConnected] = useAtom(isConnectedAtom);
	const [, setPermissionsGranted] = useAtom(permissionsGrantedAtom);

	const [isScanning, setIsScanning] = useState(false);
	const [devices, setDevices] = useState<Device[]>([]);
	const [error, setError] = useState("");
	const [permissionStatus, setPermissionStatus] = useState("checking");

	// this won't be reset went the component is unmounted
	const isScanStarted = useRef<boolean | null>(false);

	useEffect(() => {
		// Check permissions when component mounts
		checkPermissions();

		// Start scanning right away - NOPE, not for now
		if (!isScanStarted.current) {
			startScan();
		}

		// No cleanup here - BleManager is now a singleton
		// that persists throughout the application lifecycle
		// return () => {
		// 		destroyBleManager();
		// };
		return () => {
			if (!isScanStarted.current) {
				bleManager.stopDeviceScan().then(() => {
					console.log("Scanning has been stopped!");
					setIsScanning(false);
				});
			}
		};
	}, []);

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

	const startScan = async () => {
		try {
			isScanStarted.current = true;

			setError("");

			if (isScanning) {
				return;
			}

			console.log("device scanning will start");

			// Check permissions before scanning
			const hasPermissions = await checkAndRequestBlePermissions();
			if (!hasPermissions) {
				setError("Required permissions not granted");
				setPermissionStatus("denied");
				return;
			}

			// Check if Bluetooth is enabled (Android 12+ only)
			const isBluetoothEnabled = await checkBluetoothEnabled();
			if (!isBluetoothEnabled) {
				setError("Bluetooth is not enabled");
				return;
			}

			// Clear previous scan results
			setDevices([]);
			setIsScanning(true);

			try {
				bleManager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
					if (error) {
						setError(error.message);
						setIsScanning(false);
						return;
					}

					// Add device to list if it exists, has a name, and put the desired ones on top
					if (device) {
						// Add device to the list, then apply filtering and sorting
						setDevices((prevDevices) => {
							// Check if device is already in the list
							const isDuplicate = prevDevices.some((d) => d.id === device.id);

							if (isDuplicate) {
								return prevDevices;
							}

							// Create new array with the current device
							const updatedDevices = [...prevDevices, device];

							// 1) Filter out devices with no name
							// 2 & 3) Sort devices - put "MyPrefix_" devices first, then sort alphabetically
							return updatedDevices
								.filter((d: Device) => d.name) // Remove unnamed devices
								.sort((a, b: Device) => {
									const aHasPrefix = (a.name || "").startsWith("Aldes");
									const bHasPrefix = (b.name || "").startsWith("Aldes");

									// If one has prefix and the other doesn't, prioritize the one with prefix
									if (aHasPrefix && !bHasPrefix) return -1;
									if (!aHasPrefix && bHasPrefix) return 1;

									// Otherwise sort alphabetically
									return (a.name || "").localeCompare(b.name || "");
								});
						});
					}
				});

				// Stop scanning after 10 seconds
				setTimeout(() => {
					console.log("trying to stop the scanning");
					bleManager.stopDeviceScan();
					console.log("scanning stopped!");
					setIsScanning(false);
				}, 10000);
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

	const connectToDevice = async (device: Device) => {
		try {
			setIsConnected(false);

			// Disconnect current device if any
			if (connectedDevice) {
				await bleManager.cancelDeviceConnection(connectedDevice.id);
			}

			// Connect to the selected device
			const connectedDeviceResult = await device.connect();

			// Discover services and characteristics
			await connectedDeviceResult.discoverAllServicesAndCharacteristics();

			// Update connected state
			setConnectedDevice(connectedDeviceResult);
			setIsConnected(true);

			// Go back to the previous screen
			navigation.goBack();

			return true;
		} catch (connErr) {
			if (connErr instanceof Error) {
				setError(`Error while connecting to a BLE device: ${connErr.message}`);
			} else {
				console.log("Unknown error while connecting to a BLE device:", connErr);
			}
			setIsConnected(false);
			return false;
		}
	};

	interface deviceItemProps {
		item: Device;
	}

	const renderDeviceItem = ({ item }: deviceItemProps) => {
		const device = item;
		const isDeviceConnected =
			(connectedDevice && connectedDevice.id === device.id) || undefined;

		return (
			<View className="flex-row items-center justify-between py-3 px-4 border-b border-gray-200">
				<View className="flex-1 mr-4">
					<Text className="text-base font-medium text-gray-800">
						{device.name || "Unnamed Device"}
					</Text>
					<Text className="text-sm text-gray-500">{device.id}</Text>
					<Text className="text-xs text-gray-400">RSSI: {device.rssi}</Text>
				</View>

				<TouchableOpacity
					className={`px-4 py-2 rounded-lg ${
						isDeviceConnected ? "bg-green-500" : "bg-blue-500"
					}`}
					onPress={() => connectToDevice(device)}
					disabled={isDeviceConnected}
				>
					<Text className="text-white font-medium">
						{isDeviceConnected ? "Connected" : "Connect"}
					</Text>
				</TouchableOpacity>
			</View>
		);
	};

	return (
		<View className="flex-1 p-4 bg-white">
			{error && (
				<View className="mb-4 p-3 bg-red-100 rounded-lg">
					<Text className="text-red-800">{error}</Text>
				</View>
			)}

			{permissionStatus === "denied" && (
				<TouchableOpacity
					className="mb-4 p-3 bg-yellow-100 rounded-lg"
					onPress={checkPermissions}
				>
					<Text className="text-yellow-800">
						Bluetooth permissions required. Tap to grant permissions.
					</Text>
				</TouchableOpacity>
			)}

			<View className="flex-1">
				<FlatList
					data={Object.values(devices)}
					keyExtractor={(item) => item.id}
					renderItem={renderDeviceItem}
					contentContainerClassName="pb-4"
					ListEmptyComponent={
						<View className="flex-1 items-center justify-center py-8">
							<Text className="text-gray-500">
								{isScanning
									? "Scanning for devices..."
									: "No devices found. Tap Scan to begin."}
							</Text>
						</View>
					}
				/>
			</View>

			<View className="pt-4 border-t border-gray-200">
				<TouchableOpacity
					className="py-3 rounded-lg items-center justify-center"
					onPress={startScan}
					disabled={isScanning || permissionStatus === "checking"}
				>
					{isScanning ? (
						<View className="flex-row items-center">
							<ActivityIndicator size="small" color="black" />
							<Text className="text-black font-medium ml-2">Scanning...</Text>
						</View>
					) : (
						<Text className="text-black font-medium">Scan for Devices</Text>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
}
