import type { Action } from "./types";

export function loadData(date) {
	return {
		type: "DATA_LOAD",
		date
	};
}

export function loadDataRange(start, end, draw = false) {
	return {
		type: "DATA_RANGE_LOAD",
		start,
		end,
		draw
	};
}

export function loadDataWeek(no, draw = false) {
	return {
		type: "DATA_WEEK_LOAD",
		id: "week" + no,
		week: no,
		draw
	};
}

export function loadDataMonth(no, draw = false) {
	return {
		type: "DATA_MONTH_LOAD",
		id: "month" + no,
		month: no,
		width: 1,
		noGaps: true,
		draw
	};
}

export function unloadData(date) {
	return {
		type: "DATA_UNLOAD"
	};
}
