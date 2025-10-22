import * as SwitchPrimitives from '@rn-primitives/switch';
import {cn} from '../base';

function Switch({className, ...props}: SwitchPrimitives.RootProps & React.RefAttributes<SwitchPrimitives.RootRef>) {
    return (
        <SwitchPrimitives.Root
            className={cn(
                'flex h-8 w-[44px] shrink-0 flex-row items-center rounded-full border border-transparent shadow-sm shadow-black/5',
                props.checked ? 'bg-primary' : 'bg-input',
                props.disabled && 'opacity-50',
                className,
            )}
            {...props}>
            <SwitchPrimitives.Thumb
                className={cn('bg-background size-7 rounded-full transition-transform', props.checked ? 'translate-x-5' : 'translate-x-0')}
            />
        </SwitchPrimitives.Root>
    );
}

export {Switch};
