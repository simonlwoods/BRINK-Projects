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

		const translateX = new Animated.Value(0);

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
		if (!this.props.graph["month" + this.props.month]) return;

		const { width } = this.props.graph.params;

		const x = value; // - 7 * width;
		const data = this.props.graph["month" + this.props.month].dataForXValue(x);

		console.log(data);

		this.props.dataTouch(data);
	}

	shouldComponentUpdate(newProps) {
		return true;

		const { width, height } = this.props.graph.params;
		const { newWidth, newHeight } = newProps.graph.params;

		if (width != newWidth || height != newHeight) return true;
		if (newProps.month !== this.props.month) return true;

		const lastMonthGraph = this.props.graph["month" + (this.props.month - 1)];
		const graph = this.props.graph["month" + this.props.month];
		const nextMonthGraph = this.props.graph["month" + (this.props.month + 1)];

		const newLastMonthGraph = newProps.graph["month" + (newProps.month - 1)];
		const newGraph = newProps.graph["month" + newProps.month];
		const newNextMonthGraph = newProps.graph["month" + (newProps.month + 1)];

		if (!lastMonthGraph && newLastMonthGraph) return true;
		if (!graph && newGraph) return true;
		if (!nextMonthGraph && newNextMonthGraph) return true;

		return false;
	}

	render() {
		const { width, height, spacing } = this.props.graph.params;

		const lastMonthGraph = this.props.graph["month" + (this.props.month - 1)];
		const graph = this.props.graph["month" + this.props.month];
		const nextMonthGraph = this.props.graph["month" + (this.props.month + 1)];

		return (
			<Animated.View
				style={{
					width: width,
					alignSelf: "center",
					transform: [
						{ translateX: this.state.translateX },
						{ scaleX: this.props.scaleX }
					]
				}}
				{...this._touchResponder.panHandlers}
			>
				<Svg height={height} width={width}>
					{graph
						? <BarGraph
								key="month{this.props.month}"
								x={0}
								data={graph.dBar}
								fill={true}
							/>
						: null}
				</Svg>
			</Animated.View>
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
