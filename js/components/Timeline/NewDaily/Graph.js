import React, { Component } from "react";
import { Animated, PanResponder, View } from "react-native";
import { connect } from "react-redux";

import { Svg } from "expo";
import { bisector } from "d3-array";

import { BarGraph, LineGraph } from "./../../../data/graph";

import { interaction } from "./../../../actions/graph";

const moment = require("moment");

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

		this._initialDraw = false;

		this._dataBisector = bisector(d => d.xValue);

		this.state = {
			touch,
			widthValue,
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
		const month = moment(this.props.date).month();
		const thisMonth = this.props.graph["month" + month];
		if (!thisMonth) {
			return;
		}

		const { width } = this.props.graph.params;

		const dayOffset =
			moment(`2007-${month + 1}-01`, "YYYY-M-DD").dayOfYear() - 1;
		console.log(dayOffset, width * dayOffset);
		const x = value - width * dayOffset;

		console.log("Touch daily");
		console.log(value, x, dayOffset);

		const data = this.dataForXValue(x);

		this.props.dataTouch(data);
	}

	dataForXValue(x) {
		const month = moment(this.props.date).month();
		const data = this.props.graph["month" + month].dayGraph.data;
		return data[this._dataBisector.left(data, x)];
	}

	shouldComponentUpdate(newProps) {
		for (let i = 0; i < 12; i++) {
			if (!newProps.graph["month" + i]) {
				return false;
			}
		}
		return true;

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

	componentDidUpdate() {
		console.log("Finished rendering daily");
	}

	render() {
		console.log("Render daily graph");

		const { width, height, spacing } = this.props.graph.params;

		return (
			<View style={{ height, width, position: "relative" }}>
				<Animated.View
					style={{
						width: width * 365,
						alignSelf: "center",
						transform: [
							{ translateX: this.state.translateX },
							{ scaleX: this.props.scaleX }
						]
					}}
					{...this._touchResponder.panHandlers}
				>
					<View
						style={{
							width: width * 365,
							alignSelf: "center"
						}}
					>
						<Svg height={height} width={width * 365}>
							{Array.from(new Array(12), (x, i) => i)
								.map((x, i) => {
									const graph = this.props.graph["month" + i];
									const day =
										moment(`2007-${i + 1}-01`, "YYYY-M-DD").dayOfYear() - 1;
									if (graph && graph.dayGraph && graph.dayGraph.dBar) {
										// console.log(width * day);
										// console.log(graph.dayGraph.dBar);
									}
									return graph && graph.dayGraph && graph.dayGraph.dBar
										? <BarGraph
												key={`month${i}_bar`}
												x={width * day}
												data={graph.dayGraph.dBar}
											/>
										: null;
								})
								.filter(x => !!x)}
						</Svg>
					</View>
				</Animated.View>
			</View>
		);
	}
}
/*
					<Animated.View
						style={{
							position: "absolute",
							top: 0,
							opacity: this.props.interacting,
							width: width * 365,
							alignSelf: "center"
						}}
					>
						<Svg height={height} width={width * 365}>
							{Array.from(new Array(12), (x, i) => i)
								.map((x, i) => {
									const graph = this.props.graph["month" + i];
									const days = moment(
										`2007-${i + 1}-01`,
										"YYYY-M-DD"
									).daysInMonth();
									const day =
										moment(`2007-${i + 1}-01`, "YYYY-M-DD").dayOfYear() - 1;
									return graph
										? <LineGraph
												key={`"month${i}_line`}
												width={width * days}
												dataForXValue={this.dataForXValue.bind(this)}
												x={width * day}
												data={graph.dayGraph.dLine}
											/>
										: null;
								})
								.filter(x => !!x)}
						</Svg>
					</Animated.View>
					*/

const mapDispatchToProps = {
	interaction
};

const mapStateToProps = state => ({
	graph: state.graph
});

export default connect(mapStateToProps, mapDispatchToProps)(Graph);
