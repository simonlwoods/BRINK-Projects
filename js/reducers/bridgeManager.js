import { combineReducers } from "redux";
import bridge from "./bridge";
import bridgeList from "./bridgeList";

const initialState = {
	status: "Disconnected",
	connected: false,
	searching: false
};

function bridgeManagerState(state = initialState, action) {
	switch (action.type) {
		case "HUE_FIND_BRIDGE_REQUEST":
			return {
				...state,
				status: "Searching",
				connected: false,
				searching: true
			};
		case "HUE_FIND_BRIDGE_FAILURE":
			return {
				...state,
				status: "Disconnected",
				connected: false,
				searching: false
			};
		case "HUE_FIND_BRIDGE_SUCCESS":
			return {
				...state,
				status: "Connected",
				connected: true,
				searching: false
			};
		case "HUE_FIND_BRIDGE_SUCCESS":
		case "HUE_AUTHENTICATE_SUCCESS":
			return { ...state, status: "Connected", connected: true };
		case "HUE_AUTHENTICATE_FAILURE":
			return { ...state, status: "Disconnected", connected: false };
			break;
		default:
			return state;
	}
}

export default combineReducers({
	current: bridge,
	list: bridgeList,
	state: bridgeManagerState,
	users: (state = {}) => state
});
