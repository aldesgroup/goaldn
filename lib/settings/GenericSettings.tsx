import {useAtomValue} from 'jotai';
import React from 'react';
import {ScrollView, View} from 'react-native';
import {Txt} from '../base';
import {isBleDeviceSimulatedAtom, isSimulationBleDeviceEnabledAtom} from '../bluetooth';
import {Card} from '../layout';
import {EnumAtom, StringAtom, SwitchAtom} from '../state-management';
import {getLanguages} from './i18n';
import {
    detectFromDensityAtom,
    detectFromScaleAtom,
    detectSmallScreenAtom,
    getFontScale,
    getPixelDensity,
    languageAtom,
    smallScreenAtom,
    userSetSmallScreenAtom,
} from './settings';

/**
 * A settings screen component that displays various application settings.
 * Includes language selection, screen size detection, and font scaling options.
 * Can be used as-is or serve as a template for custom settings screens.
 *
 * @returns {JSX.Element} A scrollable settings screen with various configuration options
 * @category Settings
 */
export function GenericSettings() {
    // --- shared state
    const fontScale = getFontScale();
    const pixelDensity = getPixelDensity();
    const detect = useAtomValue(detectSmallScreenAtom);

    // --- effects

    // --- view
    return (
        <ScrollView contentContainerClassName="p-6">
            <Card className="gap-4">
                <EnumAtom
                    label="Language"
                    atom={languageAtom}
                    options={getLanguages()}
                    textClassName="uppercase"
                    badgeClassName="w-auto flex-row"
                    raw
                />
                <SwitchAtom label="Automatically detect small screens?" atom={detectSmallScreenAtom} />
                {detect ? (
                    <>
                        <StringAtom label="Font scale threshold" atom={detectFromScaleAtom} sideValue />
                        <View className="flex-row justify-between gap-2">
                            <Txt className="flex-1">Current font scale</Txt>
                            <Txt raw className="font-bold">
                                {fontScale.toFixed(2)}
                            </Txt>
                        </View>
                        <StringAtom label="Pixel density threshold" atom={detectFromDensityAtom} sideValue />
                        <View className="flex-row justify-between gap-2">
                            <Txt className="flex-1">Current pixel density</Txt>
                            <Txt raw className="font-bold">
                                {pixelDensity.toFixed(2)}
                            </Txt>
                        </View>
                    </>
                ) : (
                    <SwitchAtom label="Adapt to small screens and / or big font?" atom={userSetSmallScreenAtom} />
                )}
                <StringAtom label="Small screen and / or big font mode?" atom={smallScreenAtom} mode="report" />
                <SwitchAtom label="Simulation device enabled?" atom={isSimulationBleDeviceEnabledAtom} />
                <StringAtom label="Simulation device connected?" atom={isBleDeviceSimulatedAtom} mode="report" />
            </Card>
        </ScrollView>
    );
}
