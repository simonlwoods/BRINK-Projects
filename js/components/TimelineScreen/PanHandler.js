import { Animated, PanResponder } from "react-native";

export default function(timelinescreen) {
	return PanResponder.create({
		onStartShouldSetPanResponder: (evt, gestureState) =>
			gestureState.numberActiveTouches == 1,

		onStartShouldSetPanResponderCapture: (evt, gestureState) => false,

		onMoveShouldSetPanResponder: (evt, gestureState) =>
			gestureState.numberActiveTouches == 1,

		onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,

		onPanResponderGrant: (evt, gestureState) =>
			(timelinescreen.panCallback({
				value: gestureState.x0
			}), timelinescreen.interacting(true)),

		onPanResponderMove: Animated.event([
			null,
			{ moveX: timelinescreen.state.pan.x, dy: timelinescreen.state.pan.y }
		]),

		onPanResponderTerminationRequest: (evt, gestureState) => true,

		onPanResponderRelease: (evt, gestureState) =>
			timelinescreen.interacting(false),

		onPanResponderTerminate: (evt, gestureState) =>
			timelinescreen.interacting(false),

		onShouldBlockNativeResponder: (evt, gestureState) => true
	});
}
