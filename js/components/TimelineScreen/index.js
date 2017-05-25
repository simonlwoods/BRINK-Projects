import React, { Component } from "react";
import {
	Animated,
	Dimensions,
	InteractionManager,
	PanResponder
} from "react-native";
import { connect } from "react-redux";

import { Svg } from "expo";
import { Button, Container, Content, Text, View } from "./../../components";

import { setLights } from "./../../actions/bridge";
import {
	loadData,
	loadDataRange,
	loadDataWeek,
	unloadData
} from "./../../actions/data";
import { setParams, draw, drawWeek, unloadGraph } from "./../../actions/graph";

import { BarGraph, LineGraph } from "./../../data/graph";

import panHandler from "./PanHandler";
import swipeHandler from "./SwipeHandler";

const moment = require("moment");
const co = require("co");

class TimelineScreen extends Component {
	static propTypes = {
		setLights: React.PropTypes.func,
		loadData: React.PropTypes.func,
		loadDataRange: React.PropTypes.func,
		loadDataWeek: React.PropTypes.func,
		unloadData: React.PropTypes.func,
		setGraphParams: React.PropTypes.func,
		drawGraph: React.PropTypes.func,
		drawGraphWeek: React.PropTypes.func
	};

	constructor(props) {
		InteractionManager.setDeadline(50);

		super(props);

		const { width } = Dimensions.get("window");
		const height = 225;
		const spacing = 4;

		this.currentDate = moment("2007-11-10");
		const week = Math.floor(this.currentDate.dayOfYear() / 7);

		props.setGraphParams(width, height, spacing);

		this.state = {
			week,
			width,
			height,
			spacing,
			swipe: new Animated.Value(0),
			day: new Animated.Value(0),
			interacting: new Animated.Value(0),
			anim: new Animated.Value(0),
			pan: new Animated.ValueXY()
		};

		this.state.x = Animated.add(
			Animated.add(this.state.day, this.state.swipe),
			new Animated.Value(-7 * width)
		);

		this.swipe = 0;
		this.state.swipe.addListener(({ value }) => (this.swipe = value));
		this.day = 0;
		this.state.day.addListener(({ value }) => (this.day = value));

		this.requestData();

		this.lastRequest = new Date(0);
	}

	requestData() {
		const loadDataWeek = this.props.loadDataWeek;
		const week = this.state.week;
		co(function*() {
			InteractionManager.setDeadline(50);
			yield loadDataWeek(week, true);
			yield loadDataWeek(week + 1, true);
			yield loadDataWeek(week - 1, true);
			yield loadDataWeek(week + 2, false);
			yield loadDataWeek(week - 2, false);
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

		if (week !== this.state.week) {
			const jan1st = moment("2007-01-01");
			const week1st = moment(jan1st).add(week, "weeks");

			const newDay = week1st.diff(currentDate, "days") * width;
			this.state.day.setValue(newDay ? newDay : 0);
			this.setState({
				week
			});

			InteractionManager.runAfterInteractions(() => {
				this.requestData();
			});
		}
		this.currentDate = currentDate;
	}

	next() {
		const newDate = moment(this.currentDate);
		newDate.add(1, "days");
		this.setDate(newDate);
	}

	previous() {
		const newDate = moment(this.currentDate);
		newDate.subtract(1, "days");
		this.setDate(newDate);
	}

	panCallback(value) {
		if (this.debounce()) {
			/*
			const data = this.state.dataForXValue(value.value);
			this.props.setLights({
				Y: data.Y,
				xy: [data.x, data.y]
			});
			*/
		}
	}

	componentWillReceiveProps(newProps) {
		const { width } = newProps.graph.params;

		if (!width) return;

		const offset = this.swipe % this.state.width / this.state.width;
		const swipe = offset * width;
		this.state.swipe.setValue(swipe ? swipe : 0);

		const jan1st = moment("2007-01-01");
		const week1st = moment(jan1st).add(this.state.week, "weeks");

		const newDay = week1st.diff(this.currentDate, "days") * width;
		this.state.day.setValue(newDay ? newDay : 0);
	}

	componentWillMount() {
		this.state.pan.x.addListener(this.panCallback.bind(this));

		this._timelinePanResponder = panHandler(this);
		this._swipePanResponder = swipeHandler(this);
	}

	componentDidMount() {
		Animated.sequence([
			Animated.timing(this.state.anim, { toValue: 0, duration: 500 }),
			Animated.spring(this.state.anim, { toValue: 1, duration: 1000 })
		]).start();
	}

	render() {
		const lastWeekGraph = this.props.graph["week" + (this.state.week - 1)];
		const graph = this.props.graph["week" + this.state.week];
		const nextWeekGraph = this.props.graph["week" + (this.state.week + 1)];

		const { width, height, spacing } = this.props.graph.params;

		return (
			<Container>
				<Content>
					<View
						{...this._swipePanResponder.panHandlers}
						style={{
							height: 100,
							width
						}}
					/>
					<Animated.View
						style={{
							width: width * 21,
							alignSelf: "flex-start",
							transform: [
								{ scaleY: this.state.anim },
								{ translateX: this.state.x }
							]
						}}
						{...this._timelinePanResponder.panHandlers}
					>
						<Svg height={height} width={width * 21}>
							{lastWeekGraph
								? <BarGraph
										key="week{this.state.week - 1}"
										x={0}
										data={lastWeekGraph.dBar}
										spacing={spacing}
									/>
								: null}
							{graph
								? <BarGraph
										key="week{this.state.week}"
										x={7 * width}
										data={graph.dBar}
										spacing={spacing}
									/>
								: null}
							{nextWeekGraph
								? <BarGraph
										key="week{this.state.week + 1}"
										x={14 * width}
										data={nextWeekGraph.dBar}
										spacing={spacing}
									/>
								: null}
						</Svg>
					</Animated.View>
					<View
						{...this._swipePanResponder.panHandlers}
						style={{
							height: 100,
							width
						}}
					/>
				</Content>
			</Container>
		);
	}
}

const mapDispatchToProps = {
	setLights,
	loadData,
	loadDataRange,
	loadDataWeek,
	unloadData,
	setGraphParams: setParams,
	drawGraph: draw,
	drawGraphWeek: drawWeek
};

const mapStateToProps = state => ({
	graph: state.graph
});

export default connect(mapStateToProps, mapDispatchToProps)(TimelineScreen);
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
