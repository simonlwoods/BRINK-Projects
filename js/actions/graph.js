import type { Action } from "./types";

export function setParams(width, height, spacing) {
	return {
		type: "GRAPH_SET_PARAMS",
		width,
		height,
		spacing
	};
}

export function draw(start, end) {
	return {
		type: "GRAPH_DRAW",
		id: start.format() + "_" + end.format(),
		start,
		end
	};
}

export function drawWeek(no) {
	return {
		type: "GRAPH_DRAW_WEEK",
		id: "week" + no,
		week: no
	};
}

export function unloadGraph(id) {
	return {
		type: "GRAPH_UNLOAD",
		id
	};
}

export function interaction(value) {
	return {
		type: "GRAPH_INTERACTION",
		value
	};
}

export function swiping(value) {
	return {
		type: "GRAPH_SWIPING",
		value
	};
}
