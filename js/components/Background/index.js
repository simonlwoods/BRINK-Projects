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
import Settings from "./../Settings";

import theme from "./../../themes/base-theme.js";

import dismiss from "./dismiss";

class Background extends Component {
	render() {
		const { width, height } = Dimensions.get("window");

		const dismissSettings = dismiss(this.props.settingsSlide);
		const dismissImage = dismiss(this.props.imageSlide);

		if (!this.props.src) {
			return (
				<View style={StyleSheet.absoluteFill}>
					{this.props.children}
				</View>
			);
		}
		return (
			<View
				style={{
					...StyleSheet.absoluteFillObject,
					backgroundColor: theme.bgColor
				}}
			>
				<View
					style={{ ...StyleSheet.absoluteFillObject }}
					{...dismissSettings.panHandlers}
				>
					<Settings />
				</View>
				<Animated.View
					style={{
						...StyleSheet.absoluteFillObject,
						top: this.props.settingsSlide,
						height,
						bottom: undefined
					}}
				>
					<View {...dismissImage.panHandlers}>
						<Image
							source={this.props.src}
							resizeMode="cover"
							style={{ width, height }}
						/>
					</View>
					<Animated.View
						style={{
							...StyleSheet.absoluteFillObject,
							top: this.props.imageSlide,
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
					</Animated.View>
				</Animated.View>
			</View>
		);
	}
}

export default Background;
