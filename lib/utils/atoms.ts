import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAtomValue, useSetAtom, WritableAtom} from 'jotai';
import {atomWithStorage, createJSONStorage} from 'jotai/utils';
import {useCallback, useMemo} from 'react';

// ----------------------------------------------------------------------------
// Working with local-stored atoms
// ----------------------------------------------------------------------------

export function storedAtom<T>(key: string, defaultValue: T) {
    return atomWithStorage(
        key,
        defaultValue,
        createJSONStorage(() => AsyncStorage),
    );
}

// ----------------------------------------------------------------------------
// Working with collections of atoms
// ----------------------------------------------------------------------------

// This function allows to check that a predicate function returns true for at least 1 atom of the given list
export function useCheckSomeAtomValue<Value>(atoms: (WritableAtom<Value, any, any> | undefined)[], predicate: (value?: Value) => boolean): boolean {
    const atomValues = atoms.map(atom => atom && useAtomValue(atom));

    return useMemo(() => {
        return atomValues.some(predicate);
    }, [atomValues, predicate]);
}

// This function allows to check that a predicate function returns true for all the atoms of the given list
export function useCheckAllAtomValues<Value>(atoms: (WritableAtom<Value, any, any> | undefined)[], predicate: (value?: Value) => boolean): boolean {
    const atomValues = atoms.map(atom => atom && useAtomValue(atom));

    return useMemo(() => {
        return atomValues.every(predicate);
    }, [atomValues, predicate]);
}

// This function returns an array with all the given atoms' values
export function useAllAtomsValues<Value>(atoms: (WritableAtom<Value, any, any> | undefined)[]) {
    return atoms.map(atom => atom && useAtomValue(atom));
}

// This function returns a function that allows to set a value to all the given atoms at once
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
