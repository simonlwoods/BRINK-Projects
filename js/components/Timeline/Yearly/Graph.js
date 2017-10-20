import React, { Component } from "react";
import { Animated, PanResponder, View } from "react-native";
import { connect } from "react-redux";

import { bisector } from "d3-array";
import { Svg } from "expo";

import { BarGraph, LineGraph } from "./../../../data/graph";

import { interaction } from "./../../../actions/graph";

class Graph extends Component {
	constructor(props) {
		super(props);

		console.log("Yearly graph constructor");

		const touch = new Animated.Value(0);

		this._initialDraw = false;
		this._dataBisector = bisector(d => d.xValue);

		this.state = {
			touch
		};
	}

	componentWillMount() {
		this._touchResponder = PanResponder.create({
			onStartShouldSetPanResponder: (evt, gestureState) =>
				!this.props.graph.swiping && gestureState.numberActiveTouches == 1,

			onStartShouldSetPanResponderCapture: (evt, gestureState) => false,

			onMoveShouldSetPanResponder: (evt, gestureState) =>
				!this.props.graph.swiping && gestureState.numberActiveTouches == 1,

			onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,

			onPanResponderGrant: (evt, gestureState) => {
				this.touchCallback({
					value: evt.nativeEvent.locationX
				});
				this.props.interaction(true);
			},

			onPanResponderMove: Animated.event([
				{ nativeEvent: { locationX: this.state.touch } }
			]),

			onPanResponderTerminationRequest: (evt, gestureState) => true,

			onPanResponderRelease: (evt, gestureState) =>
				this.props.interaction(false),

			onPanResponderTerminate: (evt, gestureState) =>
				this.props.interaction(false),

			onShouldBlockNativeResponder: (evt, gestureState) => false
		});

		this.state.touch.addListener(this.touchCallback.bind(this));
	}

	touchCallback({ value }) {
		if (!this.props.graph["year"]) return;

		const { width } = this.props.graph.params;

		const data = this.dataForXValue(value);

		this.props.dataTouch(data);
	}

	dataForXValue(x) {
		const data = this.props.graph["year"].data;
		return data[this._dataBisector.left(data, x)];
	}

	shouldComponentUpdate(newProps) {
		if (!this._initialDraw) {
			if (!newProps.graph["year"]) {
				return false;
			} else {
				this._initialDraw = true;
				return true;
			}
		}

		return false;
	}

	componentDidUpdate() {
		console.log("Finished rendering yearly");
	}

	render() {
		console.log("Render yearly graph");

		const { width, height, spacing } = this.props.graph.params;

		const graph = this.props.graph["year"];

		return (
			<View style={{ height, width, position: "relative" }}>
				<Animated.View
					style={{
						width,
						alignSelf: "center",
						transform: [
							{ scaleX: this.props.scaleX },
							{ translateX: this.props.monthOffset }
						]
					}}
					{...this._touchResponder.panHandlers}
				>
					<View style={{ width, alignSelf: "center" }}>
						<Svg height={height} width={width}>
							{graph ? <BarGraph key={"year_bar"} data={graph.dBar} /> : null}
						</Svg>
					</View>
					<Animated.View
						style={{
							position: "absolute",
							top: 0,
							opacity: this.props.interacting,
							width,
							alignSelf: "center"
						}}
					>
						<Svg height={height} width={width}>
							{graph
								? <LineGraph
										key={"year_line"}
										width={width}
										dataForXValue={this.dataForXValue.bind(this)}
										data={graph.dLine}
									/>
								: null}
						</Svg>
					</Animated.View>
				</Animated.View>
			</View>
		);
	}
}

const mapDispatchToProps = {
	interaction
};

const mapStateToProps = state => ({
	graph: state.graph
});

export default connect(mapStateToProps, mapDispatchToProps)(Graph);
