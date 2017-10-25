import { Animated } from "react-native";

import { createResponder } from "react-native-gesture-responder";

export default function(timelineScreen) {
	let pinchBasis = 0;
	let lastPinch = 1;
	return createResponder({
		onStartShouldSetResponder: (evt, gestureState) =>
			!timelineScreen.swiping && evt.nativeEvent.touches.length == 2,
		onStartShouldSetResponderCapture: (evt, gestureState) => false,
		onMoveShouldSetResponder: (evt, gestureState) =>
			!timelineScreen.swiping && evt.nativeEvent.touches.length == 2,
		onMoveShouldSetResponderCapture: (evt, gestureState) => false,
		onResponderGrant: (evt, gestureState) => {
			pinchBasis = 0;
			timelineScreen.gestureGrant();
		},
		onResponderMove: (evt, gestureState) => {
			if (gestureState.pinch) {
				if (!pinchBasis) pinchBasis = gestureState.pinch;
				lastPinch = gestureState.pinch / pinchBasis;
			}
			timelineScreen.gestureMove(lastPinch, gestureState.dx, gestureState.vx);
		},
		onResponderTerminationRequest: (evt, gestureState) => true,
		onResponderRelease: (evt, gestureState) =>
			timelineScreen.gestureEnd(lastPinch, gestureState.dx, gestureState.vx),
		onResponderTerminate: (evt, gestureState) => {},
		onResponderSingleTapConfirmed: (evt, gestureState) => {},
		moveThreshold: 2,
		debug: false
	});
}
