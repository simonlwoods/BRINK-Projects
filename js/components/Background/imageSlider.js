import { Animated, Dimensions, Easing, PanResponder } from "react-native";
import decay from "./decay";
Animated.decayToValue = decay;

const moment = require("moment");

export default function(animation) {
	let start;
	let moving = false;

	return PanResponder.create({
		onStartShouldSetPanResponder: (evt, gestureState) => !moving,
		onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
		onMoveShouldSetPanResponder: (evt, gestureState) => !moving,
		onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,
		onPanResponderGrant: (evt, gestureState) => {
			moving = true;
			animation.extractOffset();
			start = moment();
		},
		onPanResponderMove: Animated.event([null, { dy: animation }]),
		onPanResponderTerminationRequest: (evt, gestureState) => true,
		onPanResponderRelease: (evt, gestureState) => {
			if (gestureState.dy < -50 && gestureState.vy < 0) {
				const { height } = Dimensions.get("window");
				Animated.decayToValue(animation, {
					// coast to a stop
					velocity: gestureState.vy, // velocity from gesture release
					toValue: -height
				}).start(() => {
					moving = false;
				});
			} else {
				const end = moment();
				if (end.diff(start) > 500) {
					Animated.timing(animation, {
						toValue: 0,
						easing: Easing.spring,
						duration: 250
					}).start(() => {
						moving = false;
					});
				} else {
					Animated.sequence([
						Animated.timing(animation, {
							toValue: -50,
							easing: Easing.ease,
							duration: 100
						}),
						Animated.timing(animation, {
							toValue: 0,
							easing: Easing.ease,
							duration: 250
						})
					]).start(() => {
						moving = false;
					});
				}
			}
		},
		onPanResponderTerminate: (evt, gestureState) => {
			Animated.timing(animation, {
				toValue: 0,
				easing: Easing.spring,
				duration: 250
			}).start(() => {
				moving = false;
			});
		},
		onShouldBlockNativeResponder: (evt, gestureState) => true
	});
}
