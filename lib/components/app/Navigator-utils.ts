interface menuEntry {
	name: string;
	component: React.ComponentType<any>;
	icon?: (props: { size: number; color: string }) => React.ReactNode;
}

interface menuWindowsConfig {
	logo?: () => React.ReactNode;
}

export interface MenuProps {
	entries: menuEntry[];
	windows?: menuWindowsConfig;
	// menuClass?: string;
	// entryClass?: string;
	// labelClass?: string;
	// activeClass?: string;
	// onEntryClick?: () => void;
}
