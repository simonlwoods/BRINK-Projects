import { Animated } from "react-native";

function getDistance(evt) {
	if (evt.nativeEvent.touches.length !== 2) return 0;

	const touch1 = evt.nativeEvent.touches[0];
	const touch2 = evt.nativeEvent.touches[1];

	const x = touch1.pageX - touch2.pageX;
	const y = touch1.pageY - touch2.pageY;

	return Math.sqrt(x * x + y * y);
}

export default function(animatedZoom, zoomToDate) {
	let startDistance = 0;
	let lastValue = 0;
	return {
		onStartShouldSetResponder: evt => evt.nativeEvent.touches.length == 2,
		onStartShouldSetResponderCapture: evt =>
			evt.nativeEvent.touches.length == 2,
		onMoveShouldSetResponder: evt => evt.nativeEvent.touches.length == 2,
		onMoveShouldSetResponderCapture: evt => evt.nativeEvent.touches.length == 2,
		onResponderGrant: evt => {
			startDistance = getDistance(evt);
			animatedZoom.setValue(1);
		},
		onResponderMove: evt => {
			const distance = getDistance(evt);
			const value = Math.max(
				0.075,
				Math.min(8, Math.pow(distance / startDistance, 2))
			);
			lastValue = value;
			animatedZoom.setValue(value);
		},
		onResponderTerminationRequest: evt => true,
		onResponderRelease: evt => {
			if (lastValue >= 1.2) {
				zoomToDate();
			} else {
				// Spring back to same day
				Animated.spring(animatedZoom, {
					toValue: 1
				}).start();
			}
		},
		onResponderTerminate: evt => {},
		onShouldBlockNativeResponder: evt => {
			return true;
		}
	};
}
