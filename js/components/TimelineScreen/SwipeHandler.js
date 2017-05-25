import { Animated, PanResponder, InteractionManager } from "react-native";

export default function(timelinescreen) {
	let interacting = false;
	const startInteraction = () => {
		timelinescreen.interacting(true);
		interacting = true;
		console.log("Interaction start");
	};
	const finishInteraction = () => {
		interacting = false;
		console.log("Interaction finish");
	};
	return PanResponder.create({
		onStartShouldSetPanResponder: (evt, gestureState) =>
			!interacting && gestureState.numberActiveTouches == 1,

		onStartShouldSetPanResponderCapture: (evt, gestureState) => false,

		onMoveShouldSetPanResponder: (evt, gestureState) =>
			!interacting && gestureState.numberActiveTouches == 1,

		onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,

		onPanResponderGrant: (evt, gestureState) => startInteraction(),

		onPanResponderMove: Animated.event([
			null,
			{ dx: timelinescreen.state.swipe }
		]),

		onPanResponderTerminationRequest: (evt, gestureState) => true,

		onPanResponderRelease: (evt, gestureState) => {
			timelinescreen.interacting(false);

			// Swipe to next day
			if (gestureState.dx < -(timelinescreen.state.width / 3)) {
				Animated.spring(timelinescreen.state.swipe, {
					toValue: -timelinescreen.state.width
				}).start();
				setTimeout(() => {
					finishInteraction();
					timelinescreen.next();
				}, 250);
				// Swipe to previous day
			} else if (gestureState.dx > timelinescreen.state.width / 3) {
				Animated.spring(timelinescreen.state.swipe, {
					toValue: timelinescreen.state.width
				}).start();
				setTimeout(() => {
					finishInteraction();
					timelinescreen.previous();
				}, 250);
				// Spring back to same day
			} else {
				Animated.spring(timelinescreen.state.swipe, {
					toValue: 0
				}).start();
				setTimeout(() => {
					finishInteraction();
				}, 250);
			}
		},

		onPanResponderTerminate: (evt, gestureState) =>
			timelinescreen.interacting(false),

		onShouldBlockNativeResponder: (evt, gestureState) => true
	});
}
