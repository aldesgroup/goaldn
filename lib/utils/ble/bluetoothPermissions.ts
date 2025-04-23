import {atom, useAtom} from 'jotai';
import {Alert, Linking, Platform} from 'react-native';
import {BleState} from 'react-native-ble-manager';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {getBleManager} from './bluetoothAtoms';

// Jotai atom for permission state
export const permissionsGrantedAtom = atom(false);

/**
 * Returns the appropriate BLE permissions based on platform and OS version
 */
export const getRequiredPermissions = () => {
    if (Platform.OS === 'android') {
        if (Platform.Version >= 31) {
            // Android 12+
            return [PERMISSIONS.ANDROID.BLUETOOTH_SCAN, PERMISSIONS.ANDROID.BLUETOOTH_CONNECT, PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
        } else if (Platform.Version >= 29) {
            // Android 10+
            return [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION];
        } else {
            // Android 9 and below
            return [PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION];
        }
    } else if (Platform.OS === 'ios') {
        const permissions = [PERMISSIONS.IOS.BLUETOOTH];

        // For iOS 13+, location permission is required for BLE scanning
        if (parseInt(Platform.Version, 10) >= 13) {
            //@ts-ignore
            permissions.push(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        }

        return permissions;
    }
    return [];
};

/**
 * Checks if all required BLE permissions are granted
 */
export const checkBlePermissions = async () => {
    try {
        const permissions = getRequiredPermissions();

        for (const permission of permissions) {
            const result = await check(permission);

            if (result !== RESULTS.GRANTED) {
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('Error checking permissions:', error);
        return false;
    }
};

/**
 * Requests all required BLE permissions
 */
export const requestBlePermissions = async () => {
    try {
        const permissions = getRequiredPermissions();
        let allGranted = true;

        for (const permission of permissions) {
            const result = await request(permission);

            if (result === RESULTS.DENIED) {
                // Permission was denied but not permanently
                allGranted = false;
            } else if (result === RESULTS.BLOCKED || result === RESULTS.UNAVAILABLE) {
                // Permission is permanently denied or unavailable
                showPermissionAlert();
                allGranted = false;
                break;
            }
        }

        return allGranted;
    } catch (error) {
        console.error('Error requesting permissions:', error);
        return false;
    }
};

/**
 * Checks and requests BLE permissions if necessary
 */
export const checkAndRequestBlePermissions = async () => {
    // First check if permissions are already granted
    const permissionsGranted = await checkBlePermissions();

    if (permissionsGranted) {
        return true;
    }

    // Request permissions if not already granted
    return await requestBlePermissions();
};

/**
 * Verifies if Bluetooth is enabled (Android 12+ only)
 */
export const checkBluetoothEnabled = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
        try {
            const bleManager = getBleManager();
            const btState = await bleManager.checkState();

            if (btState !== BleState.On) {
                showBluetoothAlert();
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error checking Bluetooth state:', error);
            return false;
        }
    }

    return true; // For iOS or older Android, we don't check
};

/**
 * Shows an alert prompting the user to enable permissions in settings
 */
export const showPermissionAlert = () => {
    Alert.alert(
        'Permissions Required',
        'Bluetooth and location permissions are required to scan for BLE devices. Please enable them in app settings.',
        [
            {text: 'Cancel', style: 'cancel'},
            {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
            },
        ],
    );
};

/**
 * Shows an alert prompting the user to enable Bluetooth
 */
export const showBluetoothAlert = () => {
    Alert.alert('Bluetooth Required', 'Please enable Bluetooth to scan for devices.', [
        {text: 'Cancel', style: 'cancel'},
        {
            text: 'Settings',
            onPress: () => Linking.openSettings(),
        },
    ]);
};
