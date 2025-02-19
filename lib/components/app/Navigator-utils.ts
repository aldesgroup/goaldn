interface menuEntry {
	name: string;
	component: React.ComponentType<any>;
	icon?: (props: { size: number; color: string }) => React.ReactNode;
}

export interface MenuProps {
	entries: menuEntry[];
	// menuClass?: string;
	// entryClass?: string;
	// labelClass?: string;
	// activeClass?: string;
	// onEntryClick?: () => void;
}
