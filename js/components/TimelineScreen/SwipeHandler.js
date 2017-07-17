import { Animated, PanResponder, InteractionManager } from "react-native";

const moment = require("moment");

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

			let canNext, canPrevious;
			switch (timelinescreen.state.active) {
				case "yearly":
					canNext = false;
					canPrevious = false;
					break;
				case "monthly":
					canNext = moment(timelinescreen.state.currentDate).month() < 11;
					canPrevious = moment(timelinescreen.state.currentDate).month() > 0;
					break;
				case "daily":
					canNext = moment(timelinescreen.state.currentDate).isBefore(
						moment("2007-12-31")
					);
					canPrevious = moment(timelinescreen.state.currentDate).isAfter(
						moment("2007-01-01")
					);
					break;
			}

			console.log(canNext, canPrevious);

			// Swipe to next day
			if (canNext && gestureState.dx < -(timelinescreen.state.width / 3)) {
				Animated.spring(timelinescreen.state.swipe, {
					toValue: -timelinescreen.state.width
				}).start(() => timelinescreen.next());
				setTimeout(() => {
					finishInteraction();
				}, 250);
				// Swipe to previous day
			} else if (
				canPrevious &&
				gestureState.dx > timelinescreen.state.width / 3
			) {
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
