import type { Action } from "./types";

export function findBridge() {
	return {
		type: "HUE_FIND_BRIDGE"
	};
}

export function authenticate() {
	return {
		type: "HUE_AUTHENTICATE"
	};
}

export function setLights(color) {
	return {
		type: "HUE_SET_LIGHTS",
		color,
		priority: 1
	};
}

export function setSchedule(start, rebase, period = "weekly") {
	return {
		type: "HUE_SET_SCHEDULE",
		start,
		rebase,
		period
	};
}
