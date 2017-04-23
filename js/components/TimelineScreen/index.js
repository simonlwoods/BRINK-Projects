import React, { Component } from "react";
import { Animated, Dimensions, PanResponder } from "react-native";
import { connect } from "react-redux";
import styled from "styled-components/native";

import { Svg } from "expo";
import { Button, Container, Content, Text, View } from "./../../components";

import { setLights } from "./../../actions/bridge";

import dataLoader from "./../../data";
import graphData from "./../../data/graph";

const AnimatedPath = Animated.createAnimatedComponent(Svg.Path);
AnimatedPath.propTypes.style = React.PropTypes.any;

const AnimatedGroup = Animated.createAnimatedComponent(Svg.G);
AnimatedGroup.propTypes.style = React.PropTypes.any;

class TimelineScreen extends Component {
	static propTypes = {
		setLights: React.PropTypes.func
	};

	constructor(props) {
		super(props);

		const { width } = Dimensions.get("window");
		const height = 225;
		const spacing = 2;

		this.state = {
			spacing,
			width,
			height,
			...graphData(
				dataLoader("2007-02-19", "2007-02-21"),
				width * 3,
				height,
				spacing
			),
			x: new Animated.Value(0),
			interacting: new Animated.Value(0),
			anim: new Animated.Value(0),
			pan: new Animated.ValueXY()
		};

		this.lastRequest = new Date(0);
	}

	debounce() {
		const thisRequest = new Date();
		if (thisRequest - this.lastRequest < 100) return false;
		this.lastRequest = thisRequest;
		return true;
	}

	panCallback(value) {
		if (this.debounce()) {
			const data = this.state.dataForXValue(value.value);
			this.props.setLights({
				Y: data.Y,
				xy: [data.x, data.y]
			});
		}
	}

	componentWillMount() {
		this.state.pan.x.addListener(this.panCallback.bind(this));

		this._timelinePanResponder = PanResponder.create({
			onStartShouldSetPanResponder: (evt, gestureState) => true,
			onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
			onMoveShouldSetPanResponder: (evt, gestureState) => true,
			onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

			onPanResponderGrant: (evt, gestureState) => {
				this.panCallback({ value: gestureState.x0 });
				Animated.timing(this.state.interacting, {
					toValue: 1,
					duration: 150
				}).start();
			},
			onPanResponderMove: Animated.event([
				null,
				{ moveX: this.state.pan.x, dy: this.state.pan.y }
			]),
			onPanResponderTerminationRequest: (evt, gestureState) => true,
			onPanResponderRelease: (evt, gestureState) => {
				Animated.timing(this.state.interacting, {
					toValue: 0,
					duration: 150
				}).start();
			},
			onPanResponderTerminate: (evt, gestureState) => {
				Animated.timing(this.state.interacting, {
					toValue: 0,
					duration: 150
				}).start();
			},
			onShouldBlockNativeResponder: (evt, gestureState) => {
				return true;
			}
		});

		this._swipePanResponder = PanResponder.create({
			onStartShouldSetPanResponder: (evt, gestureState) => true,
			onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
			onMoveShouldSetPanResponder: (evt, gestureState) => true,
			onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

			onPanResponderGrant: (evt, gestureState) => {
				this.state.x.extractOffset();
				//this.state.x.setValue(0);
				Animated.timing(this.state.interacting, {
					toValue: 1,
					duration: 150
				}).start();
			},
			onPanResponderMove: Animated.event([null, { dx: this.state.x }]),
			onPanResponderTerminationRequest: (evt, gestureState) => true,
			onPanResponderRelease: (evt, gestureState) => {
				Animated.timing(this.state.interacting, {
					toValue: 0,
					duration: 150
				}).start();
			},
			onPanResponderTerminate: (evt, gestureState) => {
				Animated.timing(this.state.interacting, {
					toValue: 0,
					duration: 150
				}).start();
			},
			onShouldBlockNativeResponder: (evt, gestureState) => {
				return true;
			}
		});
	}

	componentDidMount() {
		Animated.sequence([
			Animated.timing(this.state.anim, { toValue: 0, duration: 500 }),
			Animated.spring(this.state.anim, { toValue: 1, duration: 1000 })
		]).start();
	}

	render() {
		return (
			<Container>
				<Content>
					<View
						{...this._swipePanResponder.panHandlers}
						style={{
							height: 100,
							width: this.state.width
						}}
					/>
					<Animated.View
						style={{
							width: 3 * this.state.width,
							transform: [
								{ scaleY: this.state.anim },
								{ translateX: this.state.x }
							]
						}}
						{...this._timelinePanResponder.panHandlers}
					>
						<Svg height={this.state.height} width={3 * this.state.width}>
							<Svg.Defs>
								{this.state.gradient}
							</Svg.Defs>
							<Svg.Path
								d={this.state.bar}
								stroke="white" //"url(#grad)"
								strokeWidth={this.state.spacing - 1}
								strokeOpacity={0.25}
							/>
						</Svg>
						<Animated.View
							style={{
								position: "absolute",
								top: 0,
								opacity: this.state.interacting
							}}
						>
							<Svg height={this.state.height} width={3 * this.state.width}>
								<Svg.Defs>
									{this.state.gradient}
								</Svg.Defs>
								<Svg.Path
									d={this.state.line}
									stroke="url(#grad)" //"white"
									strokeWidth={1}
									fillOpacity={0}
								/>
							</Svg>
						</Animated.View>
					</Animated.View>
					<View
						{...this._swipePanResponder.panHandlers}
						style={{
							height: 100,
							width: this.state.width
						}}
					/>
				</Content>
			</Container>
		);
	}
}

const mapDispatchToProps = {
	setLights
};

const mapStateToProps = state => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TimelineScreen);
