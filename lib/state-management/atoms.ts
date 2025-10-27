import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAtomValue, useSetAtom, WritableAtom} from 'jotai';
import {atomWithStorage, createJSONStorage} from 'jotai/utils';
import {useCallback, useMemo} from 'react';

// ----------------------------------------------------------------------------
// Working with local-stored atoms
// ----------------------------------------------------------------------------

/**
 * Creates a Jotai atom that persists its value in AsyncStorage.
 * @template T - The type of the atom's value.
 * @param {string} key - The storage key to use for persistence.
 * @param {T} initialValue - The initial value for the atom.
 * @returns {WritableAtom<T, any, any>} A Jotai atom that persists its value.
 * @category State Management
 */
export function storedAtom<T>(key: string, initialValue: T) {
    return atomWithStorage(
        key,
        initialValue,
        createJSONStorage(() => AsyncStorage),
        {getOnInit: true}, // we prioritize getting the value from the storage rather than eagerly getting the initial value
    );
}

// ----------------------------------------------------------------------------
// Working with collections of atoms
// ----------------------------------------------------------------------------

/**
 * Hook that checks if a predicate function returns true for at least one atom in a list.
 * @template Value - The type of the atoms' values.
 * @param {WritableAtom<Value, any, any>[] } atoms - Array of atoms to check.
 * @param {(value?: Value) => boolean} predicate - Function to test each atom's value.
 * @returns {boolean} True if predicate returns true for at least one atom.
 * @category State Management
 */
export function useCheckSomeAtomValue<Value>(atoms: (WritableAtom<Value, any, any> | undefined)[], predicate: (value?: Value) => boolean): boolean {
    const atomValues = atoms.map(atom => atom && useAtomValue(atom));

    return useMemo(() => {
        return atomValues.some(predicate);
    }, [atomValues, predicate]);
}

/**
 * Hook that checks if a predicate function returns true for all atoms in a list.
 * @template Value - The type of the atoms' values.
 * @param {WritableAtom<Value, any, any>[] } atoms - Array of atoms to check.
 * @param {(value?: Value) => boolean} predicate - Function to test each atom's value.
 * @returns {boolean} True if predicate returns true for all atoms.
 * @category State Management
 */
export function useCheckAllAtomValues<Value>(atoms: (WritableAtom<Value, any, any> | undefined)[], predicate: (value?: Value) => boolean): boolean {
    const atomValues = atoms.map(atom => atom && useAtomValue(atom));

    return useMemo(() => {
        return atomValues.every(predicate);
    }, [atomValues, predicate]);
}

/**
 * Hook that returns an array containing the values of all provided atoms.
 * @template Value - The type of the atoms' values.
 * @param {WritableAtom<Value, any, any>[] } atoms - Array of atoms to get values from.
 * @returns {Value[]} Array of atom values.
 * @category State Management
 */
export function useAllAtomsValues<Value>(atoms: (WritableAtom<Value, any, any> | undefined)[]) {
    return atoms.map(atom => atom && useAtomValue(atom));
}

/**
 * Hook that returns a function to set the same value to all provided atoms.
 * @template Value - The type of the atoms' values.
 * @param {WritableAtom<Value, any, any>[] } atoms - Array of atoms to set values for.
 * @returns {Function} A function that sets the provided value to all atoms.
 * @category State Management
 */
export function useSetAllAtoms<Value>(atoms: (WritableAtom<Value, any, any> | undefined)[]) {
    const setAtoms = atoms.map(atom => atom && useSetAtom(atom));

    const setAllValues = useCallback(
        (newValue: Value) => {
            setAtoms.forEach(setAtom => {
                setAtom && setAtom(newValue);
            });
        },
        [setAtoms],
    );

    return setAllValues;
}
