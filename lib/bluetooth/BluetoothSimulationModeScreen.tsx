import {useEffect, useState} from 'react';
import {Pressable, View} from 'react-native';
import Config from 'react-native-config';
import {atom, useAtom} from 'jotai';
import {unwrap} from 'jotai/utils';
import {CircleCheck} from 'lucide-react-native';
import {getColors} from '../styling';
import {Txt, Button} from '../base';
import {useHideTabBar} from '../navigation/navigation-hooks';
import {StringAtom} from '../state-management';
import {isSimulationBleDeviceEnabledAtom} from './bluetoothSimulation';

const codeAtom = atom('');

/**
 * A screen component that allows users to activate the Bluetooth Simulation Mode.
 * Simulation Mode lets you connect to a simulated Bluetooth device for testing.
 * The activation code must be configured with the `BLE_SIMULATION_CODE` environment variable.
 *
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object for screen navigation
 * @category Bluetooth
 */
export function BluetoothSimulationModeScreen({navigation}: {navigation: any}) {
    const [isEnabled, setIsEnabled] = useAtom(unwrap(isSimulationBleDeviceEnabledAtom));
    const colors = getColors();

    const [code, setCode] = useAtom(codeAtom);
    const [lastSubmittedCode, setLastSubmittedCode] = useState('');
    const [hasError, setHasError] = useState(false);

    useHideTabBar();

    const enable = () => {
        setLastSubmittedCode(code);
        if (code === Config.BLE_SIMULATION_CODE) {
            setIsEnabled(true);
            setCode('');
        } else {
            setHasError(true);
        }
    };

    const disable = () => {
        setIsEnabled(false);
        navigation.goBack();
    };

    useEffect(() => {
        if (hasError && code !== lastSubmittedCode) {
            setHasError(false);
        }
    }, [code, lastSubmittedCode, hasError]);

    return (
        <View className="flex-1 gap-6 p-6">
            {isEnabled && lastSubmittedCode ? (
                <>
                    <View className="mt-2 items-center p-4">
                        <CircleCheck color={colors.primaryForeground} fill={colors.primary} size={64} />
                        <Txt className="text-primary mt-8 text-2xl font-bold">Simulation mode enabled!</Txt>
                        <Txt className="text-foreground-light mt-4 text-center text-xl">
                            You can now connect to a simulated device. It will appear in the list of available Bluetooth devices.
                        </Txt>
                    </View>

                    <Pressable className="border-border bg-secondary items-center rounded border p-4" onPress={() => navigation.goBack()}>
                        <Txt className="text-secondary-foreground text-xl font-bold">Go back to the dashboard</Txt>
                    </Pressable>
                </>
            ) : (
                <>
                    <Txt className="text-lg">
                        Simulation mode lets you connect to a simulated Bluetooth device for testing. It will appear in the list of available devices
                        so you can pair with it.
                    </Txt>

                    {isEnabled ? (
                        <Button className="flex-row" onPress={disable} size="lg">
                            <Txt className="font-bold text-white">Disable</Txt>
                        </Button>
                    ) : (
                        <>
                            <Txt className="text-lg">Enter the activation code below to enable Simulation mode.</Txt>

                            <StringAtom label="Code" atom={codeAtom} placeholder="00..." placeholderRaw keyboardType="numeric" autoFocus />

                            {hasError && <Txt className="text-destructive-foreground">Invalid code</Txt>}

                            <Button className="flex-row" onPress={enable} size="lg">
                                <Txt className="font-bold text-white">Enable</Txt>
                            </Button>
                        </>
                    )}
                </>
            )}
        </View>
    );
}
