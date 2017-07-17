import React, { Component } from "react";
import { StyleSheet } from "react-native";
import { Animated, Dimensions, InteractionManager } from "react-native";
import { connect } from "react-redux";

import {
	Container,
	Content,
	Header,
	Footer,
	View,
	Text
} from "./../../components";

import Time from "./../Time";
import DailyTimeline from "./../Timeline/Daily";
import MonthlyTimeline from "./../Timeline/Monthly";

import ImageSlider from "./../Background/imageSlider";

import { setLights, setSchedule } from "./../../actions/bridge";
import { interaction, setParams } from "./../../actions/graph";

import swipeHandler from "./SwipeHandler";

const moment = require("moment");

class TimelineScreen extends Component {
	static propTypes = {
		setLights: React.PropTypes.func,
		setSchedule: React.PropTypes.func,
		interaction: React.PropTypes.func,
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

		const active = "daily";

		this.state = {
			active,
			currentDate,
			currentTime,
			week,
			month,
			width,
			height,
			yearOpacity: new Animated.Value(0),
			monthOpacity: new Animated.Value(0),
			dayOpacity: new Animated.Value(1),
			scaleY: new Animated.Value(0),
			swipe: new Animated.Value(0),
			interacting: new Animated.Value(0)
		};

		this.swipe = 0;
		this.state.swipe.addListener(({ value }) => (this.swipe = value));

		this.imageSlide = new Animated.Value(0);
		this.imageResponder = ImageSlider(this.imageSlide);

		this.settingsSlide = new Animated.Value(0);
		this.settingsResponder = ImageSlider(this.settingsSlide);

		const rebase = moment().add(1, "minutes");
		props.setSchedule(currentTime, rebase, "weekly");

		this.lastRequest = new Date(0);

		this._swipePanResponder = swipeHandler(this);
	}

	dayToMonth() {
		Animated.parallel([
			Animated.timing(this.state.monthOpacity, { toValue: 1, duration: 100 }),
			Animated.timing(this.state.dayOpacity, { toValue: 0, duration: 100 })
		]).start(() => {
			this.setState({ active: "monthly" });
		});
	}

	monthToDay() {
		Animated.parallel([
			Animated.timing(this.state.monthOpacity, { toValue: 0, duration: 100 }),
			Animated.timing(this.state.dayOpacity, { toValue: 1, duration: 100 })
		]).start(() => {
			this.setState({ active: "daily" });
		});
	}

	debounce() {
		const thisRequest = new Date();
		if (thisRequest - this.lastRequest < 100) return false;
		this.lastRequest = thisRequest;
		return true;
	}

	setDate(date) {
		const currentDate = moment(date);
		this.setState({ currentDate });

		this.state.swipe.setValue(0);
	}

	next() {
		const newDate = moment(this.state.currentDate);
		let unit;
		switch (this.state.active) {
			case "monthly":
				newDate.add(1, "month");
				break;
			case "daily":
				newDate.add(1, "days");
				break;
		}

		this.setDate(newDate);
	}

	previous() {
		const newDate = moment(this.state.currentDate);
		switch (this.state.active) {
			case "monthly":
				newDate.subtract(1, "month");
				break;
			case "daily":
				newDate.subtract(1, "days");
				break;
		}
		this.setDate(newDate);
	}

	dataTouch(data) {
		if (!data.timestamp) return;

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
		if (newProps.graph.interaction !== this.props.graph.interaction) {
			Animated.timing(this.state.interacting, {
				toValue: newProps.graph.interaction ? 1 : 0,
				duration: 150
			}).start();
		}
	}

	componentDidMount() {
		Animated.sequence([
			Animated.timing(this.state.scaleY, { toValue: 0, duration: 500 }),
			Animated.spring(this.state.scaleY, { toValue: 1, duration: 1000 })
		]).start();
	}

	render() {
		const src = require("./../../../images/antarctic_light.jpg");

		const { width, height } = this.props.graph.params;

		const displayTime = moment(this.state.currentTime);
		displayTime.minutes(Math.floor(displayTime.minutes() / 15) * 15);

		const displayDate = moment(this.state.currentDate);

		const pinchHandler = this.refs[this.state.active]
			? this.refs[this.state.active].getWrappedInstance().getPinchHandler()
			: {};

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
					<View style={{ width }} {...pinchHandler}>
						<View
							style={{
								height: 100,
								width
							}}
							{...this._swipePanResponder.panHandlers}
						/>
						<Animated.View
							style={{
								height: 225,
								transform: [
									{ translateX: this.state.swipe },
									{ scaleY: this.state.scaleY }
								]
							}}
						>
							<Animated.View
								style={{
									opacity: this.state.monthOpacity,
									position: "absolute",
									top: 0,
									width
								}}
							>
								<MonthlyTimeline
									ref="monthly"
									dataTouch={data => this.dataTouch(data)}
									date={this.state.currentDate}
									monthToDay={() => this.monthToDay()}
									interacting={this.state.interacting}
								/>
							</Animated.View>
							<Animated.View
								style={{
									opacity: this.state.dayOpacity,
									position: "absolute",
									top: 0,
									width
								}}
							>
								<DailyTimeline
									ref="daily"
									dataTouch={data => this.dataTouch(data)}
									date={this.state.currentDate}
									dayToMonth={() => this.dayToMonth()}
									interacting={this.state.interacting}
								/>
							</Animated.View>
						</Animated.View>
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
	interaction,
	setGraphParams: setParams
};

const mapStateToProps = state => ({
	graph: state.graph
});

export default connect(mapStateToProps, mapDispatchToProps)(TimelineScreen);
