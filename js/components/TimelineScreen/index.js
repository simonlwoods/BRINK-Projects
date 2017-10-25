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
import DailyTimeline from "./../Timeline/NewDaily";
import MonthlyTimeline from "./../Timeline/Monthly";
import YearlyTimeline from "./../Timeline/Yearly";

import ImageSlider from "./../Background/imageSlider";

import { setLights, setSchedule } from "./../../actions/bridge";
import { setParams } from "./../../actions/graph";

import pinchHandler from "./PinchHandler";

const moment = require("moment");

class TimelineScreen extends Component {
	static propTypes = {
		setLights: React.PropTypes.func,
		setSchedule: React.PropTypes.func,
		setGraphParams: React.PropTypes.func
	};

	constructor(props) {
		InteractionManager.setDeadline(50);

		super(props);

		const { width } = Dimensions.get("window");
		const height = 225;

		const currentDate = moment().year(2007);
		const currentTime = moment(currentDate);
		const week = Math.floor(currentDate.dayOfYear() / 7);
		const month = currentDate.month();

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
			dailyScale: new Animated.Value(1),
			monthlyScale: new Animated.Value(1),
			yearlyScale: new Animated.Value(1),
			scaleY: new Animated.Value(0),
			swipe: new Animated.Value(0),
			interacting: new Animated.Value(0)
		};

		this.swiping = false;
		this.interacting = false;

		this.imageSlide = new Animated.Value(0);
		this.imageResponder = ImageSlider(this.imageSlide);

		this.settingsSlide = new Animated.Value(0);
		this.settingsResponder = ImageSlider(this.settingsSlide);

		const rebase = moment().add(1, "minutes");
		props.setSchedule(currentTime, rebase, "weekly");

		this.lastRequest = new Date(0);

