import React, { Component } from "react";
import { StyleSheet } from "react-native";
import {
	Animated,
	Dimensions,
	InteractionManager,
	PanResponder
} from "react-native";
import { connect } from "react-redux";

import { Svg } from "expo";
import {
	Button,
	Container,
	Content,
	Header,
	Footer,
	View,
	Text
} from "./../../components";

import Time from "./../Time";
import DailyTimeline from "./../Timeline";
import MonthlyTimeline from "./../Timeline/monthly";

import ImageSlider from "./../Background/imageSlider";

import { setLights, setSchedule } from "./../../actions/bridge";
import {
	loadData,
	loadDataRange,
	loadDataWeek,
	loadDataMonth,
	unloadData
} from "./../../actions/data";
import { setParams } from "./../../actions/graph";

import { BarGraph, LineGraph } from "./../../data/graph";

import panHandler from "./PanHandler";
import swipeHandler from "./SwipeHandler";
import pinchHandler from "./PinchHandler";

const moment = require("moment");
const co = require("co");

class TimelineScreen extends Component {
	static propTypes = {
		setLights: React.PropTypes.func,
		setSchedule: React.PropTypes.func,
		loadData: React.PropTypes.func,
		loadDataRange: React.PropTypes.func,
		loadDataWeek: React.PropTypes.func,
		loadDataMonth: React.PropTypes.func,
		unloadData: React.PropTypes.func,
		setGraphParams: React.PropTypes.func
	};

	constructor(props) {
		InteractionManager.setDeadline(50);

		super(props);

		const { width } = Dimensions.get("window");
		const height = 225;
		const spacing = 3;

		const currentDate = moment().year(2007).month(7).date(20);
		const currentTime = moment(currentDate);
		const week = Math.floor(currentDate.dayOfYear() / 7);
		const month = currentDate.month();

		props.setGraphParams(width, height, spacing);

		this.state = {
			currentDate,
			currentTime,
			week,
			month,
			width,
			height,
			swipe: new Animated.Value(0),
			day: new Animated.Value(0),
			interacting: new Animated.Value(0),
			anim: new Animated.Value(0),
			pan: new Animated.ValueXY(),
			pinch: new Animated.Value(1)
		};

		this.state.x = Animated.add(
			Animated.multiply(
				this.state.pinch,
				Animated.add(this.state.day, this.state.swipe)
			),
			new Animated.Value(-10 * width)
		);

		this.swipe = 0;
		this.state.swipe.addListener(({ value }) => (this.swipe = value));
		this.day = 0;
		this.state.day.addListener(({ value }) => (this.day = value));

		this.imageSlide = new Animated.Value(0);
		this.imageResponder = ImageSlider(this.imageSlide);

		this.settingsSlide = new Animated.Value(0);
		this.settingsResponder = ImageSlider(this.settingsSlide);

		this.requestData();

		const rebase = moment();
		props.setSchedule(currentTime, rebase, "weekly");

		this.lastRequest = new Date(0);
	}

	requestData() {
		const loadDataWeek = this.props.loadDataWeek;
		const loadDataMonth = this.props.loadDataMonth;
		const week = this.state.week;
		const month = this.state.month;
		co(function*() {
			InteractionManager.setDeadline(50);
			yield loadDataWeek(week, true);
			yield loadDataWeek(week + 1, true);
			yield loadDataWeek(week - 1, true);
			yield loadDataMonth(month, true);
			yield loadDataWeek(week + 2, true);
			yield loadDataWeek(week - 2, true);
			InteractionManager.setDeadline(50);
		});
	}

	debounce() {
		const thisRequest = new Date();
		if (thisRequest - this.lastRequest < 100) return false;
		this.lastRequest = thisRequest;
		return true;
	}

	interacting(isInteracting) {
		Animated.timing(this.state.interacting, {
			toValue: isInteracting ? 1 : 0,
			duration: 150
		}).start();
	}

	setDate(date) {
		const { width } = this.props.graph.params;

		let swipe = this.swipe;
		let day = this.day;
		while (swipe >= width) {
			swipe -= width;
			day += width;
		}
		while (swipe <= -width) {
			swipe += width;
			day -= width;
		}
		this.state.swipe.setValue(swipe ? swipe : 0);
		this.state.day.setValue(day ? day : 0);

		const currentDate = moment(date);
		const week = Math.floor(currentDate.dayOfYear() / 7);
		const month = currentDate.month();

		if (week !== this.state.week) {
			const jan1st = moment("2007-01-01");
			const week1st = moment(jan1st).add(week, "weeks").add(3, "days");

			const newDay = (week1st.diff(currentDate, "days") - 1) * width;
			this.state.day.setValue(newDay ? newDay : 0);
			this.setState({
				week
			});

			InteractionManager.runAfterInteractions(() => {
				this.requestData();
			});
		}
		this.setState({ currentDate });
	}

