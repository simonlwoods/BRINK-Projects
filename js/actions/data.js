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

export function loadDataMonth(no) {
	return {
		type: "DATA_MONTH_LOAD",
		month: no
	};
}

export function loadDataYear() {
	return {
		type: "DATA_YEAR_LOAD"
	};
}

export function unloadData(date) {
	return {
		type: "DATA_UNLOAD"
	};
}

export function loadDay(month) {
	return {
		type: "DATA_LOAD_DAY",
		month: month
	};
}

export function loadMonth(month) {
	return {
		type: "DATA_LOAD_MONTH",
		month: month
	};
}

export function loadYear(year) {
	return {
		type: "DATA_LOAD_YEAR",
		year: year
	};
}
