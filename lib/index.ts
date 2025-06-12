/**
 * Barrel file for the goaldn library. Re-exports UI components, app components, utilities, and styling helpers
 * for convenient imports throughout the application and for external consumers.
 *
 * - UI components: Buttons, checkboxes, enums, carousels, icons, tooltips, steppers, etc.
 * - App components: Avatar, navigation, cards, settings, views, etc.
 * - Utilities: Atoms, BLE, date, fields, hooks, i18n, PDF, settings, etc.
 * - Styling: Theme color helpers
 */
// Base UI components
export {Button, type buttonVariantsType} from './components/ui/custom/button-pimped';
export {CheckboxAtom} from './components/ui/custom/checkbox-atom';
export {CheckboxField} from './components/ui/custom/checkbox-field';
export {EnumAtom} from './components/ui/custom/enum-atom';
export {EnumField} from './components/ui/custom/enum-field';
export {ImageCarousel} from './components/ui/custom/image-carousel';
export {ScaledIcon} from './components/ui/custom/scaled-icon';
export {ScaledTooltip} from './components/ui/custom/scaled-tooltip';
export {SliderField} from './components/ui/custom/slider-field';
export {NewStepperConfig, Stepper, type stepperConfig} from './components/ui/custom/stepper';
export {StringAtom} from './components/ui/custom/string-atom';
export {StringField} from './components/ui/custom/string-field';
export {SwitchAtom} from './components/ui/custom/switch-atom';
export {SwitchField} from './components/ui/custom/switch-field';
export {Tooltip} from './components/ui/custom/tooltip';
export {Txt} from './components/ui/custom/txt';

// App building components
export {Avatar, type AvatarProps} from './components/app/Avatar';
export {BottomView} from './components/app/BottomView';
export {Card} from './components/app/CardBasic';
export {CollapsableCard} from './components/app/CardCollapsable';
export {MainNavigator, ScreenNavigator} from './components/app/navigation/Navigator';
export * from './components/app/navigation/Navigator-options';
export {type MenuProps} from './components/app/navigation/Navigator-utils';
export {Settings} from './components/app/Settings';
export {ViewWithFooter} from './components/app/ViewWithFooter';
export {ViewWithStepper} from './components/app/ViewWithStepper';
export * from './components/misc';

// Utils
export * from './utils/atoms';
export * from './utils/ble';
export * from './utils/cn';
export * from './utils/date';
export * from './utils/fields';
export * from './utils/hooks';
export * from './utils/i18n';
export * from './utils/pdf';
export * from './utils/settings';

// Styling
export {getColors, initThemeColors, type colorsType} from './styles/theme';
