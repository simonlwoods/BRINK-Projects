import { Animated } from "react-native";

import { createResponder } from "react-native-gesture-responder";

export default function(timelineScreen) {
	let pinchBasis = 0;
	let lastPinch = 0;
	return createResponder({
		onStartShouldSetResponder: (evt, gestureState) =>
			evt.nativeEvent.touches.length == 2,
		onStartShouldSetResponderCapture: (evt, gestureState) => false,
		onMoveShouldSetResponder: (evt, gestureState) =>
			evt.nativeEvent.touches.length == 2,
		onMoveShouldSetResponderCapture: (evt, gestureState) => false,
		onResponderGrant: (evt, gestureState) => {
			pinchBasis = 0;
			timelineScreen.resetPinch();
			timelineScreen.interaction(true);
		},
		onResponderMove: (evt, gestureState) => {
			if (gestureState.pinch && !pinchBasis) pinchBasis;
			if (gestureState.pinch) {
				if (!pinchBasis) pinchBasis = gestureState.pinch;
				lastPinch = gestureState.pinch / pinchBasis;
				timelineScreen.pinchMove(lastPinch);
			}
			timelineScreen.swipeMove(gestureState.dx);
		},
		onResponderTerminationRequest: (evt, gestureState) => true,
		onResponderRelease: (evt, gestureState) => {
			timelineScreen.pinchRelease(lastPinch);
			timelineScreen.swipeRelease(gestureState.dx, gestureState.vx);
			timelineScreen.interaction(false);
		},
		onResponderTerminate: (evt, gestureState) => {},
		onResponderSingleTapConfirmed: (evt, gestureState) => {},
		moveThreshold: 2,
		debug: false
	});
}
