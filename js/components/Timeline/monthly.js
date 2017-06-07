import React, { Component } from "react";
import { Animated, View } from "react-native";
import { connect } from "react-redux";
import { scaleLinear, scaleTime } from "d3-scale";
import { area, curveStep } from "d3-shape";

import { Svg } from "expo";

import { BarGraph } from "./../../data/graph";

import { Text } from "./../../components";

import theme from "./../../themes/base-theme";

class Timeline extends Component {
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
		const lastMonthGraph = this.props.graph["month" + (this.props.month - 1)];
		const graph = this.props.graph["month" + this.props.month];
		const nextMonthGraph = this.props.graph["month" + (this.props.month + 1)];

		const { width, height, spacing } = this.props.graph.params;

		return (
			<Animated.View
				style={{
					width: width,
					alignSelf: "flex-start",
					transform: [
						{ translateX: this.props.translateX },
						{ scaleY: this.props.scaleY },
						{ scaleX: this.props.scaleX }
					]
				}}
				{...this.props.panHandlers}
			>
				<Text />
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

const mapDispatchToProps = {};

const mapStateToProps = state => ({
	graph: state.graph
});

export default connect(mapStateToProps, mapDispatchToProps)(Timeline);
/*
						<Animated.View
							style={{
								position: "absolute",
								top: 0,
								opacity: this.state.interacting
							}}
						>
							<Svg height={this.state.height} width={this.state.width * count}>
								{keys.map((key, i) => (
									<LineGraph
										key={key}
										data={this.props.data[key]}
										x={i * this.state.width}
										width={this.state.width}
										height={this.state.height}
										spacing={this.state.spacing}
									/>
								))}
							</Svg>
						</Animated.View>
	*/
