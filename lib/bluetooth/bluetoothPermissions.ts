import {atom} from 'jotai';
import {Alert, Linking, Platform} from 'react-native';
import {BleState} from 'react-native-ble-manager';
import {check, PERMISSIONS, requestMultiple, RESULTS} from 'react-native-permissions';
import {useT} from '../settings';
import {getReportError} from '../utils';
import {getBleManager} from './bluetoothAtoms';

// Jotai atom for permission state
export const permissionsGrantedAtom = atom(false);

/**
 * Returns the appropriate BLE permissions based on platform and OS version
 * @category Bluetooth
 */
export const getRequiredPermissions = () => {
    if (Platform.OS === 'android') {
        if (Platform.Version >= 31) {
            // Android 12+
            return [PERMISSIONS.ANDROID.BLUETOOTH_SCAN, PERMISSIONS.ANDROID.BLUETOOTH_CONNECT];
        } else if (Platform.Version >= 29) {
            // Android 10+
            return [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
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
 * @category Bluetooth
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
        getReportError()(error);
        return false;
    }
};

/**
 * Requests all required BLE permissions
 * @category Bluetooth
 */
export const useRequestBlePermissions = () => {
    const showPermissionAlert = useShowPermissionAlert();
    return async () => {
        try {
            const permissions = getRequiredPermissions();
            const results = await requestMultiple(permissions);
            let allGranted = true;

            for (const permission of permissions) {
                const result = results[permission];

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
            getReportError()(error);
            return false;
        }
    };
};

/**
 * Checks and requests BLE permissions if necessary
 * @category Bluetooth
 */
export const useCheckAndRequestBlePermissions = () => {
    const requestBlePermissions = useRequestBlePermissions();

    // First check if permissions are already granted
    return async () => {
        const permissionsGranted = await checkBlePermissions();

        if (permissionsGranted) {
            return true;
        }

        // Request permissions if not already granted
        return await requestBlePermissions();
    };
};

/**
 * Verifies if Bluetooth is enabled (Android 12+ only)
 * @category Bluetooth
 */
export const useCheckBluetoothEnabled = () => {
    const showBluetoothAlert = useShowBluetoothAlert();
    return async () => {
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
                getReportError()(error);
                return false;
            }
        }

        return true; // For iOS or older Android, we don't check
    };
};

/**
 * Shows an alert prompting the user to enable permissions in settings
 * @category Bluetooth
 */
export const useShowPermissionAlert = () => {
    const t = useT();
    return () =>
        Alert.alert(
            t('Permissions required'),
            Platform.OS === 'android' && Platform.Version >= 31
                ? t('Nearby devices permission is required to scan for Bluetooth devices. Please enable it in Settings.')
                : t('Bluetooth and Location permissions are required to scan for Bluetooth devices. Please enable them in Settings.'),
            [
                {text: t('Cancel'), style: 'cancel'},
                {
                    text: t('Settings'),
                    onPress: () => Linking.openSettings(),
                },
            ],
        );
};

/**
 * Shows an alert prompting the user to enable Bluetooth
 * @category Bluetooth
 */
export const useShowBluetoothAlert = () => {
    const t = useT();
    return () =>
        Alert.alert(t('Bluetooth required'), t('Please enable Bluetooth to scan for devices.'), [
            {text: t('Cancel'), style: 'cancel'},
            {
                text: t('Settings'),
                onPress: () => Linking.openSettings(),
            },
        ]);
};
