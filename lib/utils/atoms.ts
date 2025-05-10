import {Atom, useAtomValue, useSetAtom, WritableAtom} from 'jotai';
import {useCallback, useMemo} from 'react';

// This function allows to check that a predicate function returns true for at least 1 atom of the given list
export function useCheckSomeAtomValue<Value>(atoms: (WritableAtom<Value, any, any> | undefined)[], predicate: (value?: Value) => boolean): boolean {
    const atomValues = atoms.map(conf => conf && useAtomValue(conf));

    return useMemo(() => {
        return atomValues.some(predicate);
    }, [atomValues, predicate]);
}

// This function allows to check that a predicate function returns true for all the atoms of the given list
export function useCheckAllAtomValues<Value>(atoms: (WritableAtom<Value, any, any> | undefined)[], predicate: (value?: Value) => boolean): boolean {
    const atomValues = atoms.map(conf => conf && useAtomValue(conf));

    return useMemo(() => {
        return atomValues.every(predicate);
    }, [atomValues, predicate]);
}

// This function returns an array with all the given atoms' values
export function useAllAtomsValues<Value>(atoms: (WritableAtom<Value, any, any> | undefined)[]) {
    return atoms.map(conf => conf && useAtomValue(conf));
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
