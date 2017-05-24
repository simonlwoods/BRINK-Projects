const initialState = [];

export default function(state = initialState, action) {
	switch (action.type) {
		case "HUE_AUTHENTICATE_SUCCESS":
			// FIXME: Add bridge to list
			return [/*...state,*/ action.bridge];
		case "HUE_AUTHENTICATE_FAILURE":
			return state.filter(bridge => bridge.id !== action.bridge.id);
		default:
			return state;
	}
}
