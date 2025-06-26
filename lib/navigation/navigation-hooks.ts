import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useAtomValue} from 'jotai';
import {useCallback} from 'react';
import {smallScreenAtom} from '../settings';

/**
 * Hook to hide the tab bar in a stack navigator screen.
 * This function is intended to be used inside a stack navigator screen to hide the tab bar of the parent tab navigator.
 * @category Navigation
 */
export function useHideTabBar() {
    const navigation = useNavigation();
    const smallScreen = useAtomValue(smallScreenAtom);

    useFocusEffect(
        useCallback(() => {
            // Hide bottom tabs
            navigation.getParent()?.setOptions({tabBarStyle: {display: 'none'}});

            return () => {
                // Show bottom tabs again when exiting
                navigation.getParent()?.setOptions({tabBarStyle: smallScreen && {height: 70}});
            };
        }, [navigation]),
    );
}
