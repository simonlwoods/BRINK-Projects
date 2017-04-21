import type { Action } from "./types";

const huejay = require("huejay");
const co = require("co");

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
		color
	};
}
