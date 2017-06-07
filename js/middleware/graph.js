import { InteractionManager } from "react-native";
import { scaleLinear, scaleTime } from "d3-scale";
import { area, curveStep } from "d3-shape";
import { merge, extent, bisector } from "d3-array";
import { Svg } from "expo";

const color = require("color-space");
const moment = require("moment");

const barGaps = (data, x, y, spacing) => {
	let usedPixel = 0;
	return area()
		.x(d => d.xValue)
		.y0(d => y(-d.Y))
		.y1(d => y(d.Y))
		.defined((d, i, data) => {
			if (usedPixel <= d.xValue) {
				usedPixel = d.xValue + spacing;
				return true;
			}
			return false;
		})(data);
};

const barNoGaps = (data, x, y, spacing) => {
	let usedPixel = -1;
	return area()
		.x(d => d.xValue)
		.y0(d => y(-d.Y))
		.y1(d => y(d.Y))
		.curve(curveStep)(
		data.filter(d => {
			if (usedPixel < d.xValue) {
				usedPixel = d.xValue;
				return true;
			}
			return false;
		})
	);
};

const bar = (data, x, y, spacing, gaps = true) =>
	(gaps ? barGaps(data, x, y, spacing) : barNoGaps(data, x, y, spacing));

const line = (data, x, y) => {
	let usedPixel = -1;
	return area().x(d => d.xValue).y0(d => y(-d.Y)).y1(d => y(d.Y))(
		data.filter((d, i, data) => {
			!(i % 10);
			if (usedPixel < d.xValue) {
				usedPixel += 10;
				return true;
			}
			return false;
		})
	);
};

const draw = (store, next, action) => {
	const state = store.getState();

	if (state.graph[action.id]) return next(action);

	const allData = state.data;
	const { width, height, spacing } = state.graph.params;

	const keys = Object.keys(allData)
		.filter(x =>
			moment(x).isBetween(moment(action.start), moment(action.end), null, "[]")
		)
		.sort((a, b) => {
			const momentA = moment(a);
			const momentB = moment(b);
			if (momentA.isBefore(momentB)) return -1;
			if (momentA.isAfter(momentB)) return 1;
			return 0;
		});

	console.log(keys);
	const data = keys.reduce((data, d) => data.concat(allData[d]), []);

	const xExtent = extent(data, d => d.timestamp);
	const yExtent = [-65, 65];

	const fullWidth = action.width ? width * action.width : width * keys.length;

	const x = scaleTime().domain(xExtent).range([0, fullWidth]);
	const y = scaleLinear().domain(yExtent).range([0, height]);

	const processedData = data.map(d => ({
		...d,
		xValue: Math.round(2 * x(d.timestamp)) / 2
	}));

	const dBar = bar(processedData, x, y, spacing, !action.noGaps);
	const dLine = line(processedData, x, y);

	return next({
		type: "GRAPH_SET_BAR_GRAPH",
		id: action.id,
		dBar,
		dLine,
		dCount: keys.length,
		dataForXValue: xValue =>
			data[bisector(d => d.xValue).left(processedData, xValue)]
	});
};

export default store => next => action => {
	const state = store.getState();
	switch (action.type) {
		case "DATA_RANGE_LOAD_SUCCESS":
			if (action.draw && !state.graph[action.id]) {
				return draw(store, next, action);
			}
			break;
		default:
			break;
	}
	return next(action);
};
