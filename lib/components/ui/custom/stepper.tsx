import {useNavigation, useRoute} from '@react-navigation/native';
import {useAtomValue, WritableAtom} from 'jotai';
import {atomWithReset} from 'jotai/utils';
import {CircleCheck} from 'lucide-react-native';
import {Fragment} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {getColors} from '../../../styles/theme';
import {cn} from '../../../utils/cn';
import {smallScreenAtom} from '../../../utils/settings';
import {Txt} from './txt';

// ----------------------------------------------------------------------------
// Configuring & tracking the state of a stepper
// ----------------------------------------------------------------------------

/**
 * Configuration for a single step in the stepper.
 * @property {string} label - The label text for the step
 * @property {string} route - The navigation route for this step
 * @property {boolean} [locked] - Whether the step is locked and cannot be accessed
 */
type stepConfig = {
    label: string;
    route: string;
    locked?: boolean;
};

/**
 * Configuration for the entire stepper component.
 * @property {boolean} rawLabels - Whether to use raw (untranslated) labels
 * @property {string | null} startRoute - The initial route to start from
 * @property {stepConfig[]} steps - Array of step configurations
 * @property {string | null} endRoute - The final route to end at
 * @property {number} maxReachedStep - The highest step index reached so far
 * @property {boolean} [locked] - Whether the entire stepper is locked
 */
export type stepperConfig = {
    rawLabels: boolean;
    startRoute: string | null;
    steps: stepConfig[];
    endRoute: string | null;
    maxReachedStep: number;
    locked?: boolean;
};

/**
 * Creates a new stepper configuration atom with reset capability.
 *
 * @param {boolean} rawLabels - Whether to use raw (untranslated) labels
 * @param {string | null} startRoute - The initial route to start from
 * @param {stepConfig[]} steps - Array of step configurations
 * @param {string | null} endRoute - The final route to end at
 * @returns {WritableAtom<stepperConfig>} A writable atom containing the stepper configuration
 */
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

/**
 * Props for the Step component.
 * @property {stepConfig} stepCfg - The configuration for this step
 * @property {boolean} [rawLabel] - Whether to use raw (untranslated) label
 * @property {boolean} [selected] - Whether this step is currently selected
 * @property {boolean} [passed] - Whether this step has been completed
 * @property {boolean} [locked] - Whether this step is locked
 */
type stepProps = {
    stepCfg: stepConfig;
    rawLabel?: boolean;
    selected?: boolean;
    passed?: boolean;
    locked?: boolean;
};

/**
 * A single step in the stepper component.
 * Renders either a checkmark (if passed) or a numbered circle (if not passed).
 *
 * @param {stepProps} props - The component props
 * @returns {JSX.Element} A step component with appropriate styling and navigation
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
 * @property {WritableAtom<stepperConfig>} stepperConf - The stepper configuration atom
 * @property {boolean} stepperLocked - Whether the entire stepper is locked
 */
export type stepperProps = {
    stepperConf: WritableAtom<stepperConfig, any, void>;
    stepperLocked: boolean;
};

/**
 * A stepper component that displays a series of steps with navigation capabilities.
 * Steps can be marked as passed, selected, or locked.
 *
 * @param {stepperProps} props - The component props
 * @returns {JSX.Element} A stepper component with connected steps and navigation
 */
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
