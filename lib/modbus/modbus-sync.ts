import {useCallback, useEffect, useMemo} from 'react';
import {useModbusRegisterRead} from '.';
import {Field, useField, useFieldMeta} from '../forms';
import {RegisterProps} from './modbus-utils';
import {useDateFormatter} from '../utils';

// ------------------------------------------------------------------------------------------------
// Hook to sync a field value from a MODBUS register on freshness
// ------------------------------------------------------------------------------------------------

/**
 * options to describe how we should map a MODBUS value to a value we're about to set into a Field
 *
 * @property {Record<string, string>} [mapValues] - (Optional) How to map the values coming from the MODBUS registry
 * @property {(values: string[]) => Value} [transform] - (Optional) How to transform the register values into a Value to set into the field
 * @property {boolean} [asDate] - (Optional) Should the field be a date string
 */
type FieldRegisterMappingOptions<Value = string> =
    | {asDate?: boolean; mapValues?: never; transform?: never; combine?: never}
    | {asDate?: boolean; mapValues: Record<string, Value>; transform?: never; combine?: never}
    | {asDate?: boolean; mapValues?: never; transform: (value: string) => Value; combine?: never}
    | {asDate?: boolean; mapValues?: never; transform?: never; combine: (values: string[]) => Value};

/**
 * Type for a field-register pair as a tuple, with potential options for transforming the MODBUS values
 *
 * @property {Field<Value>} [fill] - The field where the MODBUS value will be set
 * @property {RegisterProps[]} [with] - MODBUS register properties defining which register to read from
 * @property {Record<string, string>} [mapValues] - (Optional) How to map the values coming from the MODBUS registry
 * @property {(values: string[]) => Value} [transform] - (Optional) How to transform the register values into a Value to set into the field
 * @property {boolean} [asDate] - (Optional) Should the field be a date string?
 *
 * @example
 * ```typescript
 * // Simple mapping without transformation
 * const pair: FieldRegisterMapping<string> = [field, registerProps];
 *
 * // With dictionary mapping
 * const withMapping: FieldRegisterMapping<number> = [
 *   field,
 *   registerProps,
 *   { mapValues: { "0": 0, "1": 1 } }
 * ];
 *
 * // With transform function
 * const withTransform: FieldRegisterMapping<number> = [
 *   field,
 *   registerProps,
 *   { transform: (val) => parseInt(val, 10) }
 * ];
 * ```
 *
 * @category MODBUS
 */
export type FieldRegisterMapping<Value> = {
    fill: Field<Value>;
    with: RegisterProps[];
} & FieldRegisterMappingOptions<Value>;

/**
 * Transforms a raw MODBUS value according to the provided mapping options
 *
 * @param rawValue - The raw string value from MODBUS register
 * @param options - Optional mapping configuration to transform the raw value
 * @returns The transformed value if options are provided, otherwise returns the raw value unchanged
 *
 * @example
 * ```typescript
 * // No transformation
 * transform("42"); // returns "42"
 *
 * // With dictionary mapping
 * transform("ON", { mapValues: { "ON": true, "OFF": false } }); // returns true
 *
 * // With transform function
 * transform("42", { transform: (v) => parseInt(v, 10) }); // returns 42
 * ```
 *
 * @category MODBUS
 */
function applyMappingOptions<Value>(
    registerRawValues: string[],
    mapValues?: Record<string, Value>,
    transform?: (value: string) => Value,
    combine?: (values: string[]) => Value,
): Value {
    // First we apply a simple mapping if we have specified one and a single value
    if (registerRawValues.length === 1) {
        if (mapValues) {
            return mapValues[registerRawValues[0]];
        }

        // Apply a transformation if required
        if (transform) {
            return transform(registerRawValues[0]);
        }
    } else if (combine) {
        return combine(registerRawValues);
    }

    // By default, we join the register values, or return it if it's a single value; this should work only if type Value = string
    return registerRawValues.length > 1 ? (registerRawValues.join() as Value) : (registerRawValues[0] as Value);
}

/**
 * Update a field value from a MODBUS holding register,
 * but only if the field has not been modified by the user yet.
 * Returns the MODBUS loading state to let UIs reflect progress.
 * @category Forms Utils
 * @param {FieldRegisterMapping<Value>} mapping - The target form field to sync into.
 * @returns {{ sync: (verbose?: boolean | undefined) => Promise<string | null>, loading: boolean, readError: string | null}} Object with loading flag, a refresh function and last read error.
 */
