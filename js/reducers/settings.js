const initialState = {
	purgeOnStart: false
};

export default function(state = initialState, action) {
	switch (action.type) {
		case "SETTINGS_PURGE":
			return {
				...state,
				purgeOnStart: action.value
			};
		default:
			return state;
	}
}
