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

		const touch = new Animated.Value(0);

		const { width } = props.graph.params;
		const widthValue = new Animated.Value(width);

		const month = new Animated.Value(props.month);

		const monthOffset = Animated.add(
			new Animated.Value(5.5),
			Animated.multiply(month, new Animated.Value(-1))
		);

		const totalOffset = Animated.add(monthOffset, props.dayOffset);

		const translateX = Animated.multiply(
			Animated.multiply(totalOffset, widthValue),
			props.scaleX
		);

		this._initialDraw = false;
		this._dataBisector = bisector(d => d.xValue);

		this.state = {
			touch,
			widthValue,
			month,
			totalOffset,
			translateX
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
		if (!this.props.graph["month" + this.props.month]) return;

		const { width } = this.props.graph.params;

		const x = value - width * this.props.month;

		const data = this.dataForXValue(x);

		console.log("Touch monthly");
		console.log(value, x);

		this.props.dataTouch(data);
	}

	dataForXValue(x) {
		const data = this.props.graph["month" + this.props.month].monthGraph.data;
		return data[this._dataBisector.left(data, x)];
	}

	shouldComponentUpdate(newProps) {
		if (!this._initialDraw) {
			for (let i = 0; i < 12; i++) {
				if (!newProps.graph["month" + i]) {
					return false;
				}
			}
			this._initialDraw = true;
			return true;
		}

		return false;
	}

	componentWillReceiveProps(newProps) {
		const { width } = this.props.graph.params;

		this.state.month.setValue(newProps.month);
		this.state.widthValue.setValue(width);
	}

	componentDidUpdate() {
		console.log("Finished rendering monthly");
	}

	render() {
		console.log("Render monthly graph");

		const { width, height, spacing } = this.props.graph.params;

		return (
			<View style={{ height, width, position: "relative" }}>
				<Animated.View
					style={{
						width: width * 12,
						alignSelf: "center",
						transform: [
							{ translateX: this.state.translateX },
							{ scaleX: this.props.scaleX }
						]
					}}
					{...this._touchResponder.panHandlers}
				>
					<View style={{ width: width * 12, alignSelf: "center" }}>
						<Svg height={height} width={width * 12}>
							{Array.from(new Array(12), (x, i) => i)
								.map((x, i) => {
									const graph = this.props.graph["month" + i];
									return graph
										? <BarGraph
												key={"month" + i + "_monthbar"}
												x={width * i}
												data={graph.monthGraph.dBar}
											/>
										: null;
								})
								.filter(x => !!x)}
						</Svg>
					</View>
					<Animated.View
						style={{
							position: "absolute",
							top: 0,
							opacity: this.props.interacting,
							width: width * 12,
							alignSelf: "center"
						}}
					>
						<Svg height={height} width={width * 365}>
							{Array.from(new Array(12), (x, i) => i)
								.map((x, i) => {
									const graph = this.props.graph["month" + i];
									return graph
										? <LineGraph
												key={`"month${i}_monthline`}
												width={width}
												dataForXValue={this.dataForXValue.bind(this)}
												x={width * i}
												data={graph.monthGraph.dLine}
											/>
										: null;
								})
								.filter(x => !!x)}
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
