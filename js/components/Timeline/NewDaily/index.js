import React, { Component } from "react";
import { Animated, View } from "react-native";
import { connect } from "react-redux";
import { Svg } from "expo";
import { scaleLinear, scaleTime } from "d3-scale";

import PinchHandler from "./PinchHandler";
import Graph from "./Graph";

const moment = require("moment");
const co = require("co");

class Timeline extends Component {
	constructor(props) {
		super(props);

		const dayOfYear = new Animated.Value(moment(props.date).dayOfYear());

		const dayOffset = Animated.add(
			new Animated.Value(Math.floor(365 / 2) + 1),
			Animated.multiply(dayOfYear, new Animated.Value(-1))
		);

		this.state = {
			dayOfYear,
			dayOffset,
			scaleX: new Animated.Value(1)
		};

		const { height } = this.props.graph.params;

		this.y = scaleLinear().domain([0, 65]).range([0, height / 2]);

		this.state.scaleX.addListener(({ value }) => {
			if (this.state.showX && (value > 1.05 || value < 0.95)) {
				this.setState({ showX: false });
			}
			if (!this.state.showX && (value < 1.05 && value > 0.95)) {
				this.setState({ showX: true });
			}
		});
	}

	getScale() {
		return this.state.scaleX;
	}

	zoomToMonth() {
		const days = moment(this.props.date).daysInMonth();
		const dayOfYear = moment(this.props.date).date(1).dayOfYear();

		Animated.parallel([
			Animated.timing(this.state.scaleX, {
				toValue: 1 / days
			}),
			Animated.timing(this.state.dayOfYear, {
				toValue: dayOfYear
			})
		]).start();
	}

	zoomToDate() {
		const dayOfYear = moment(this.props.date).dayOfYear();

		Animated.parallel([
			Animated.timing(this.state.scaleX, {
				toValue: 1
			}),
			Animated.timing(this.state.dayOfYear, {
				toValue: dayOfYear
			})
		]).start();
	}

	dataTouch(data) {
		if (data) {
			this.setState({
				showX: true,
				x: data.xValue,
				Y: data.Y
			});
			this.props.dataTouch(data);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (!nextProps.date.isSame(this.props.date)) {
			const dayOfYear = moment(nextProps.date).dayOfYear();
			this.state.dayOfYear.setValue(dayOfYear);
		}
	}

	render() {
		const { width, height, spacing } = this.props.graph.params;

		const x = this.state.x - (moment(this.props.date).date() - 1) * width;
		const y = Math.max(1, this.y(this.state.Y));
		return (
			<View>
				{this.state.showX
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
						interaction={this.props.interaction}
						isSwiping={this.props.isSwiping}
						scaleX={this.state.scaleX}
						date={this.props.date}
						dayOffset={this.state.dayOffset}
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