	next() {
		const newDate = moment(this.state.currentDate);
		newDate.add(1, "days");
		this.setDate(newDate);
	}

	previous() {
		const newDate = moment(this.state.currentDate);
		newDate.subtract(1, "days");
		this.setDate(newDate);
	}

	panCallback({ value }) {
		const { width } = this.props.graph.params;
		const x = value - (this.swipe + this.day - width);
		let data;

		if (x < 0) {
			if (!this.props.graph["week" + (this.state.week - 1)]) {
				return;
			}
			data = this.props.graph["week" + (this.state.week - 1)].dataForXValue(
				7 * width + x
			);
		} else {
			if (!this.props.graph["week" + this.state.week]) {
				return;
			}
			data = this.props.graph["week" + this.state.week].dataForXValue(x);
		}

		this.setState({
			currentTime: moment(data.timestamp)
		});
		if (this.debounce()) {
			this.props.setLights({
				Y: data.Y,
				xy: [data.x, data.y]
			});
		}
	}

	componentWillReceiveProps(newProps) {
		const { width } = newProps.graph.params;

		if (!width) return;

		const offset = this.swipe % this.state.width / this.state.width;
		const swipe = offset * width;
		this.state.swipe.setValue(swipe ? swipe : 0);

		const jan1st = moment("2007-01-01");
		const week1st = moment(jan1st).add(this.state.week, "weeks").add(3, "days");

		const newDay = (week1st.diff(this.state.currentDate, "days") - 1) * width;
		this.state.day.setValue(newDay ? newDay : 0);
	}

	componentWillMount() {
		this.state.pan.x.addListener(this.panCallback.bind(this));

		this._timelinePanResponder = panHandler(this);
		this._swipePanResponder = swipeHandler(this);
		this._pinchResponder = pinchHandler(this.state.pinch);
	}

	componentDidMount() {
		Animated.sequence([
			Animated.timing(this.state.anim, { toValue: 0, duration: 500 }),
			Animated.spring(this.state.anim, { toValue: 1, duration: 1000 })
		]).start();
	}

	render() {
		const src = require("./../../../images/antarctic_light.jpg");

		const { width, height } = this.props.graph.params;

		const displayTime = moment(this.state.currentTime);
		displayTime.minutes(Math.floor(displayTime.minutes() / 15) * 15);

		const displayDate = moment(this.state.currentDate);

		//console.log(this.imageSlide);

		return (
			<Container
				background={src}
				imageSlide={this.imageSlide}
				settingsSlide={this.settingsSlide}
			>
				<Header style={{ height: 80 }}>
					<Time time={displayTime} date={displayDate} />
				</Header>
				<Content>
					<View style={{ width }} responder={this._pinchResponder}>
						<View
							style={{
								height: 100,
								width
							}}
							{...this._swipePanResponder.panHandlers}
						/>
						<DailyTimeline
							week={this.state.week}
							scaleY={this.state.anim}
							translateX={this.state.x}
							scaleX={this.state.pinch}
							interacting={this.state.interacting}
							panHandlers={this._timelinePanResponder.panHandlers}
						/>
						<View
							style={{
								height: 100,
								width
							}}
							{...this._swipePanResponder.panHandlers}
						/>
					</View>
				</Content>
				<Footer style={{ height: 80 }}>
					<View style={{ marginTop: 30, height: 50, flexDirection: "row" }}>
						<View
							style={{ backgroundColor: "transparent" }}
							{...this.imageResponder.panHandlers}
						>
							<Text style={{ backgroundColor: "transparent" }}>
								Halley Base
							</Text>
						</View>
						<View
							style={{ backgroundColor: "transparent" }}
							{...this.settingsResponder.panHandlers}
						>
							<Text style={{ backgroundColor: "transparent" }}>
								Settings
							</Text>
						</View>
					</View>
				</Footer>
			</Container>
		);
	}
}

const mapDispatchToProps = {
	setLights,
	setSchedule,
	loadData,
	loadDataRange,
	loadDataWeek,
	loadDataMonth,
	unloadData,
	setGraphParams: setParams
};

const mapStateToProps = state => ({
	graph: state.graph
});

export default connect(mapStateToProps, mapDispatchToProps)(TimelineScreen);
/*
						<MonthlyTimeline
							month={this.state.month}
							scaleY={1}
							translateX={0}
							scaleX={1}
							panHandlers={this._timelinePanResponder.panHandlers}
						/>
						*/
