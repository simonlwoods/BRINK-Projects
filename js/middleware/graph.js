import { InteractionManager } from "react-native";
import { scaleLinear, scaleTime } from "d3-scale";
import { area } from "d3-shape";
import { merge, extent, bisector } from "d3-array";
import { Svg } from "expo";

const color = require("color-space");
const moment = require("moment");

// Round data to nearest pixel for tidy bar charts
const bar = (data, x, y, spacing) => {
	const usedPixel = -1;
	return area()
		.x(d => Math.round(x(d.timestamp)))
		.y0(d => y(-d.Y))
		.y1(d => y(d.Y))
		.defined((d, i, data) => {
			const pixel = Math.round(x(d.timestamp));
			if (pixel % spacing) return false;
			if (usedPixel < pixel) {
				usexPixel = pixel;
				return true;
			}
			return false;
		})(data);
};

const line = (data, x, y) =>
	area().x(d => x(d.timestamp)).y0(d => y(-d.Y)).y1(d => y(d.Y))(
		data.filter((d, i, data) => !(i % 10))
	);

const draw = (store, next, action) => {
	const state = store.getState();

	if (state.graph[action.id]) return next(action);

	const allData = state.data;
	const { width, height, spacing } = state.graph.params;

	const keys = Object.keys(allData).filter(x =>
		moment(x).isBetween(moment(action.start), moment(action.end), null, "[]")
	);
	const data = keys.reduce((data, d) => data.concat(allData[d]), []);

	const xExtent = extent(data, d => d.timestamp);
	const yExtent = [-65, 65];

	const x = scaleTime().domain(xExtent).range([0, width * keys.length]);
	const y = scaleLinear().domain(yExtent).range([0, height]);

	const d = bar(data, x, y, spacing);

	return next({
		type: "GRAPH_SET_BAR_GRAPH",
		id: action.id,
		dBar: d,
		dCount: keys.length,
		dataForXValue: xValue =>
			data[bisector(d => d.timestamp).left(data, x.invert(xValue))]
	});
};

export default store => next => action => {
	const state = store.getState();
	switch (action.type) {
		case "DATA_RANGE_LOAD_SUCCESS":
			if (action.draw && !state.graph[action.id]) {
				return draw(store, next, action);
			}
		default:
			return next(action);
	}
};
