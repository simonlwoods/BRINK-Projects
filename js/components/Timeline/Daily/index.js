import React, { Component } from "react";
import { Animated } from "react-native";
import { connect } from "react-redux";

import { loadDataWeek } from "./../../../actions/data";

import PinchHandler from "./PinchHandler";
import Graph from "./Graph";

const moment = require("moment");
const co = require("co");

class Timeline extends Component {
	constructor(props) {
		super(props);

		const monthOffset = new Animated.Value(0);
		const dayOfWeek = new Animated.Value(moment(props.date).dayOfYear() % 7);
		const dayOffset = Animated.add(
			Animated.add(
				new Animated.Value(3),
				Animated.multiply(new Animated.Value(-1), dayOfWeek)
			),
			monthOffset
		);

		const week = Math.floor(moment(props.date).dayOfYear() / 7);

		this.state = {
			week,
			dayOfWeek,
			dayOffset,
			monthOffset,
			scaleX: new Animated.Value(1)
		};

		this.setDate(props.date);

		co(function*() {
			yield props.loadDataWeek(week, true);
			yield props.loadDataWeek(week + 1, true);
			yield props.loadDataWeek(week - 1, true);
		});
	}

	getScale() {
		return this.state.scaleX;
	}

	setDate(date) {
		const dayOfYear = moment(date).dayOfYear();
		const dayOfWeek = dayOfYear % 7;

		this.state.dayOfWeek.setValue(dayOfWeek);
	}

	zoomToMonth(callback) {
		const days = moment(this.props.date).daysInMonth();
		const date = moment(this.props.date).date();

		const ides = Math.floor(days / 2);
		const diff = date - ides + 1;

		Animated.parallel([
			Animated.spring(this.state.scaleX, {
				toValue: 1 / days
			}),
			Animated.spring(this.state.monthOffset, {
				toValue: diff
			})
		]).start(() => {
			setTimeout(() => {
				this.state.scaleX.setValue(1);
				this.state.monthOffset.setValue(0);
			}, 200);
			callback();
		});
	}

	zoomToDate() {
		Animated.parallel([
			Animated.spring(this.state.scaleX, {
				toValue: 1
			}),
			Animated.spring(this.state.monthOffset, {
				toValue: 0
			})
		]);
	}

	componentWillReceiveProps(nextProps) {
		if (!nextProps.date.isSame(this.props.date)) {
			const dayOfYear = moment(nextProps.date).dayOfYear();
			const week = Math.floor(dayOfYear / 7);
			const dayOfWeek = dayOfYear % 7;

			this.state.dayOfWeek.setValue(dayOfWeek);

			if (week !== this.state.week) {
				co(function*() {
					yield nextProps.loadDataWeek(week, true);
					yield nextProps.loadDataWeek(week + 1, true);
					yield nextProps.loadDataWeek(week - 1, true);
					yield nextProps.loadDataWeek(week + 2, true);
					yield nextProps.loadDataWeek(week - 2, true);
				});
				this.setState({ week });
			}
		}
	}

	render() {
		return (
			<Graph
				dataTouch={this.props.dataTouch}
				interacting={this.props.interacting}
				scaleX={this.state.scaleX}
				week={this.state.week}
				dayOffset={this.state.dayOffset}
			/>
		);
	}
}

const mapDispatchToProps = { loadDataWeek };

const mapStateToProps = state => ({});

export default connect(mapStateToProps, mapDispatchToProps, null, {
	withRef: true
})(Timeline);
