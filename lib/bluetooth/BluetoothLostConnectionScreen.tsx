import {useRoute} from '@react-navigation/native';
import {Button, Txt} from '../base';
import {BottomView} from '../layout';
import {View} from 'react-native';

/**
 * This screen can be used when the BLE connection has been lost, to warn the user, and allow her to reconnect.
 * @category Bluetooth
 */
export function GetBluetoothLostConnectionScreen(reconnectScreen: string) {
    return ({navigation}: {navigation: any}) => {
        // --- view
        return (
            <BottomView headerTitle="Loss of connection with the device" onClose={() => navigation.popToTop()}>
                <View className="flex-1">
                    <Txt>
                        Your device has lost its connection to the device. Please reconnect to the device in order to perform further actions. Do not
                        close the application while waiting for reconnection.
                    </Txt>
                </View>
                <Button variant="default" onPress={() => navigation.replace(reconnectScreen)}>
                    <Txt>Reconnect via Bluetooth</Txt>
                </Button>
            </BottomView>
        );
    };
}