		this._pinchHandler = pinchHandler(this);
	}

	dayToMonth() {
		Animated.parallel([
			Animated.timing(this.state.monthOpacity, { toValue: 1 }),
			Animated.timing(this.state.dayOpacity, { toValue: 0 })
		]).start(() => {
			this.setState({ active: "monthly" });
		});
	}

	monthToDay() {
		Animated.parallel([
			Animated.timing(this.state.monthOpacity, { toValue: 0 }),
			Animated.timing(this.state.dayOpacity, { toValue: 1 })
		]).start(() => {
			this.setState({ active: "daily" });
		});
	}

	monthToYear() {
		Animated.parallel([
			Animated.timing(this.state.yearOpacity, { toValue: 1 }),
			Animated.timing(this.state.monthOpacity, { toValue: 0 })
		]).start(() => {
			this.setState({ active: "yearly" });
		});
	}

	yearToMonth() {
		Animated.parallel([
			Animated.timing(this.state.yearOpacity, { toValue: 0, duration: 100 }),
			Animated.timing(this.state.monthOpacity, { toValue: 1, duration: 100 })
		]).start(() => {
			this.setState({ active: "monthly" });
		});
	}

	debounce() {
		const thisRequest = new Date();
		if (thisRequest - this.lastRequest < 150) return false;
		this.lastRequest = thisRequest;
		return true;
	}

	setDate(date) {
		const currentDate = moment(date);
		this.setState({ currentDate });

		this.state.swipe.setValue(0);
		this.swiping = false;
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
		if (!data || !data.timestamp) return;

		this.setState({
			currentTime: moment(data.timestamp),
			currentDate: moment(data.timestamp)
		});

		if (this.debounce()) {
			this.props.setLights({
				Y: data.Y,
				xy: [data.x, data.y]
			});
		}
	}

	gestureGrant() {
		this._swiping = false;
		this.resetPinch();
		this.resetSwipe();
	}

	gestureMove(pinch, swipePosition, swipeVelocity) {
		if (swipePosition > 50 || swipePosition < -50) this._swiping = true;
		this.pinchMove(this._swiping ? 1 : pinch);
		this.swipeMove(swipePosition, swipeVelocity);
	}

	gestureEnd(pinch, swipePosition, swipeVelocity) {
		this.pinchRelease(this._swiping ? 1 : pinch);
		this.swipeRelease(swipePosition, swipeVelocity);
	}

	resetPinch() {
		this.interaction(true);
		this.pinchMove(1);
	}

	pinchMove(value) {
		switch (this.state.active) {
			case "daily":
				this.state.dailyScale.setValue(value);
				break;
			case "monthly":
				this.state.monthlyScale.setValue(value);
				break;
			case "yearly":
				this.state.yearlyScale.setValue(value);
				break;
		}
	}

	pinchRelease(value) {
		this.interaction(false);
		switch (this.state.active) {
			case "daily":
				if (value <= 0.5) {
					this.dayToMonth();
					this.refs.daily.getWrappedInstance().zoomToMonth();
					this.refs.monthly.getWrappedInstance().zoomToMonth();
				} else {
					// Spring back to same day
					Animated.spring(this.state.dailyScale, {
						toValue: 1
					}).start();
				}
				break;
			case "monthly":
				if (value >= 1.5) {
					this.monthToDay();
					this.refs.monthly.getWrappedInstance().zoomToDate();
					this.refs.daily.getWrappedInstance().zoomToDate();
				} else if (value <= 0.5) {
					this.monthToYear();
					this.refs.monthly.getWrappedInstance().zoomToYear();
					this.refs.yearly.getWrappedInstance().zoomToYear();
				} else {
					// Spring back to same day
					Animated.spring(this.state.monthlyScale, {
						toValue: 1
					}).start();
				}
				break;
			case "yearly":
				if (value >= 1.5) {
					this.yearToMonth();
					this.refs.yearly.getWrappedInstance().zoomToMonth();
					this.refs.monthly.getWrappedInstance().zoomToMonth();
				} else {
					// Spring back to same day
					Animated.spring(this.state.yearlyScale, {
						toValue: 1
					}).start();
				}
				break;
		}
	}

	canNext() {
		switch (this.state.active) {
			case "yearly":
				return false;
			case "monthly":
				return moment(this.state.currentDate).month() < 11;
			case "daily":
				return moment(this.state.currentDate).isBefore(moment("2007-12-31"));
			default:
				return false;
		}
	}

	canPrevious() {
		switch (this.state.active) {
			case "yearly":
				return false;
			case "monthly":
				return moment(this.state.currentDate).month() > 0;
			case "daily":
				return moment(this.state.currentDate).isAfter(moment("2007-01-01"));
			default:
				return false;
		}
	}

	resetSwipe() {
		this.swiping = true;
	}

	swipeMove(value) {
		this.state.swipe.setValue(value);
	}

	swipeRelease(value, velocity) {
		// Swipe to next day
		if (this.canNext() && value < -(this.state.width / 3)) {
			Animated.timing(this.state.swipe, {
				toValue: -this.state.width
			}).start(() => this.next());
			// Swipe to previous day
		} else if (this.canPrevious() && value > this.state.width / 3) {
			Animated.timing(this.state.swipe, {
				toValue: this.state.width
			}).start(() => this.previous());
			// Spring back to same day
		} else {
			Animated.spring(this.state.swipe, {
				toValue: 0
			}).start(() => (this.swiping = false));
		}
	}

	interaction(value) {
		this.interacting = value;
		Animated.timing(this.state.interacting, {
			toValue: value ? 1 : 0,
			duration: 100
		}).start();
	}

	isSwiping() {
		return this.swiping;
	}

	componentWillMount() {
		const { width } = Dimensions.get("window");
		const height = 225;
		const spacing = 3;

		//		this.props.setGraphParams(width, height, spacing);

		this.swiping = false;
		this.interacting = false;
	}

	componentDidMount() {
		this.setState({
			dailyScale: this.refs.daily.getWrappedInstance().getScale(),
			monthlyScale: this.refs.monthly.getWrappedInstance().getScale(),
			yearlyScale: this.refs.yearly.getWrappedInstance().getScale()
		});

		Animated.sequence([
			Animated.timing(this.state.scaleY, { toValue: 0, duration: 500 }),
			Animated.spring(this.state.scaleY, { toValue: 1, duration: 1000 })
		]).start();
	}

	componentDidUpdate() {
		console.log("Finished rendering timeline");
	}

	render() {
		console.log("Render timeline");
		const src = require("./../../../images/antarctic_light.jpg");

		const { width, height } = this.props.graph.params;

		const displayTime = moment(this.state.currentTime);
		displayTime.minutes(Math.floor(displayTime.minutes() / 15) * 15);

		const displayDate = moment(this.state.currentDate);

		const yearly = (
			<Animated.View
				key="yearly"
				style={{
					opacity: this.state.yearOpacity,
					position: "absolute",
					top: 0,
					width
				}}
			>
				<YearlyTimeline
					ref="yearly"
					dataTouch={data => this.dataTouch(data)}
					date={this.state.currentDate}
					interacting={this.state.interacting}
					isSwiping={() => this.isSwiping()}
					interaction={value => this.interaction(value)}
				/>
			</Animated.View>
		);

		const monthly = (
			<Animated.View
				key="monthly"
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
					interacting={this.state.interacting}
					isSwiping={() => this.isSwiping()}
					interaction={value => this.interaction(value)}
				/>
			</Animated.View>
		);

		const daily = (
			<Animated.View
				key="daily"
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
					interacting={this.state.interacting}
					isSwiping={() => this.isSwiping()}
					interaction={value => this.interaction(value)}
				/>
			</Animated.View>
		);

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
					<View style={{ width }} {...this._pinchHandler}>

						<Animated.View
							style={{
								marginTop: 100,
								marginBottom: 100,
								height: 225,
								transform: [
									{ translateX: this.state.swipe },
									{ scaleY: this.state.scaleY }
								]
							}}
						>
							{[daily, monthly, yearly].sort(
								(a, b) =>
									(a.key == this.state.active ? 1 : 0) -
									(b.key == this.state.active ? 1 : 0)
							)}
						</Animated.View>
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
	setGraphParams: setParams
};

const mapStateToProps = state => ({
	graph: state.graph
});

export default connect(mapStateToProps, mapDispatchToProps)(TimelineScreen);
