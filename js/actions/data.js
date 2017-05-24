import type { Action } from "./types";

export function loadData(date) {
	return {
		type: "DATA_LOAD",
		date
	};
}

export function loadDataRange(start, end, redraw = false) {
	return {
		type: "DATA_RANGE_LOAD",
		start,
		end,
		redraw
	};
}

export function loadDataWeek(no, redraw = false) {
	return {
		type: "DATA_WEEK_LOAD",
		id: "week" + no,
		week: no,
		redraw
	};
}

export function unloadData(date) {
	return {
		type: "DATA_UNLOAD"
	};
}
