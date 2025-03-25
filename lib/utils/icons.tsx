import Svg, { Path } from "react-native-svg";

export function CloseIcon({ size = 16, color = "grey" }) {
	return (
		<Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
			<Path
				d="M13.5893 0.458984L7.93196 6.11498L2.27596 0.458984L0.390625 2.34432L6.04662 8.00032L0.390625 13.6563L2.27596 15.5417L7.93196 9.88565L13.5893 15.5417L15.4746 13.6563L9.81863 8.00032L15.4746 2.34432L13.5893 0.458984Z"
				fill={color}
			/>
		</Svg>
	);
}

export function BluetoothIcon({ width = 15, height = 20, color = "white" }) {
	return (
		<Svg width={width} height={height} viewBox="0 0 15 20" fill="none">
			<Path
				d="M0.409912 14.1921L1.58991 15.8071L5.99991 12.5841V19.0001C5.99992 19.1797 6.04829 19.356 6.13996 19.5104C6.23163 19.6649 6.3632 19.7918 6.52086 19.8778C6.67852 19.9639 6.85644 20.0059 7.03593 19.9994C7.21542 19.9929 7.38986 19.9383 7.54091 19.8411L14.5409 15.3411C14.6778 15.2534 14.7912 15.1337 14.8713 14.9923C14.9514 14.8508 14.9958 14.692 15.0007 14.5295C15.0055 14.367 14.9706 14.2059 14.899 14.0599C14.8274 13.914 14.7213 13.7877 14.5899 13.6921L9.53691 10.0001L14.5899 6.30808C14.7209 6.21205 14.8266 6.0856 14.8979 5.93964C14.9692 5.79368 15.0039 5.63257 14.9991 5.47021C14.9943 5.30784 14.95 5.14908 14.8702 5.0076C14.7904 4.86613 14.6774 4.74617 14.5409 4.65808L7.54091 0.158085C7.38969 0.0609036 7.21512 0.00619067 7.03548 -0.000319129C6.85585 -0.00682893 6.67777 0.0351042 6.51991 0.121085C6.19991 0.297085 5.99991 0.634085 5.99991 1.00008V7.41608L1.58991 4.19208L0.409912 5.80808L5.99991 9.89308V10.1081L0.409912 14.1921ZM7.99991 2.83208L12.2319 5.55308L7.99991 8.64608V2.83208ZM7.99991 11.3541L12.2319 14.4471L7.99991 17.1681V11.3541Z"
				fill={color}
			/>
		</Svg>
	);
}

export function EraseIcon({ size = 16, color = "grey" }) {
	return (
		<Svg width={size} height={size} viewBox="0 0 8 16" fill="none" strokeWidth={2}>
			<Path d="M8 0L0 8L8 16" stroke={color}></Path>
		</Svg>
	);
}

export function SettingsIcon({ size = 24, color = "grey" }) {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={2}>
			<Path
				d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
				stroke={color}
			></Path>
			<Path
				d="M19.6224 10.3954L18.5247 7.7448L20 6L18 4L16.2647 5.48295L13.5578 4.36974L12.9353 2H10.981L10.3491 4.40113L7.70441 5.51596L6 4L4 6L5.45337 7.78885L4.3725 10.4463L2 11V13L4.40111 13.6555L5.51575 16.2997L4 18L6 20L7.79116 18.5403L10.397 19.6123L11 22H13L13.6045 19.6132L16.2551 18.5155C16.6969 18.8313 18 20 18 20L20 18L18.5159 16.2494L19.6139 13.598L21.9999 12.9772L22 11L19.6224 10.3954Z"
				stroke={color}
			></Path>
		</Svg>
	);
}

export function WorldIcon({ size = 24, color = "black" }) {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={2}>
			<Path
				d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12Z"
				stroke={color}
			></Path>
			<Path
				d="M13 2.04932C13 2.04932 16 5.99994 16 11.9999C16 17.9999 13 21.9506 13 21.9506"
				stroke={color}
			></Path>
			<Path
				d="M11 21.9506C11 21.9506 8 17.9999 8 11.9999C8 5.99994 11 2.04932 11 2.04932"
				stroke={color}
			></Path>
			<Path d="M2.62964 15.5H21.3704" stroke={color}></Path>
			<Path d="M2.62964 8.5H21.3704" stroke={color}></Path>
		</Svg>
	);
}
