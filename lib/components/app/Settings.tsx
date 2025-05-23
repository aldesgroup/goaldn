import {useAtomValue} from 'jotai';
import {View} from 'react-native';
import {cn} from '../../utils/cn';
import {getLanguages} from '../../utils/i18n';
import {
    detectFromDensityAtom,
    detectFromScaleAtom,
    detectSmallScreenAtom,
    getFontScale,
    getPixelDensity,
    languageAtom,
    smallScreenAtom,
    userSetSmallScreenAtom,
} from '../../utils/settings';
import {EnumAtom} from '../ui/custom/enum-atom';
import {StringAtom} from '../ui/custom/string-atom';
import {SwitchAtom} from '../ui/custom/switch-atom';
import {Txt} from '../ui/custom/txt';
import {Card} from './CardBasic';
import {ScrollView} from 'react-native';

// A basic settings screen; can be use as-is, or serve as an inspiration
export function Settings() {
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
            </Card>
        </ScrollView>
    );
}
