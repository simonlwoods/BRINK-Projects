import React, { Component } from "react";
import {
	Animated,
	Dimensions,
	Easing,
	Image,
	PanResponder,
	StyleSheet,
	View
} from "react-native";
import { BlurView } from "expo";

import { Text } from "./../../components";

const moment = require("moment");

Animated.decayToValue = (value, { velocity, toValue }) => {
	const distance = toValue - value._value;
	const duration = Math.min(2 * distance / velocity, 750);
	return Animated.timing(value, {
		toValue,
		duration,
		easing: Easing.out(Easing.ease)
	});
};

class Background extends Component {
	constructor(props) {
		super(props);
		this.state = {
			slide: new Animated.Value(0)
		};
		this.open = false;
	}

	componentWillMount() {
		let start;
		this._panResponder = PanResponder.create({
			onStartShouldSetPanResponder: (evt, gestureState) => true,
			onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
			onMoveShouldSetPanResponder: (evt, gestureState) => true,
			onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
			onPanResponderGrant: (evt, gestureState) => {
				this.state.slide.extractOffset();
				start = moment();
			},
			onPanResponderMove: Animated.event([null, { dy: this.state.slide }]),
			onPanResponderTerminationRequest: (evt, gestureState) => true,
			onPanResponderRelease: (evt, gestureState) => {
				if (this.open) {
					if (gestureState.dy > 50 && gestureState.vy > 0) {
						const { height } = Dimensions.get("window");
						Animated.decayToValue(this.state.slide, {
							// coast to a stop
							velocity: gestureState.vy, // velocity from gesture release
							toValue: height - 50
						}).start(() => {
							this.open = false;
						});
					} else {
						const end = moment();
						if (end.diff(start) > 500) {
							Animated.timing(this.state.slide, {
								toValue: 0,
								easing: Easing.spring,
								duration: 250
							}).start();
						} else {
							Animated.sequence([
								Animated.timing(this.state.slide, {
									toValue: 50,
									easing: Easing.ease,
									duration: 100
								}),
								Animated.timing(this.state.slide, {
									toValue: 0,
									easing: Easing.ease,
									duration: 250
								})
							]).start();
						}
					}
				} else {
					if (gestureState.dy < -50 && gestureState.vy < 0) {
						const { height } = Dimensions.get("window");
						Animated.decayToValue(this.state.slide, {
							// coast to a stop
							velocity: gestureState.vy, // velocity from gesture release
							toValue: -height + 50
						}).start(() => {
							this.open = true;
						});
					} else {
						const end = moment();
						if (end.diff(start) > 500) {
							Animated.timing(this.state.slide, {
								toValue: 0,
								easing: Easing.spring,
								duration: 250
							}).start();
						} else {
							Animated.sequence([
								Animated.timing(this.state.slide, {
									toValue: -50,
									easing: Easing.ease,
									duration: 100
								}),
								Animated.timing(this.state.slide, {
									toValue: 0,
									easing: Easing.ease,
									duration: 250
								})
							]).start();
						}
					}
				}
			},
			onPanResponderTerminate: (evt, gestureState) => {
				Animated.timing(this.state.slide, {
					toValue: 0,
					easing: Easing.spring,
					duration: 250
				}).start();
			},
			onShouldBlockNativeResponder: (evt, gestureState) => true
		});
	}

	render() {
		const { width, height } = Dimensions.get("window");
		return (
			<View style={StyleSheet.absoluteFill}>
				<Image
					source={this.props.src}
					resizeMode="cover"
					style={{ width, height }}
				/>
				<Animated.View
					style={{
						...StyleSheet.absoluteFillObject,
						top: this.state.slide.interpolate({
							inputRange: [-height + 50, 0],
							outputRange: [-height + 50, 0],
							extrapolate: "clamp"
						}),
						height,
						bottom: undefined
					}}
				>
					<BlurView
						tint="dark"
						intensity={90}
						style={StyleSheet.absoluteFill}
					/>
					{this.props.children}
					{this.props.src
						? <View
								style={{
									backgroundColor: "transparent",
									...StyleSheet.absoluteFillObject,
									top: undefined,
									height: 50
								}}
								{...this._panResponder.panHandlers}
							>
								<Text style={{ backgroundColor: "transparent" }}>
									Halley Base
								</Text>
							</View>
						: null}
				</Animated.View>
			</View>
		);
	}
}

export default Background;
