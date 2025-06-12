import {useNavigation, useRoute} from '@react-navigation/native';
import {Stepper, stepperConfig, stepperProps} from '../ui/custom/stepper';
import {ViewWithFooter, viewWithFooterProps} from './ViewWithFooter';
import {useAtom} from 'jotai';

/**
 * Props for the ViewWithStepper component.
 * Extends ViewWithFooter props but removes leftButtonOnPress and rightButtonOnPress,
 * as these are handled by the stepper navigation.
 * @property {() => void} [beforePreviousStep] - Function to call before navigating to the previous step
 * @property {() => void} [beforeNextStep] - Function to call before navigating to the next step
 */
type viewWithStepperProps = Partial<Omit<viewWithFooterProps, 'leftButtonOnPress' | 'rightButtonOnPress'>> &
    stepperProps & {
        beforePreviousStep?: () => void;
        beforeNextStep?: () => void;
    };

/**
 * A view component that combines a stepper with a footer for step navigation.
 * The stepper tracks progress through a series of steps, and the footer provides
 * navigation buttons that automatically handle step transitions.
 *
 * @param {viewWithStepperProps} props - The component props
 * @returns {JSX.Element} A view with integrated stepper and navigation
 */
export function ViewWithStepper({beforePreviousStep, beforeNextStep, stepperConf, stepperLocked, children, ...props}: viewWithStepperProps) {
    const navigation: any = useNavigation();
    const currentRoute = useRoute();
    const [state, setState] = useAtom(stepperConf);
    const currentStep = state.steps.findIndex(step => step.route === currentRoute.name);
    const prevStep = currentStep > 0 && state.steps[currentStep - 1];
    const nextStep = currentStep < state.steps.length - 1 && state.steps[currentStep + 1];

    // we define what happens when the user clicks on the left button, which can be overriden through the props (leftButtonOnPress)
    const goToPreviousStep = () => {
        // running the previous step action, if any
        beforePreviousStep && beforePreviousStep();

        // trying to go to the previous step if there's is one, or the start route if one defined; else going back to the root
        prevStep ? navigation.navigate(prevStep.route) : state.startRoute ? navigation.navigate(state.startRoute) : navigation.popToTop();
    };

    // we define what happens when the user clicks on the right button, which can be overriden through the props (rightButtonOnPress)
    const goToTheNextStep = () => {
        // running the next step action, if any
        beforeNextStep && beforeNextStep();

        // trying to go to the next step if there's is one, or the end route if one defined; else going back to the root
        nextStep ? navigation.navigate(nextStep.route) : state.endRoute ? navigation.navigate(state.endRoute) : navigation.popToTop();

        // keeping track of the max step we've reached
        setState((prevState: stepperConfig) => ({
            ...prevState,
            maxReachedStep: state.maxReachedStep ? Math.max(state.maxReachedStep, currentStep) : currentStep,
        }));
    };

    return (
        <ViewWithFooter leftButtonOnPress={goToPreviousStep} rightButtonOnPress={goToTheNextStep} {...props}>
            <Stepper stepperConf={stepperConf} stepperLocked={stepperLocked} />
            {children}
        </ViewWithFooter>
    );
}
