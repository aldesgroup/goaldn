import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useAtomValue} from 'jotai';
import {useCallback} from 'react';
import {smallScreenAtom} from './settings';

// To use inside a stack navigator screen (current navigation), to hide the tab of the tab navigator (parent)
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
