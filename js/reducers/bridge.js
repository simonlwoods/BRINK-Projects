export type State = Object;

const initialState = { lights: [], schedule: {} };

export default function(state: State = initialState, action: Action): State {
	switch (action.type) {
		case "HUE_SET_SCHEDULE_SUCCESS":
			return {
				...state,
				schedule: { start: action.start, period: action.period }
			};
		case "HUE_GET_LIGHTS_SUCCESS":
			for (let i = 0; i < action.result.length; i++) {
				const length = state.lights ? state.lights.length : 0;
				for (let j = 0; j < length; j++) {
					if (action.result[i].id === state.lights[j].id) {
						action.result[i].appState = state.lights[j].appState;
					}
				}

				if (typeof action.result[i].appState === "undefined") {
					action.result[i].appState = {
						selected: true
					};
				}
			}
			return { ...state, lights: action.result };
		case "HUE_FIND_BRIDGE_SUCCESS":
		case "SELECT_BRIDGE":
			return action.result;
		case "HUE_AUTHENTICATE_REQUEST":
			if (state == {} || action.bridge.id !== state.id) {
				return state;
			}
			return { ...state, authentication: "pending" };
		case "HUE_AUTHENTICATE_SUCCESS":
			if (state == {} || action.bridge.id !== state.id) {
				return state;
			}
			return { ...state, authentication: "success" };
		case "HUE_AUTHENTICATE_FAILURE":
			if (state == {} || action.bridge.id !== state.id) {
				return state;
			}
			return { ...state, username: undefined, authentication: "failure" };
		default:
			return state;
	}
}
