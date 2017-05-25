const initialState = {
	params: {
		width: 0,
		height: 0,
		spacing: 0
	}
};

export default function(state = initialState, action) {
	console.log(action.type);
	switch (action.type) {
		case "GRAPH_SET_BAR_GRAPH":
			return {
				...state,
				[action.id]: {
					dBar: action.dBar,
					dCount: action.dCount,
					dataForXValue: action.dataForXValue
				}
			};
		case "GRAPH_SET_PARAMS":
			return {
				...state,
				params: {
					width: action.width ? action.width : state.params.width,
					height: action.height ? action.height : state.params.height,
					spacing: action.spacing ? action.spacing : state.params.spacing
				}
			};
		default:
			return state;
	}
}
