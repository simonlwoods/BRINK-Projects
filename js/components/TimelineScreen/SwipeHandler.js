import { Animated, PanResponder, InteractionManager } from "react-native";

export default function(timelinescreen) {
	let interactionHandle = null;
	const startInteraction = () => {
		InteractionManager.setDeadline(50);
		timelinescreen.interacting(true);
	};
	const finishInteraction = handle => {};
	return PanResponder.create({
		onStartShouldSetPanResponder: (evt, gestureState) =>
			gestureState.numberActiveTouches == 1,

		onStartShouldSetPanResponderCapture: (evt, gestureState) => false,

		onMoveShouldSetPanResponder: (evt, gestureState) =>
			gestureState.numberActiveTouches == 1,

		onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,

		onPanResponderGrant: (evt, gestureState) => startInteraction(),

		onPanResponderMove: Animated.event([
			null,
			{ dx: timelinescreen.state.swipe }
		]),

		onPanResponderTerminationRequest: (evt, gestureState) => true,

		onPanResponderRelease: (evt, gestureState) => {
			timelinescreen.interacting(false);
			const handle = interactionHandle;

			// Swipe to next day
			if (gestureState.dx < -(timelinescreen.state.width / 3)) {
				Animated.spring(timelinescreen.state.swipe, {
					toValue: -timelinescreen.state.width
				}).start(() => {
					finishInteraction(handle);
					timelinescreen.next();
				});
				// Swipe to previous day
			} else if (gestureState.dx > timelinescreen.state.width / 3) {
				Animated.spring(timelinescreen.state.swipe, {
					toValue: timelinescreen.state.width
				}).start(() => {
					finishInteraction(handle);
					timelinescreen.previous();
				});
				// Spring back to same day
			} else {
				Animated.spring(timelinescreen.state.swipe, { toValue: 0 }).start(() =>
					finishInteraction(handle)
				);
			}
		},

		onPanResponderTerminate: (evt, gestureState) =>
			timelinescreen.interacting(false),

		onShouldBlockNativeResponder: (evt, gestureState) => true
	});
}
