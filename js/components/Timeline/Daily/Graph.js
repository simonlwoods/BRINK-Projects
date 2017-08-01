import React, { Component } from "react";
import { Animated, PanResponder, View } from "react-native";
import { connect } from "react-redux";

import { Svg } from "expo";

import { BarGraph, LineGraph } from "./../../../data/graph";

import { interaction } from "./../../../actions/graph";

class Graph extends Component {
	constructor(props) {
		super(props);

		const touch = new Animated.Value(0);

		const { width } = props.graph.params;
		const widthValue = new Animated.Value(width);

		const translateX = Animated.multiply(
			Animated.multiply(props.dayOffset, widthValue),
			props.scaleX
		);

		this.state = {
			touch,
			widthValue,
			translateX
		};
	}

	componentWillMount() {
		this._touchResponder = PanResponder.create({
			onStartShouldSetPanResponder: (evt, gestureState) =>
				gestureState.numberActiveTouches == 1,

			onStartShouldSetPanResponderCapture: (evt, gestureState) => false,

			onMoveShouldSetPanResponder: (evt, gestureState) =>
				gestureState.numberActiveTouches == 1,

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
		if (!this.props.graph["week" + this.props.week]) return;

		const { width } = this.props.graph.params;

		const x = value - 8 * width;

		console.log("Touch daily");
		console.log(value, x);

		const data = this.props.graph["week" + this.props.week].dataForXValue(x);

		this.props.dataTouch(data);
	}

	shouldComponentUpdate(newProps) {
		const { width, height } = this.props.graph.params;
		const { width: newWidth, height: newHeight } = newProps.graph.params;

		if (width != newWidth || height != newHeight) {
			this.state.widthValue.setValue(width);
			return true;
		}

		if (newProps.week !== this.props.week) {
			return true;
		}

		const lastWeekGraph = this.props.graph["week" + (this.props.week - 1)];
		const graph = this.props.graph["week" + this.props.week];
		const nextWeekGraph = this.props.graph["week" + (this.props.week + 1)];

		const newLastWeekGraph = newProps.graph["week" + (newProps.week - 1)];
		const newGraph = newProps.graph["week" + newProps.week];
		const newNextWeekGraph = newProps.graph["week" + (newProps.week + 1)];

		if (!lastWeekGraph && newLastWeekGraph) {
			return true;
		}
		if (!graph && newGraph) {
			return true;
		}
		if (!nextWeekGraph && newNextWeekGraph) {
			return true;
		}

		return false;
	}

	render() {
		console.log("Render graph");
		const lastWeekGraph = this.props.graph["week" + (this.props.week - 1)];
		const graph = this.props.graph["week" + this.props.week];
		const nextWeekGraph = this.props.graph["week" + (this.props.week + 1)];

		const { width, height, spacing } = this.props.graph.params;

		return (
			<View style={{ height, width, position: "relative" }}>
				<Animated.View
					style={{
						width: width * 21,
						alignSelf: "center",
						transform: [
							{ translateX: this.state.translateX },
							{ scaleX: this.props.scaleX }
						]
					}}
					{...this._touchResponder.panHandlers}
				>
					<Animated.View
						style={{
							width: width * 21,
							alignSelf: "center"
						}}
					>
						<Svg height={height} width={width * 21}>
							{lastWeekGraph
								? <BarGraph
										key={"week" + (this.props.week - 1) + "bar"}
										x={0}
										data={lastWeekGraph.dBar}
									/>
								: null}
							{graph
								? <BarGraph
										key={"week" + this.props.week + "bar"}
										x={7 * width}
										data={graph.dBar}
									/>
								: null}
							{nextWeekGraph
								? <BarGraph
										key={"week" + (this.props.week + 1) + "bar"}
										x={14 * width}
										data={nextWeekGraph.dBar}
									/>
								: null}
						</Svg>
					</Animated.View>
					<Animated.View
						style={{
							position: "absolute",
							top: 0,
							opacity: this.props.interacting,
							width: width * 21,
							alignSelf: "center"
						}}
					>
						<Svg height={height} width={width * 21}>
							{lastWeekGraph
								? <LineGraph
										key={"week" + (this.props.week - 1) + "line"}
										width={7 * width}
										dataForXValue={lastWeekGraph.dataForXValue}
										x={0}
										data={lastWeekGraph.dLine}
									/>
								: null}
							{graph
								? <LineGraph
										key={"week" + this.props.week + "line"}
										width={7 * width}
										dataForXValue={graph.dataForXValue}
										x={7 * width}
										data={graph.dLine}
									/>
								: null}
							{nextWeekGraph
								? <LineGraph
										key={"week" + (this.props.week + 1) + "line"}
										width={7 * width}
										x={14 * width}
										dataForXValue={nextWeekGraph.dataForXValue}
										data={nextWeekGraph.dLine}
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
