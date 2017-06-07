import React, { Component } from "react";
import { Animated, View } from "react-native";
import { connect } from "react-redux";
import { scaleLinear, scaleTime } from "d3-scale";
import { area, curveStep } from "d3-shape";

import { Svg } from "expo";

import { BarGraph, LineGraph } from "./../../data/graph";

import theme from "./../../themes/base-theme";

class Timeline extends Component {
	shouldComponentUpdate(newProps) {
		const { width, height } = this.props.graph.params;
		const { newWidth, newHeight } = newProps.graph.params;

		if (width != newWidth || height != newHeight) return true;
		if (newProps.week !== this.props.week) return true;

		const lastWeekGraph = this.props.graph["week" + (this.props.week - 1)];
		const graph = this.props.graph["week" + this.props.week];
		const nextWeekGraph = this.props.graph["week" + (this.props.week + 1)];

		const newLastWeekGraph = newProps.graph["week" + (newProps.week - 1)];
		const newGraph = newProps.graph["week" + newProps.week];
		const newNextWeekGraph = newProps.graph["week" + (newProps.week + 1)];

		if (!lastWeekGraph && newLastWeekGraph) return true;
		if (!graph && newGraph) return true;
		if (!nextWeekGraph && newNextWeekGraph) return true;

		return false;
	}

	render() {
		const lastWeekGraph = this.props.graph["week" + (this.props.week - 1)];
		const graph = this.props.graph["week" + this.props.week];
		const nextWeekGraph = this.props.graph["week" + (this.props.week + 1)];

		const { width, height, spacing } = this.props.graph.params;

		return (
			<View
				style={{ height, width, position: "relative" }}
				{...this.props.panHandlers}
			>
				<Animated.View
					style={{
						width: width * 21,
						alignSelf: "flex-start",
						transform: [
							{ translateX: this.props.translateX },
							{ scaleY: this.props.scaleY },
							{ scaleX: this.props.scaleX }
						]
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
						alignSelf: "flex-start",
						transform: [
							{ translateX: this.props.translateX },
							{ scaleY: this.props.scaleY },
							{ scaleX: this.props.scaleX }
						]
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
			</View>
		);
	}
}

const mapDispatchToProps = {};

const mapStateToProps = state => ({
	graph: state.graph
});

export default connect(mapStateToProps, mapDispatchToProps)(Timeline);
/*
	*/
