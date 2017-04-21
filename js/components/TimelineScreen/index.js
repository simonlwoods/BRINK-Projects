import React, { Component } from "react";
import { Animated, Dimensions, PanResponder } from "react-native";
import { connect } from "react-redux";
import styled from "styled-components/native";

import { setLights } from "./../../actions/bridge";

import { Svg } from "expo";

import exampleData from "./../../data/example";
import { csvParse } from "d3-dsv";
import { scaleLinear, scaleTime } from "d3-scale";
import { area } from "d3-shape";
import { extent, bisector } from "d3-array";

import { Button, Container, Content, Text } from "./../../components";

const color = require("color-space");
const huejay = require("huejay");

var { height, width } = Dimensions.get("window");

const data = csvParse(exampleData, function(d) {
	return {
		timestamp: new Date(d.timestamp * 1000),
		Y: +d.Y,
		x: +d.x,
		y: +d.y
	};
});

const yExtent = extent(data, d => d.Y);

const y = scaleLinear().domain([-yExtent[1], yExtent[1]]).range([0, 150]);

const x = scaleTime().domain(extent(data, d => d.timestamp)).range([0, width]);

const lineGraph = area()
	.x(d => x(d.timestamp))
	.y0(d => y(-d.Y))
	.y1(d => y(d.Y));

const areaGraph = area()
	.x(d => x(d.timestamp))
	.y0(d => y(-d.Y))
	.y1(d => y(d.Y))
	.defined((d, i, data) => !(i % 6));

const d = areaGraph(data);
const d2 = lineGraph(data.filter((d, i, data) => true));

const Path = Animated.createAnimatedComponent(Svg.Path);
Path.propTypes.style = React.PropTypes.any;

const Gradient = (
	<Svg.Defs>
		<Svg.LinearGradient id="grad" x1="0" y1="0" x2={width} y2="0">
			{data.filter((d, i, data) => !(i % 10)).map((d, i) => {
				let rgb = color.xyy.rgb([d.x, d.y, d.Y]);
				rgb = rgb.map(x => Math.floor(x));
				return (
					<Svg.Stop
						offset={i / (data.length / 10) + ""}
						stopColor={`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`}
						stopOpacity={1}
					/>
				);
			})}
		</Svg.LinearGradient>
	</Svg.Defs>
);

class TimelineScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			interacting: new Animated.Value(0),
			anim: new Animated.Value(0),
			pan: new Animated.ValueXY()
		};
		this.lastRequest = new Date(0);
	}

	panCallback(value) {
		const thisRequest = new Date();
		if (thisRequest - this.lastRequest < 100) return;
		this.lastRequest = thisRequest;

		const timestamp = x.invert(value.value);
		const idx = bisector(d => d.timestamp).left(data, timestamp);
		this.props.setLights({
			Y: data[idx].Y,
			xy: [data[idx].x, data[idx].y]
		});
	}

	componentWillMount() {
		this.state.pan.x.addListener(this.panCallback.bind(this));
		this._panResponder = PanResponder.create({
			onStartShouldSetPanResponder: (evt, gestureState) => true,
			onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
			onMoveShouldSetPanResponder: (evt, gestureState) => true,
			onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

			onPanResponderGrant: (evt, gestureState) => {
				this.panCallback({ value: gestureState.x0 });
				Animated.timing(this.state.interacting, { toValue: 1 }).start();
			},
			onPanResponderMove: Animated.event([
				null,
				{ moveX: this.state.pan.x, dy: this.state.pan.y }
			]),
			onPanResponderTerminationRequest: (evt, gestureState) => true,
			onPanResponderRelease: (evt, gestureState) => {
				Animated.timing(this.state.interacting, { toValue: 0 }).start();
			},
			onPanResponderTerminate: (evt, gestureState) => {
				Animated.timing(this.state.interacting, { toValue: 0 }).start();
			},
			onShouldBlockNativeResponder: (evt, gestureState) => {
				return true;
			}
		});
	}

	componentDidMount() {
		Animated.sequence([
			Animated.timing(this.state.anim, { toValue: 0, duration: 1000 }),
			Animated.spring(this.state.anim, { toValue: 1, duration: 1000 })
		]).start();
	}

	render() {
		return (
			<Container>
				<Content>
					<Animated.View
						style={{
							transform: [
								{ scaleY: this.state.anim }
								/*
								{
									scaleX: this.state.pan.y.interpolate({
										inputRange: [-1000, 1000],
										outputRange: [0, 2]
									})
								}
								*/
							]
						}}
						{...this._panResponder.panHandlers}
					>
						<Svg height="150" width={width}>
							{Gradient}
							<Svg.Path
								d={d}
								stroke="url(#grad)"
								strokeWidth={2}
								fill="url(#grad)"
							/>
							<Path
								d={d2}
								stroke="white"
								strokeWidth={1}
								fillOpacity={0}
								opacity={this.state.interacting}
							/>
						</Svg>
					</Animated.View>
				</Content>
			</Container>
		);
	}
}

TimelineScreen.propTypes = {
	setLights: React.PropTypes.func
};

const mapDispatchToProps = {
	setLights
};

const mapStateToProps = state => ({
	bridge: state.bridges.current
});

export default connect(mapStateToProps, mapDispatchToProps)(TimelineScreen);
