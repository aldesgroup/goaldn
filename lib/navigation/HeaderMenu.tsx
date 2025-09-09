import {Pressable, View} from 'react-native';
import {useNavigation, NavigationProp, ParamListBase} from '@react-navigation/native';
import {atom, useAtom} from 'jotai';
import {ChevronDown, ChevronUp, CircleUserRound, LucideIcon} from 'lucide-react-native';
import {cn, Txt} from '../base';
import {getColors} from '../styling';

// Atom to control the visibility of the header menu
const openHeaderMenuAtom = atom(false);

/**
 * A single menu entry. Only one action must be provided:
 *  - navigateTo: a route name to navigate to
 *  - onPress: a function to execute when the entry is pressed
 *  @category Navigation
 */
type HeaderMenuEntry = {
    name: string;
    icon?: LucideIcon;
} & (
    | {
          navigateTo: string;
          onPress?: never;
      }
    | {
          onPress: () => void;
          navigateTo?: never;
      }
);

/**
 * Data for the header menu
 * @property entries - List of menu entries
 * @category Navigation
 */
export type HeaderMenuData = {
    entries: HeaderMenuEntry[];
};

/**
 * Header menu shown on the top right corner of the screen
 * @param props - Component props
 * @param props.menu - Menu data containing list of entries
 * @category Navigation
 */
export function HeaderMenu({menu}: {menu: HeaderMenuData}) {
    // ParamListBase means any route with any params
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const [open, setOpen] = useAtom(openHeaderMenuAtom);

    const handlePress = ({navigateTo, onPress}: HeaderMenuEntry) => {
        setOpen(false);
        if (navigateTo) {
            navigation.navigate(navigateTo);
        } else if (onPress) {
            onPress();
        }
    };

    return (
        <View
            className={cn('border-border absolute right-4 top-2 z-10 flex flex-col rounded-xl border bg-white p-2', !open && 'hidden')}
            // Using elevation to create shadow in Android as Nativewind shadow is not working
            style={{elevation: 6}}>
            {menu.entries.map((entry, index) => (
                <Pressable
                    key={index}
                    onPress={() => handlePress(entry)}
                    className="active:bg-secondary flex flex-row items-center gap-3 rounded-xl p-3">
                    {entry.icon && <entry.icon size={24} color={getColors().foregroundLight} />}
                    <Txt className="text-foreground-light text-lg">{entry.name}</Txt>
                </Pressable>
            ))}
        </View>
    );
}

/**
 * Icon button to trigger the visibility of the header menu
 * @category Navigation
 */
export function HeaderMenuTrigger() {
    const color = getColors().primary;
    const [menuOpen, setMenuOpen] = useAtom(openHeaderMenuAtom);

    return (
        <Pressable className="flex-row gap-2 py-4" onPress={() => setMenuOpen(!menuOpen)}>
            <CircleUserRound color={color} />
            {menuOpen ? <ChevronUp color={color} /> : <ChevronDown color={color} />}
        </Pressable>
    );
}
