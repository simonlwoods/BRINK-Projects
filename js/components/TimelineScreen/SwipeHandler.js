import { Animated, PanResponder, InteractionManager } from "react-native";

export default function(timelinescreen) {
	let interacting = false;
	const startInteraction = () => {
		timelinescreen.props.interaction(true);
		interacting = true;
	};
	const finishInteraction = () => {
		interacting = false;
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
			timelinescreen.props.interaction(false);

			// Swipe to next day
			if (gestureState.dx < -(timelinescreen.state.width / 3)) {
				Animated.spring(timelinescreen.state.swipe, {
					toValue: -timelinescreen.state.width
				}).start(() => timelinescreen.next());
				setTimeout(() => {
					finishInteraction();
				}, 250);
				// Swipe to previous day
			} else if (gestureState.dx > timelinescreen.state.width / 3) {
				Animated.spring(timelinescreen.state.swipe, {
					toValue: timelinescreen.state.width
				}).start(() => timelinescreen.previous());
				setTimeout(() => {
					finishInteraction();
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

		onPanResponderTerminate: (evt, gestureState) => {
			timelinescreen.props.interaction(false);
			finishInteraction();
		},

		onShouldBlockNativeResponder: (evt, gestureState) => true
	});
}
