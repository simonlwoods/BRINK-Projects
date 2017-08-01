import React, { Component } from "react";
import { Animated } from "react-native";
import { connect } from "react-redux";

import { loadDataMonth } from "./../../../actions/data";

import PinchHandler from "./PinchHandler";
import Graph from "./Graph";

const moment = require("moment");
const co = require("co");

class Timeline extends Component {
	constructor(props) {
		super(props);

		const month = moment(props.date).month();

		this.state = {
			month,
			monthOffset: new Animated.Value(0),
			scaleX: new Animated.Value(1)
		};

		co(function*() {
			yield props.loadDataMonth(month, true);
			yield props.loadDataMonth(month + 1, true);
			yield props.loadDataMonth(month - 1, true);
			yield props.loadDataMonth(month + 2, true);
			yield props.loadDataMonth(month - 2, true);
		});
	}

	getScale() {
		return this.state.scaleX;
	}

	zoomToDate(callback) {
		const days = moment(this.props.date).daysInMonth();
		const date = moment(this.props.date).date();

		const ides = days / 2;

		Animated.parallel([
			Animated.spring(this.state.scaleX, {
				toValue: days
			}),
			Animated.spring(this.state.monthOffset, {
				toValue: ides - date
			})
		]).start();

		setTimeout(() => {
			setTimeout(() => {
				this.state.scaleX.setValue(1);
				this.state.monthOffset.setValue(0);
			}, 200);
			callback();
		}, 300);
	}

	zoomToMonth() {
		Animated.parallel([
			Animated.spring(this.state.scaleX, {
				toValue: 1
			}),
			Animated.spring(this.state.monthOffset, {
				toValue: 0
			})
		]).start();
	}

	getPinchHandler() {
		return this._pinchHandler;
	}

	componentWillReceiveProps(nextProps) {
		if (!nextProps.date.isSame(this.props.date)) {
			const month = nextProps.date.month();

			if (month !== this.state.month) {
				co(function*() {
					yield nextProps.loadDataMonth(month, true);
					yield nextProps.loadDataMonth(month + 1, true);
					yield nextProps.loadDataMonth(month - 1, true);
					yield nextProps.loadDataMonth(month + 2, true);
					yield nextProps.loadDataMonth(month - 2, true);
				});
				this.setState({ month });
			}
		}
	}

	render() {
		return (
			<Graph
				dataTouch={this.props.dataTouch}
				interacting={this.props.interacting}
				scaleX={this.state.scaleX}
				month={this.state.month}
			/>
		);
	}
}

const mapDispatchToProps = { loadDataMonth };

const mapStateToProps = state => ({});

export default connect(mapStateToProps, mapDispatchToProps, null, {
	withRef: true
})(Timeline);
