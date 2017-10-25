import { csvParse } from "d3-dsv";
import { InteractionManager } from "react-native";

import { loadDay, loadMonth, loadYear } from "./../data";
import csvLoad from "./../data/loader";
import { loadData } from "./../actions/data";

const moment = require("moment");
const co = require("co");

function dataLoad(store, next, action) {
	const key = moment(action.date).format("YYYY-MM-DD");
	const data = store.getState().data;
	if (Object.prototype.hasOwnProperty.call(data, key)) {
		return Promise.resolve(data[key]);
	}

	return next({
		...action,
		types: [
			`${action.type}_REQUEST`,
			`${action.type}_SUCCESS`,
			`${action.type}_FAILURE`
		],
		promise: () =>
			new Promise((resolve, reject) => {
				InteractionManager.runAfterInteractions(() => {
					const rowMap = d => ({
						timestamp: new Date(d.timestamp * 1000),
						Y: +d.Y,
						x: +d.x,
						y: +d.y
					});

					const key = moment(action.date).format("YYYY-MM-DD");
					const data = csvParse(csvLoad(key), rowMap);

					if (data) {
						resolve(data);
					}
				});
			})
	});
}

function dataRangeLoad(store, next, action) {
	const state = store.getState();
	if (state.graph[action.id]) return Promise.resolve();
	return co(function*() {
		const start = moment(action.start);
		const end = moment(action.end);

		let current = moment(start);
		while (current.isBefore(end) || current.isSame(end)) {
			yield dataLoad(store, next, loadData(current));
			current.add(1, "days");
		}

		action.type = action.successType
			? action.successType
			: "DATA_RANGE_LOAD_SUCCESS";
		next(action);
	});
}

function dataMonthLoad(store, next, action) {
	const jan1st = moment("2007-01-01");
	action.id = "month" + action.month;
	action.start = moment(jan1st).month(action.month);
	console.log(action.start.format("YYYY-MM-DD"));
	action.end = moment(jan1st).month(action.month + 1).subtract(1, "days");
	console.log(action.end.format("YYYY-MM-DD"));
	return dataRangeLoad(store, next, action);
}

function dataYearLoad(store, next, action) {
	action.id = "year";
	action.start = moment("2007-01-01");
	action.end = moment("2007-12-31");
	return dataRangeLoad(store, next, action);
}

function dataLoadYear(store, next, action) {
	const key = action.year;
	action.id = key + "-year";
	if (store.getState().graph[action.id]) return Promise.resolve();
	const data = store.getState().data;
	if (Object.prototype.hasOwnProperty.call(data, key)) {
		return Promise.resolve(data[key]);
	}

	return next({
		...action,
		types: [
			`${action.type}_REQUEST`,
			`${action.type}_SUCCESS`,
			`${action.type}_FAILURE`
		],
		promise: () =>
			new Promise((resolve, reject) => {
				InteractionManager.runAfterInteractions(() => {
					const data = loadYear(key);
					if (data) {
						resolve(data);
					}
				});
			})
	});
}

function dataLoadMonth(store, next, action) {
	const key = action.month;
	action.id = key + "-month";
	if (store.getState().graph[action.id]) return Promise.resolve();
	const data = store.getState().data;
	if (Object.prototype.hasOwnProperty.call(data, key)) {
		return Promise.resolve(data[key]);
	}

	return next({
		...action,
		types: [
			`${action.type}_REQUEST`,
			`${action.type}_SUCCESS`,
			`${action.type}_FAILURE`
		],
		promise: () =>
			new Promise((resolve, reject) => {
				InteractionManager.runAfterInteractions(() => {
					const data = loadMonth(key);
					if (data) {
						resolve(data);
					}
				});
			})
	});
}

function dataLoadDay(store, next, action) {
	const key = action.month;
	action.id = key + "-day";
	if (store.getState().graph[action.id]) return Promise.resolve();
	const data = store.getState().data;
	if (Object.prototype.hasOwnProperty.call(data, key)) {
		return Promise.resolve(data[key]);
	}

	return next({
		...action,
		types: [
			`${action.type}_REQUEST`,
			`${action.type}_SUCCESS`,
			`${action.type}_FAILURE`
		],
		promise: () =>
			new Promise((resolve, reject) => {
				InteractionManager.runAfterInteractions(() => {
					const data = loadDay(key);
					if (data) {
						resolve(data);
					}
				});
			})
	});
}

export default store => next => action => {
	switch (action.type) {
		case "DATA_LOAD":
			return dataLoad(store, next, action);
		case "DATA_RANGE_LOAD":
			return dataRangeLoad(store, next, action);
		case "DATA_WEEK_LOAD":
			return dataWeekLoad(store, next, action);
		case "DATA_MONTH_LOAD":
			return dataMonthLoad(store, next, action);
		case "DATA_YEAR_LOAD":
			return dataYearLoad(store, next, action);
		case "DATA_LOAD_YEAR":
			return dataLoadYear(store, next, action);
		case "DATA_LOAD_MONTH":
			return dataLoadMonth(store, next, action);
		case "DATA_LOAD_DAY":
			return dataLoadDay(store, next, action);
		default:
			return next(action);
	}
};
