const initialState = {
	bridgeStatus: {
		text: "Bridge status",
		type: "state",
		value: "bridges.state.status"
	},
	purgeOnStart: {
		text: "Delete saved data on startup",
		type: "boolean",
		value: false
	}
};

export default function(state = initialState, action) {
	switch (action.type) {
		case "SETTINGS_CHANGE":
			if (!Object.prototype.hasOwnProperty.call(state, action.setting))
				return state;
			switch (state[action.setting].type) {
				case "boolean":
					if (action.value === true || action.value === false) {
						return {
							...state,
							[action.setting]: {
								...state[action.setting],
								value: action.value
							}
						};
					}
				default:
					return state;
			}
		default:
			return state;
	}
}
