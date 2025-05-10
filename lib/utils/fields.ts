import {RESET, useFieldValue, useInputField, type FieldAtom} from 'form-atoms';
import {atom, Atom, useAtomValue} from 'jotai';
import {LucideIcon} from 'lucide-react-native';
import {useCallback, useMemo} from 'react';

export type FieldConfigOption = {value: number; label: string};
export type FieldConfigOptionInfos = {disabled?: Atom<boolean>; icon?: LucideIcon};
export type FieldValueError = {msg: string; param?: any};

export type FieldConfig<Value> = {
    /**
     * The embedded field, which we want to enrich with additional functionality
     */
    fieldAtom: FieldAtom<Value>;

    /**
     * Custom hook to condition the rendering of the field, else nothing (or <></>) is rendered
     */
    visible?: () => boolean;

    /**
     * Custom hook to provide a dynamic value for the `disabled` tag if required
     */
    disabled?: () => boolean;

    /**
     * Array of useEffect functions to apply
     */
    effects?: (() => void)[];

    /**
     * A minimum value, for a numeric field; a minimum length, for a string field
     */
    min?: number | undefined;

    /**
     * A minimum value, for a numeric field; a maximum length, for a string field
     */
    max?: number | undefined;

    /**
     * A step value, for a numeric field
     */
    step?: number | undefined;

    /**
     * Custom hook that can be used to disable a control decreasing the field's value
     */
    decrementDisabled?: () => boolean;

    /**
     * Custom hook that can be used to disable a control increasing the field's value
     */
    incrementDisabled?: () => boolean;

    /**
     * Options, for a select field
     */
    options?: FieldConfigOption[];

    /**
     * Amongst the given #Options, which values to allow; if void, then all the options are allowed
     */
    optionsOnly?: number[];

    /**
     * Configuring additional behaviours on options passed to a select field
     */
    optionsInfos?: Map<number, FieldConfigOptionInfos>;

    /**
     * Indicates if a non-empty value is expected
     */
    mandatory?: boolean | (() => boolean);

    /**
     * Custom hook to provide a way to tell if the field's value is valid, beyond its basic constraints (mandatory, min, max, etc.).
     * The function should return null if no error is found, or an error object.
     */
    valid?: () => null | FieldValueError;
};

/**
 * Extension of https://github.com/form-atoms/form-atoms#FieldAtom to add some capabilities,
 * like the control of the `disable` tag
 */
export type FieldConfigAtom<Value> = Atom<FieldConfig<Value>>;

/**
 *
 * @param config
 * @returns
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

// Hook to check if a particular field is valid, using the field's configured 'valid' custom hook,
// or the field's configured basic constraints. Returns null if valid, the validation error otherwise.
// As any hook, it should be called at the beginning of another hook or component, never condionally!!
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

// This function could have literally been called useFieldConfigFieldAtomValue
// but since we pass to this function the same objects we use in forms, this name is convenient
export function useFormFieldValue<Value>(conf: FieldConfigAtom<Value>) {
    const fieldConfig = useAtomValue(conf);
    const value = useFieldValue(fieldConfig.fieldAtom);
    return value;
}

// This function could have literally been called useFieldConfigSetFieldAtom
// but since we pass to this function the same objects we use in forms, this name is convenient
export function useSetFormField<Value>(conf: FieldConfigAtom<Value>) {
    // TODO : patch request to push the data into the cloud?
    const fieldConfig = useAtomValue(conf);
    const field = useInputField(fieldConfig.fieldAtom);
    return field.actions.setValue;
}

// This function aims at providing the same kind of signature as useState: const [value, setValue] = useFormField(...)
export function useFormField<Value>(conf: FieldConfigAtom<Value>): [Value, (value: typeof RESET | Value | ((prev: Value) => Value)) => void] {
    const fieldConfig = useAtomValue(conf);
    const field = useInputField(fieldConfig.fieldAtom);
    return [field.state.value, field.actions.setValue];
}

// display modes for form fields
export type fieldDisplayMode =
    | 'input' // when a field is displayed in a way that allows to modify its value
    | 'sheet' // when a field is displayed as read-only in a sheet
    | 'report'; //  when a field is displayed as read-only in a report

// This function allows to check that a predicate function returns true for at least 1 form field of the given list
export function useCheckSomeFormFieldValue<Value>(configs: FieldConfigAtom<Value>[], predicate: (value: Value) => boolean): boolean {
    const atomValues = configs.map(conf => useFormFieldValue(conf));

    return useMemo(() => {
        return atomValues.some(predicate);
    }, [atomValues, predicate]);
}

// This function allows to check that a predicate function returns true for all the form fields of the given list
export function useCheckAllFormFieldValues<Value>(configs: FieldConfigAtom<Value>[], predicate: (value: Value) => boolean): boolean {
    const atomValues = configs.map(conf => useFormFieldValue(conf));

    return useMemo(() => {
        return atomValues.every(predicate);
    }, [atomValues, predicate]);
}

// This function returns an array with all the given form fields' values
export function useAllFormFieldsValues<Value>(configs: FieldConfigAtom<Value>[]) {
    return configs.map(conf => useFormFieldValue(conf));
}

// This function returns a function that allows to set a value to all the given form fields at once
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
