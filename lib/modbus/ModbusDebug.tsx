import {useAtomValue} from 'jotai';
import React, {useEffect, useState} from 'react';
import {PeripheralInfo} from 'react-native-ble-manager';
import {Txt} from '../base';
import {connectedDeviceAtom, getBleManager} from '../bluetooth';

export function ModbusDebug() {
    // --- shared state
    const connectedDevice = useAtomValue(connectedDeviceAtom);
    const bleManager = getBleManager();
    const [peripheralInfo, setPeripheralInfo] = useState<PeripheralInfo | null>(null);

    // --- effects
    useEffect(() => {
        const retrieveServices = async () => {
            if (connectedDevice?.id) {
                const pInfo = await bleManager.retrieveServices(connectedDevice?.id);
                setPeripheralInfo(pInfo);
            }
        };

        retrieveServices();
    }, [connectedDevice]);

    // --- view
    return (
        <>
            {peripheralInfo?.serviceUUIDs && peripheralInfo?.serviceUUIDs.map(sID => <Txt raw>Serice ID: {sID}</Txt>)}
            {peripheralInfo?.services &&
                peripheralInfo?.services.map((serv, i) => (
                    <React.Fragment key={i}>
                        <Txt raw>****************************************</Txt>
                        <Txt raw>Service {serv.uuid}</Txt>
                    </React.Fragment>
                ))}
            {peripheralInfo?.advertising && (
                <React.Fragment>
                    <Txt raw>--------------------------------------</Txt>
                    <Txt raw>Connectable: {peripheralInfo?.advertising.isConnectable}</Txt>
                    <Txt raw>Local Name: {peripheralInfo?.advertising.localName}</Txt>
                    <Txt raw>Power lvl: {peripheralInfo?.advertising.txPowerLevel}</Txt>
                    {/* <Txt raw>Power lvl: {peripheralInfo?.advertising.}</Txt> */}
                </React.Fragment>
            )}
            {peripheralInfo?.characteristics &&
                peripheralInfo?.characteristics.map((char, i) => (
                    <React.Fragment key={i}>
                        <Txt raw>========================================</Txt>
                        <Txt raw>Characteristic serv: {char.service}</Txt>
                        <Txt raw>Characteristic char: {char.characteristic}</Txt>
                        {char.descriptors &&
                            char.descriptors.map((desc, j) => (
                                <React.Fragment key={i}>
                                    <Txt raw>
                                        - Desc ID: {desc.uuid} - Value :{desc.value}
                                    </Txt>
                                </React.Fragment>
                            ))}
                        {char.properties && (
                            <React.Fragment key={i}>
                                {char.properties.AuthenticatedSignedWrites && (
                                    <Txt raw>* AuthenticatedSignedWrites : {char.properties.AuthenticatedSignedWrites}</Txt>
                                )}
                                {char.properties.Broadcast && <Txt raw>* Broadcast : {char.properties.Broadcast}</Txt>}
                                {char.properties.ExtendedProperties && <Txt raw>* ExtendedProperties : {char.properties.ExtendedProperties}</Txt>}
                                {char.properties.Indicate && <Txt raw>* Indicate : {char.properties.Indicate}</Txt>}
                                {char.properties.IndicateEncryptionRequired && (
                                    <Txt raw>* IndicateEncryptionRequired : {char.properties.IndicateEncryptionRequired}</Txt>
                                )}
                                {char.properties.Notify && <Txt raw>* Notify : {char.properties.Notify}</Txt>}
                                {char.properties.NotifyEncryptionRequired && (
                                    <Txt raw>* NotifyEncryptionRequired : {char.properties.NotifyEncryptionRequired}</Txt>
                                )}
                                {char.properties.Read && <Txt raw>* Read : {char.properties.Read}</Txt>}
                                {char.properties.Write && <Txt raw>* Write : {char.properties.Write}</Txt>}
                                {char.properties.WriteWithoutResponse && (
                                    <Txt raw>* WriteWithoutResponse : {char.properties.WriteWithoutResponse}</Txt>
                                )}
                            </React.Fragment>
                        )}
                    </React.Fragment>
                ))}
        </>
    );
}
