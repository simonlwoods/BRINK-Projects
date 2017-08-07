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

export function unloadData(date) {
	return {
		type: "DATA_UNLOAD"
	};
}
