import {RESET, useFieldValue, useInputField, type FieldAtom} from 'form-atoms';
import {atom, Atom, useAtomValue} from 'jotai';
import {LucideIcon} from 'lucide-react-native';
import {useCallback, useMemo} from 'react';

/**
 * Type definition for a field configuration option.
 * @property {number} value - The value of the option.
 * @property {string} label - The label of the option.
 */
export type FieldConfigOption = {value: number; label: string};

/**
 * Type definition for additional information about a field configuration option.
 * @property {Atom<boolean>} [disabled] - An atom that determines if the option is disabled.
 * @property {LucideIcon} [icon] - An icon associated with the option.
 */
export type FieldConfigOptionInfos = {disabled?: Atom<boolean>; icon?: LucideIcon};

/**
 * Type definition for a field value error.
 * @property {string} msg - The error message.
 * @property {any} [param] - Additional parameters for the error.
 */
export type FieldValueError = {msg: string; param?: any};

/**
 * Type definition for a field configuration.
 * @property {FieldAtom<Value>} fieldAtom - The embedded field to enrich with additional functionality.
 * @property {() => boolean} [visible] - Custom hook to condition the rendering of the field.
 * @property {() => boolean} [disabled] - Custom hook to provide a dynamic value for the `disabled` tag.
 * @property {(() => void)[]} [effects] - Array of useEffect functions to apply.
 * @property {number} [min] - A minimum value for a numeric field; a minimum length for a string field.
 * @property {number} [max] - A maximum value for a numeric field; a maximum length for a string field.
 * @property {number} [step] - A step value for a numeric field.
 * @property {() => boolean} [decrementDisabled] - Custom hook to disable a control decreasing the field's value.
 * @property {() => boolean} [incrementDisabled] - Custom hook to disable a control increasing the field's value.
 * @property {FieldConfigOption[]} [options] - Options for a select field.
 * @property {number[]} [optionsOnly] - Amongst the given options, which values to allow.
 * @property {Map<number, FieldConfigOptionInfos>} [optionsInfos] - Configuring additional behaviours on options passed to a select field.
 * @property {boolean | (() => boolean)} [mandatory] - Indicates if a non-empty value is expected.
 * @property {() => null | FieldValueError} [valid] - Custom hook to provide a way to tell if the field's value is valid.
 */
export type FieldConfig<Value> = {
    fieldAtom: FieldAtom<Value>;
    visible?: () => boolean;
    disabled?: () => boolean;
    effects?: (() => void)[];
    min?: number | undefined;
    max?: number | undefined;
    step?: number | undefined;
    decrementDisabled?: () => boolean;
    incrementDisabled?: () => boolean;
    options?: FieldConfigOption[];
    optionsOnly?: number[];
    optionsInfos?: Map<number, FieldConfigOptionInfos>;
    mandatory?: boolean | (() => boolean);
    valid?: () => null | FieldValueError;
};

/**
 * Extension of FieldAtom to add some capabilities, like the control of the `disable` tag.
 */
export type FieldConfigAtom<Value> = Atom<FieldConfig<Value>>;

/**
 * Creates a field configuration atom from the provided configuration.
 * @param {FieldConfig<Value>} config - The field configuration.
 * @returns {FieldConfigAtom<Value>} The field configuration atom.
 */
export function fieldConfigAtom<Value>(config: FieldConfig<Value>): FieldConfigAtom<Value> {
    return atom({
        fieldAtom: config.fieldAtom,
        visible: config.visible,
        disabled: config.disabled,
        effects: config.effects,
        min: config.min,
        max: config.max,
        step: config.step,
        decrementDisabled: config.decrementDisabled,
        incrementDisabled: config.incrementDisabled,
        options: config.options,
        optionsOnly: config.optionsOnly,
        optionsInfos: config.optionsInfos,
        mandatory: config.mandatory,
        valid: config.valid,
    });
}

/**
 * Hook to check if a particular field is valid, using the field's configured 'valid' custom hook,
 * or the field's configured basic constraints. Returns null if valid, the validation error otherwise.
 * @param {FieldConfigAtom<Value>} fieldConfAtom - The field configuration atom.
 * @returns {null | FieldValueError} The validation error, or null if valid.
 */
