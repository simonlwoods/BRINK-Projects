import { csvParse } from "d3-dsv";
import { InteractionManager } from "react-native";

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
		default:
			return next(action);
	}
};
