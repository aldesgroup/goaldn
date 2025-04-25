import {useNavigation, useRoute} from '@react-navigation/native';
import {useAtomValue, WritableAtom} from 'jotai';
import {CircleCheck} from 'lucide-react-native';
import {Fragment, useEffect} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {getColors} from '../../../styles/theme';
import {cn} from '../../../utils/cn';
import {Txt} from './txt';
import {atomWithReset} from 'jotai/utils';

// ----------------------------------------------------------------------------
// Configuring & tracking the state of a stepper
// ----------------------------------------------------------------------------

type stepConfig = {
    label: string;
    route: string;
    locked?: boolean;
};

export type stepperConfig = {
    rawLabels: boolean;
    startRoute: string | null;
    steps: stepConfig[];
    endRoute: string | null;
    maxReachedStep: number;
    locked?: boolean;
};

export function NewStepperConfig(rawLabels: boolean, startRoute: string | null, steps: stepConfig[], endRoute: string | null) {
    return atomWithReset<stepperConfig>({
        rawLabels: rawLabels,
        startRoute: startRoute,
        steps: steps,
        endRoute: endRoute,
        maxReachedStep: -1,
    });
}

// ----------------------------------------------------------------------------
// Displaying a stepper
// ----------------------------------------------------------------------------

type stepProps = {
    stepCfg: stepConfig;
    rawLabel?: boolean;
    selected?: boolean;
    passed?: boolean;
    locked?: boolean;
};

function Step({stepCfg, rawLabel, selected, passed, locked}: stepProps) {
    const colors = getColors();
    const navigation = useNavigation();
    return (
        <TouchableOpacity
            className={cn('size-10 items-center justify-center rounded-full', selected && 'border-secondary-foreground border-2')}
            //@ts-ignore
            onPress={() => passed && !locked && navigation.navigate(stepCfg.route)}>
            {passed && !selected && !locked ? (
                <CircleCheck color={colors.primaryForeground} fill={colors.primary} size={40} />
            ) : (
                <View
                    className={cn(
                        'border-border size-8 items-center justify-center rounded-full border-2 bg-white',
                        selected && 'border-primary-light bg-secondary-darker',
                    )}>
                    <Txt raw={rawLabel} className={cn('text-muted-foreground font-bold', selected && 'text-secondary-foreground')}>
                        {stepCfg.label}
                    </Txt>
                </View>
            )}
        </TouchableOpacity>
    );
}

export type stepperProps = {
    stepperConf: WritableAtom<stepperConfig, any, void>;
    stepperLocked: boolean;
};

export function Stepper({stepperConf, stepperLocked}: stepperProps) {
    const cfg = useAtomValue(stepperConf);
    const currentRoute = useRoute();
    const state = useAtomValue(stepperConf);
    const currentStep = state.steps.findIndex(step => step.route === currentRoute.name);

    return (
        <View className={cn('flex-row items-center gap-4')}>
            {cfg.steps.map((step, index) => (
                <Fragment key={index}>
                    {index > 0 && <View className="border-border flex-grow border-b-2" />}
                    <Step
                        stepCfg={step}
                        rawLabel={cfg.rawLabels}
                        passed={state.maxReachedStep >= 0 && index <= state.maxReachedStep}
                        selected={step.route === currentRoute.name}
                        locked={stepperLocked && index > currentStep}
                    />
                </Fragment>
            ))}
        </View>
    );
}
