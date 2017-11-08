import React, { Component } from "react";
import { Animated, PanResponder, View } from "react-native";
import { connect } from "react-redux";

import { Svg } from "expo";
import { bisector } from "d3-array";

import { BarGraph, LineGraph } from "./../../../data/graph";

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
			dayOffset: props.dayOffset,
			touch,
			widthValue,
			translateX
		};
	}

	componentWillMount() {
		this._touchResponder = PanResponder.create({
			onStartShouldSetPanResponder: (evt, gestureState) =>
				!this.props.isSwiping() && gestureState.numberActiveTouches == 1,

			onStartShouldSetPanResponderCapture: (evt, gestureState) => false,

			onMoveShouldSetPanResponder: (evt, gestureState) =>
				!this.props.isSwiping() && gestureState.numberActiveTouches == 1,

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

			onPanResponderRelease: (evt, gestureState) => {
				this._savedValue = evt.nativeEvent.locationX;
				this.props.interaction(false);
			},

			onPanResponderTerminate: (evt, gestureState) => {
				this.props.interaction(false);
				if (this._savedValue) {
					this.touchCallback({ value: this._savedValue });
				}
			},

			onShouldBlockNativeResponder: (evt, gestureState) => false
		});

		this.state.touch.addListener(this.touchCallback.bind(this));
	}

	touchCallback({ value }) {
		const year = moment(this.props.date).year();
		const month = moment(this.props.date).month();
		const thisMonth = this.props.graph[year + "-" + (month + 1) + "-day"];
		if (!thisMonth) {
			return;
		}

		const { width } = this.props.graph.params;

		const dayOffset =
			moment(`${year}-${month + 1}-01`, "YYYY-M-DD").dayOfYear() - 1;
		const x = value - width * dayOffset;

		const data = this.dataForXValue(x);

		this.props.dataTouch(data);
	}

	dataForXValue(x) {
		const year = moment(this.props.date).year();
		const month = moment(this.props.date).month() + 1;
		const key = `${year}-${month < 10 ? "0" : ""}${month}-day`;
		const data = this.props.graph[key].data;
		return data[this._dataBisector.left(data, x)];
	}

	shouldComponentUpdate(newProps) {
		if (!this._initialDraw) {
			for (let i = 1; i <= 12; i++) {
				const key = `2007-${i < 10 ? "0" : ""}${i}-day`;
				if (!newProps.graph[key]) {
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
							{Array(12)
								.fill(0)
								.map((x, i) => {
									const key = `2007-${i + 1 < 10 ? "0" : ""}${i + 1}-day`;
									const graph = this.props.graph[key];
									const day =
										moment(`2007-${i + 1}-01`, "YYYY-M-DD").dayOfYear() - 1;

									if (graph && graph.dBar) {
										//console.log(graph.dBar);
									}
									return graph && graph.dBar
										? <BarGraph
												key={`month${i}_bar`}
												x={width * day}
												data={graph.dBar}
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
							{Array(12)
								.fill(0)
								.map((x, i) => {
									const key = `2007-${i + 1 < 10 ? "0" : ""}${i + 1}-day`;
									const graph = this.props.graph[key];
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
												data={graph.dLine}
											/>
										: null;
								})
								.filter(x => !!x)}
						</Svg>
					</Animated.View>
					*/

const mapDispatchToProps = {};

const mapStateToProps = state => ({
	graph: state.graph
});

export default connect(mapStateToProps, mapDispatchToProps)(Graph);
