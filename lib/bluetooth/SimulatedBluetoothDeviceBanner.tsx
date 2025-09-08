import {View} from 'react-native';
import {useAtomValue} from 'jotai';
import {Info} from 'lucide-react-native';
import {Txt} from '../base';
import {isBleDeviceSimulatedAtom} from './bluetoothSimulation';

/**
 * Banner shown when the app is connected to a simulated Bluetooth device
 *
 * @category Bluetooth
 */
export function SimulatedBluetoothDeviceBanner() {
    const isBleDeviceSimulated = useAtomValue(isBleDeviceSimulatedAtom);

    return isBleDeviceSimulated ? (
        <View className={'flex-row gap-4 rounded-xl border border-violet-200 bg-violet-100 px-4 py-2'}>
            <View className="flex-row items-center gap-2">
                <Info color="#4C1D95" size={16} strokeWidth={2} />
            </View>
            <Txt className="flex-1 text-lg font-bold text-violet-900">Connected to a simulated device.</Txt>
        </View>
    ) : null;
}
