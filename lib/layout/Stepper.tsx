import {useNavigation, useRoute} from '@react-navigation/native';
import {useAtomValue, WritableAtom} from 'jotai';
import {atomWithReset} from 'jotai/utils';
import {CircleCheck} from 'lucide-react-native';
import {Fragment} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {cn, Txt} from '../base';
import {smallScreenAtom} from '../settings';
import {getColors} from '../styling';

// ----------------------------------------------------------------------------
// Configuring & tracking the state of a stepper
// ----------------------------------------------------------------------------

/**
 * Configuration for a single step in the stepper.
 * @category Types
 */
type stepConfig = {
    /** The label text for the step */
    label: string;
    /** The navigation route for this step */
    route: string;
    /** Whether the step is locked and cannot be accessed */
    locked?: boolean;
};

/**
 * Configuration for the entire stepper component.
 * @category Types
 */
export type StepperConfiguration = {
    /** Whether to use raw (untranslated) labels */
    rawLabels: boolean;
    /** The initial route to start from */
    startRoute: string | null;
    /** Array of step configurations */
    steps: stepConfig[];
    /** The final route to end at */
    endRoute: string | null;
    /** The highest step index reached so far */
    maxReachedStep: number;
    /** Whether the entire stepper is locked */
    locked?: boolean;
};

/**
 * Creates a new stepper configuration atom with reset capability.
 *
 * @param {boolean} rawLabels - Whether to use raw (untranslated) labels
 * @param {string | null} startRoute - The initial route to start from
 * @param {stepConfig[]} steps - Array of step configurations
 * @param {string | null} endRoute - The final route to end at
 * @returns {WritableAtom<StepperConfiguration>} A writable atom containing the stepper configuration
 * @category Types
 */
export function newStepperConfiguration(rawLabels: boolean, startRoute: string | null, steps: stepConfig[], endRoute: string | null) {
    return atomWithReset<StepperConfiguration>({
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

/**
 * Props for the Step component.
 * @category Types
 */
type stepProps = {
    /** The configuration for this step */
    stepCfg: stepConfig;
    /** Whether to use raw (untranslated) label */
    rawLabel?: boolean;
    /** Whether this step is currently selected */
    selected?: boolean;
    /** Whether this step has been completed */
    passed?: boolean;
    /** Whether this step is locked */
    locked?: boolean;
};

/**
 * A single step in the stepper component.
 * Renders either a checkmark (if passed) or a numbered circle (if not passed).
 *
 * @param {stepProps} props - The component props
 * @returns {JSX.Element} A step component with appropriate styling and navigation
 * @category Types
 */
function Step({stepCfg, rawLabel, selected, passed, locked}: stepProps) {
    const colors = getColors();
    const navigation = useNavigation();
    const smallScreen = useAtomValue(smallScreenAtom);

    return (
        <TouchableOpacity
            className={cn(
                'size-10 items-center justify-center rounded-full',
                selected && 'border-secondary-foreground border-2',
                smallScreen && 'size-16',
            )}
            //@ts-ignore
            onPress={() => passed && !locked && navigation.navigate(stepCfg.route)}>
            {passed && !selected && !locked ? (
                <CircleCheck color={colors.primaryForeground} fill={colors.primary} size={40} />
            ) : (
                <View
                    className={cn(
                        'border-border size-8 items-center justify-center rounded-full border-2 bg-white',
                        selected && 'border-primary-light bg-secondary-darker',
                        smallScreen && 'size-14',
                    )}>
                    <Txt raw={rawLabel} className={cn('text-muted-foreground font-bold', selected && 'text-secondary-foreground')}>
                        {stepCfg.label}
                    </Txt>
                </View>
            )}
        </TouchableOpacity>
    );
}

/**
 * Props for the Stepper component.
 * @category Types
 */
export type StepperProps = {
    /** The stepper configuration atom */
    stepperConf: WritableAtom<StepperConfiguration, any, void>;
    /** Whether the entire stepper is locked */
    stepperLocked: boolean;
};

/**
 * A stepper component that displays a series of steps with navigation capabilities.
 * Steps can be marked as passed, selected, or locked.
 *
 * @param {StepperProps} props - The component props
 * @returns {JSX.Element} A stepper component with connected steps and navigation
 * @category Types
 */
export function Stepper({stepperConf, stepperLocked}: StepperProps) {
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
