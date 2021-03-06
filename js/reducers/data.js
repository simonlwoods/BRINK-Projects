const moment = require("moment");

const initialState = {};

export default function(state = initialState, action) {
	console.log(action.type, new Date());
	switch (action.type) {
		case "DATA_LOAD_DAY_SUCCESS":
		case "DATA_LOAD_MONTH_SUCCESS":
		case "DATA_LOAD_YEAR_SUCCESS":
			return {
				...state,
				[action.id]: action.result
			};
		case "DATA_LOAD_SUCCESS":
			return {
				...state,
				[moment(action.date).format("YYYY-MM-DD")]: action.result
			};
		case "DATA_RANGE_LOAD_SUCCESS":
			return state;
		case "DATA_UNLOAD":
			return (state[moment(action.date).format("YYYY-MM-DD")] = undefined);
		default:
			return state;
	}
}
