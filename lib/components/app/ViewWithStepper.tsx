import {useNavigation, useRoute} from '@react-navigation/native';
import {Stepper, stepperConfig, stepperProps} from '../ui/custom/stepper';
import {ViewWithFooter, viewWithFooterProps} from './ViewWithFooter';
import {useAtom} from 'jotai';

// For this component, we can use the props from the view with footer,
// except we remove the leftButtonOnPress & rightButtonOnPress props,
// since these actions will completely be driven by the stepper
type viewWithStepperProps = Partial<Omit<viewWithFooterProps, 'leftButtonOnPress' | 'rightButtonOnPress'>> & stepperProps;

// A scrollable view with a footer integrated with a stepper
export function ViewWithStepper({stepperConf, stepperLocked, children, ...props}: viewWithStepperProps) {
    const navigation: any = useNavigation();
    const currentRoute = useRoute();
    const [state, setState] = useAtom(stepperConf);
    const currentStep = state.steps.findIndex(step => step.route === currentRoute.name);
    const prevStep = currentStep > 0 && state.steps[currentStep - 1];
    const nextStep = currentStep < state.steps.length - 1 && state.steps[currentStep + 1];

    // we define what happens when the user clicks on the left button, which can be overriden through the props (leftButtonOnPress)
    const goToPreviousStep = () => {
        // trying to go to the previous step if there's is one, or the start route if one defined; else going back to the root
        prevStep ? navigation.navigate(prevStep.route) : state.startRoute ? navigation.navigate(state.startRoute) : navigation.popToTop();
    };

    // we define what happens when the user clicks on the right button, which can be overriden through the props (rightButtonOnPress)
    const goToTheNextStep = () => {
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
