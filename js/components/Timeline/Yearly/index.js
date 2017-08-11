import React, { Component } from "react";
import { Animated, View } from "react-native";
import { connect } from "react-redux";
import { Svg } from "expo";
import { scaleLinear, scaleTime } from "d3-scale";

import Graph from "./Graph";

const moment = require("moment");
const co = require("co");

class Timeline extends Component {
	constructor(props) {
		super(props);

		console.log("Yearly constructor");

		const { width, height } = this.props.graph.params;

		const offsetMonth = new Animated.Value(0);
		const widthValue = new Animated.Value(width);
		const day = new Animated.Value(moment(props.date).date(1).dayOfYear());

		const monthOffset = Animated.multiply(
			offsetMonth,
			Animated.multiply(widthValue, Animated.add(day, new Animated.Value(-1)))
		);

		this.state = {
			day,
			offsetMonth,
			monthOffset,
			scaleX: new Animated.Value(1)
		};

		this.y = scaleLinear().domain([0, 65]).range([0, height / 2]);
	}

	getScale() {
		return this.state.scaleX;
	}

	componentWillReceiveProps(nextProps) {
		this.state.day.setValue(moment(nextProps.date).date(1).dayOfYear());
	}

	zoomToMonth() {
		Animated.parallel([
			Animated.timing(this.state.scaleX, {
				toValue: 1 / 12
			}),
			Animated.timing(this.state.offsetMonth, {
				toValue: 1
			})
		]).start();
	}

	zoomToYear() {
		Animated.parallel([
			Animated.timing(this.state.scaleX, {
				toValue: 1
			}),
			Animated.timing(this.state.offsetMonth, {
				toValue: 0
			})
		]).start();
	}

	dataTouch(data) {
		if (data) {
			this.setState({
				x: data.xValue,
				Y: data.Y
			});
			this.props.dataTouch(data);
		}
	}

	render() {
		const { width, height, spacing } = this.props.graph.params;

		const x = this.state.x;
		const y = Math.max(1, this.y(this.state.Y));
		return (
			<View>
				{this.state.x
					? <View
							style={{
								width
							}}
						>
							<Svg height={height} width={width}>
								<Svg.Rect
									x={x}
									y={height / 2 - y}
									width="1"
									height={y * 2}
									strokeWidth="0"
									fill="white"
									fillOpacity="0.35"
								/>
							</Svg>
						</View>
					: null}
				<View
					style={{
						position: "absolute",
						top: 0,
						width
					}}
				>
					<Graph
						dataTouch={this.dataTouch.bind(this)}
						interacting={this.props.interacting}
						scaleX={this.state.scaleX}
						monthOffset={this.state.monthOffset}
					/>
				</View>
			</View>
		);
	}
}

const mapDispatchToProps = {};

const mapStateToProps = state => ({ graph: state.graph });

export default connect(mapStateToProps, mapDispatchToProps, null, {
	withRef: true
})(Timeline);
