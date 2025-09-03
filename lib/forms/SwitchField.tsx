import {useFieldValue, useInputField} from 'form-atoms';
import {useAtomValue} from 'jotai';
import {useEffect} from 'react';
import {View} from 'react-native';
import {cn, Txt} from '../base';
import {RefreshableAtom, useRefreshableAtom} from '../state-management';
import {Switch} from '../ui/switch';
import {FieldConfigAtom, useFieldLastModified} from './fields';

/**
 * Props for the SwitchField component.
 * @category Types
 */
export type SwitchFieldProps<T extends FieldConfigAtom<boolean>> = {
    /** Additional CSS classes for the container */
    className?: string;
    /** The label text for the switch */
    label: string;
    /** Additional CSS classes for the label */
    labelClassName?: string;
    /** The field configuration atom */
    field: T;
    /** Additional CSS classes for the switch */
    switchClassName?: string;
    /** Should the field value be synchronized with the value of another atom? */
    syncWith?: RefreshableAtom<Promise<string>, string>;
};

/**
 * A form field component that renders a switch input.
 * The switch state is controlled by the field configuration atom.
 *
 * @param {SwitchFieldProps<confAtom>} props - The component props
 * @returns {JSX.Element} A switch field component with label
 * @category Forms
 */
export function SwitchField<confAtom extends FieldConfigAtom<boolean>>(props: SwitchFieldProps<confAtom>) {
    // --- shared state
    const fieldConfig = useAtomValue(props.field);
    const field = useInputField(fieldConfig.fieldAtom);
    const value = useFieldValue(fieldConfig.fieldAtom);
    const [lastModified, setLastModified] = useFieldLastModified(fieldConfig.stateAtom);
    const disabled = fieldConfig.disabled ? fieldConfig.disabled() : false;
    const visible = fieldConfig.visible ? fieldConfig.visible() : true;

    // --- shared state - syncing with another atom
    const syncAtom = (props.syncWith ?? fieldConfig.syncWith) as RefreshableAtom<Promise<string>, string> | undefined;
    const [syncedVal, syncedValLastModified, refreshSyncedVal, _setSyncedVal] = syncAtom
        ? useRefreshableAtom<Promise<string>, string>(syncAtom)
        : [undefined, undefined, undefined, undefined];
    const syncedValAsBool = (() => {
        if (syncedVal === undefined) return undefined;
        const normalized = String(syncedVal).trim().toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
        if (['false', '0', 'no', 'off'].includes(normalized)) return false;
        return undefined;
    })();

    // --- local state

    // --- effects
    if (fieldConfig.effects) {
        // effects configured on the field
        fieldConfig.effects.map(useEffect => useEffect());
    }

    // refreshing the synced value, if any
    useEffect(() => {
        if (refreshSyncedVal) refreshSyncedVal();
    }, []);

    // if the synced value has changed & is more recent, we set it
    useEffect(() => {
        // there is a synced value, and it's different from the local value
        if (syncedValLastModified && syncedValAsBool !== undefined && syncedValAsBool !== value) {
            // if there is no last modified date, or the synced value is more recent, we set it
            if (!lastModified || syncedValLastModified > lastModified) {
                field.actions.setValue(syncedValAsBool);
                setLastModified(new Date());
            }
        }
    }, [syncedVal, syncedValLastModified]);

    // --- utils

    // --- rendering
    return (
        visible && (
            <View className={cn('flex-row items-center justify-between', props.className)}>
                <Txt className={cn('text-foreground flex-1', props.labelClassName)}>{props.label}</Txt>
                <Switch
                    {...props}
                    key={`switch-${value ? '1' : '0'}`}
                    className={props.switchClassName}
                    disabled={disabled}
                    checked={value}
                    onCheckedChange={val => {
                        field.actions.setValue(val);
                        setLastModified(new Date());
                    }}
                />
            </View>
        )
    );
}