export function getFieldValidationError<Value>(fieldConfAtom: FieldConfigAtom<Value>) {
    const fieldConfig = useAtomValue(fieldConfAtom);
    const validError = fieldConfig.valid && fieldConfig.valid();
    const value = useFieldValue(fieldConfig.fieldAtom) as Value;
    const mandatory = fieldConfig.mandatory && (typeof fieldConfig.mandatory === 'function' ? fieldConfig.mandatory() : fieldConfig.mandatory);

    // checking the custom validation hook first (if there's one), since the computation's been done anyway!
    if (validError) {
        return validError;
    }

    if (typeof value === 'number') {
        const min = fieldConfig.min || 0;
        const max = fieldConfig.max || 0;
        // special case of enums
        if (fieldConfig.options) {
            const options = fieldConfig.optionsOnly ? fieldConfig.optionsOnly : fieldConfig.options.map(option => option.value);
            if (value) {
                if (!options.some(val => val === value)) {
                    return {msg: 'This value is not allowed', param: min};
                }
            } else if (mandatory) {
                return {msg: 'A value must be provided here'};
            }
        } else {
            //TODO "normal" numbers
        }
    } else if (typeof value === 'string') {
        const min = fieldConfig.min || 0;
        const max = fieldConfig.max || 0;
        if (min > 0 && value.length > 0 && value.length < min) {
            return {msg: 'Minimum required length not reached', param: min};
        }
        if (max > 0 && value.length > 0 && value.length > max) {
            return {msg: 'Maximum required length exceeded', param: max};
        }
        if (mandatory && value.length === 0) {
            return {msg: 'A value must be provided here'};
        }
    } else {
        if (mandatory && !value) {
            return {msg: 'A value must be provided here'};
        }
    }

    return null;
}

/**
 * Hook to get the value of a form field.
 * @param {FieldConfigAtom<Value>} conf - The field configuration atom.
 * @returns {Value} The value of the form field.
 */
export function useFormFieldValue<Value>(conf: FieldConfigAtom<Value>) {
    const fieldConfig = useAtomValue(conf);
    const value = useFieldValue(fieldConfig.fieldAtom);
    return value;
}

/**
 * Hook to set the value of a form field.
 * @param {FieldConfigAtom<Value>} conf - The field configuration atom.
 * @returns {Function} A function to set the value of the form field.
 */
export function useSetFormField<Value>(conf: FieldConfigAtom<Value>) {
    // TODO : patch request to push the data into the cloud?
    const fieldConfig = useAtomValue(conf);
    const field = useInputField(fieldConfig.fieldAtom);
    return field.actions.setValue;
}

/**
 * Hook to get and set the value of a form field, similar to useState.
 * @param {FieldConfigAtom<Value>} conf - The field configuration atom.
 * @returns {[Value, Function]} A tuple containing the value and a function to set the value.
 */
export function useFormField<Value>(conf: FieldConfigAtom<Value>): [Value, (value: typeof RESET | Value | ((prev: Value) => Value)) => void] {
    const fieldConfig = useAtomValue(conf);
    const field = useInputField(fieldConfig.fieldAtom);
    return [field.state.value, field.actions.setValue];
}

/**
 * Display modes for form fields.
 */
export type fieldDisplayMode =
    | 'input' // when a field is displayed in a way that allows to modify its value
    | 'sheet' // when a field is displayed as read-only in a sheet
    | 'report'; //  when a field is displayed as read-only in a report

/**
 * Hook to check that a predicate function returns true for at least 1 form field of the given list.
 * @param {FieldConfigAtom<Value>[]} configs - The list of field configuration atoms.
 * @param {(value: Value) => boolean} predicate - The predicate function to check.
 * @returns {boolean} True if the predicate returns true for at least one field.
 */
export function useCheckSomeFormFieldValue<Value>(configs: FieldConfigAtom<Value>[], predicate: (value: Value) => boolean): boolean {
    const atomValues = configs.map(conf => useFormFieldValue(conf));

    return useMemo(() => {
        return atomValues.some(predicate);
    }, [atomValues, predicate]);
}

/**
 * Hook to check that a predicate function returns true for all the form fields of the given list.
 * @param {FieldConfigAtom<Value>[]} configs - The list of field configuration atoms.
 * @param {(value: Value) => boolean} predicate - The predicate function to check.
 * @returns {boolean} True if the predicate returns true for all fields.
 */
export function useCheckAllFormFieldValues<Value>(configs: FieldConfigAtom<Value>[], predicate: (value: Value) => boolean): boolean {
    const atomValues = configs.map(conf => useFormFieldValue(conf));

    return useMemo(() => {
        return atomValues.every(predicate);
    }, [atomValues, predicate]);
}

/**
 * Hook to get an array with all the given form fields' values.
 * @param {FieldConfigAtom<Value>[]} configs - The list of field configuration atoms.
 * @returns {Value[]} An array of form field values.
 */
export function useAllFormFieldsValues<Value>(configs: FieldConfigAtom<Value>[]) {
    return configs.map(conf => useFormFieldValue(conf));
}

/**
 * Hook to set a value to all the given form fields at once.
 * @param {FieldConfigAtom<Value>[]} configs - The list of field configuration atoms.
 * @returns {Function} A function to set the value of all form fields.
 */
export function useSetAllFormFields<Value>(configs: FieldConfigAtom<Value>[]) {
    const setAtoms = configs.map(atom => useSetFormField(atom));

    const setAllValues = useCallback(
        (newValue: Value) => {
            setAtoms.forEach(setAtom => {
                setAtom(newValue);
            });
        },
        [setAtoms],
    );

    return setAllValues;
}