export function useSyncFieldFromRegister<Value>(mapping: FieldRegisterMapping<Value>): {
    sync: (verbose?: boolean) => Promise<(string | null)[]>;
    loading: boolean;
    readError: string | null;
} {
    // --- props
    const field = mapping.fill;
    const registers = mapping.with;

    // --- utils
    const formatDate = useDateFormatter();

    // --- shared state: form field, and the associated state
    const [fieldValue, setFieldValue] = useField(field);
    const [{lastModified, lastSyncedVal}, setNewSyncedVal] = useFieldMeta(field);

    // --- shared state: MODBUS register values

    // using the reading hook for each register
    const hookResults = registers.map(register => useModbusRegisterRead(register));

    // function to get the value for each register
    const sync = useCallback(
        async (verbose?: boolean) => {
            return await Promise.all(hookResults.map(hookResult => hookResult.get(verbose)));
        },
        [hookResults],
    );

    // the values retrieved
    const registerValues = useMemo(() => hookResults.map(hookResult => hookResult.val), [sync]);

    // do we still have 1 undefined value?
    const regValuesUndef = useMemo(() => registerValues.some(regValue => regValue === undefined), [registerValues]);

    // building a single sync value if all the values are defined
    let syncedVal = regValuesUndef
        ? undefined
        : applyMappingOptions(registerValues as string[], mapping.mapValues, mapping.transform, mapping.combine);

    // special transformations, if needed
    if (syncedVal && mapping.asDate) {
        syncedVal = formatDate(new Date(syncedVal.toString())) as Value;
    }

    // --- effects

    // reacting to the sync value
    useEffect(() => {
        // no new value (yet) => no action
        if (syncedVal === undefined) return;

        // unchanged value => no action; except keeping track of the last synced val for next time
        if (fieldValue === syncedVal) return setNewSyncedVal(syncedVal);

        // if there is no last modified date, or the synced value has changed, we use it
        if (!lastModified || syncedVal !== lastSyncedVal) {
            setFieldValue(syncedVal);
            setNewSyncedVal(syncedVal);
        }
    }, [syncedVal]);

    // stuff we'll return too: the loading state, and the first found read error
    const loading = useMemo(() => hookResults.some(hookResult => hookResult.loading), [sync]);
    const readError = useMemo(() => {
        const registerWithError = hookResults.find(hookResult => hookResult.readError);
        return registerWithError?.readError || null;
    }, [sync]);

    // --- returning
    return {sync, loading, readError};
}

// ------------------------------------------------------------------------------------------------
// Batch hook to sync multiple field values from MODBUS registers
// ------------------------------------------------------------------------------------------------

/**
 * Batch sync multiple field values from MODBUS holding registers,
 * but only if the field has not been modified by the user yet.
 * Returns aggregated loading state and the first error found.
 * @category Forms Utils
 * @param {FieldRegisterMapping<Value>[]} pairs - Array of field-register pairs to sync.
 * @returns {{ updateAll: (verbose?: boolean | undefined) => Promise<void>, loading: boolean, readError: string | null}} Object with batch update function, loading flag and first error.
 */
export function useSyncFieldsFromRegisters(mappings: FieldRegisterMapping<any>[]): {
    syncAll: (verbose?: boolean) => Promise<void>;
    loading: boolean;
    readError: string | null;
} {
    // Use the single hook for each pair
    const hookResults = mappings.map(mapping => useSyncFieldFromRegister(mapping));

    // Aggregate loading state - true if any register is loading
    const loading = useMemo(() => hookResults.some(result => result.loading), [hookResults]);

    // Find first error
    const readError = useMemo(() => {
        const firstError = hookResults.find(result => result.readError);
        return firstError?.readError || null;
    }, [hookResults]);

    // Batch update function that updates all registers
    const syncAll = useCallback(
        async (verbose?: boolean) => {
            const updatePromises = hookResults.map(result => result.sync(verbose));
            await Promise.all(updatePromises);
        },
        [hookResults],
    );

    return {syncAll, loading, readError};
}
