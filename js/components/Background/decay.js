import { Animated, Easing } from "react-native";

export default function(value, { velocity, toValue }) {
	const distance = toValue - value._value;
	const duration = Math.min(2 * distance / velocity, 750);
	return Animated.timing(value, {
		toValue,
		duration,
		easing: Easing.out(Easing.ease)
	});
}
