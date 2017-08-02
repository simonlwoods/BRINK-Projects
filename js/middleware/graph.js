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

	let data = keys.reduce((data, d) => data.concat(allData[d]), []);

	const xExtent = extent(data, d => d.timestamp);
	const yExtent = [-65, 65];

	const fullWidth = action.width ? width * action.width : width * keys.length;

	const x = scaleTime().domain(xExtent).range([0, fullWidth]);
	const y = scaleLinear().domain(yExtent).range([0, height]);

	console.log(action.id);
	const filter = 1; //action.noGaps ? 30 : 3;

	if (!action.id.indexOf("month")) {
		data = data.reduce((result, d, i) => {
			const d1 = { ...d };
			if (!result.length) {
				return [d1];
			}
			if (
				moment(d.timestamp).isAfter(
					moment(result[result.length - 1].timestamp).add(1.125, "hours")
				)
			) {
				result[result.length - 1].Y = Math.max(
					0.5,
					result[result.length - 1].Y
				);
				d1.n = 1;
				result.push(d1);
			} else {
				const average = result[result.length - 1];
				average.Y = (average.Y * average.n + d1.Y) / (average.n + 1);
				average.x = (average.x * average.n + d1.x) / (average.n + 1);
				average.y = (average.y * average.n + d1.y) / (average.n + 1);
				average.n = average.n + 1;
				result[result.length - 1] = average;
			}
			return result;
		}, []);
	}

	const processedData = data.filter((d, i) => !(i % filter)).map(d => ({
		...d,
		xValue: Math.round(2 * x(d.timestamp)) / 2
	}));

	if (!action.id.indexOf("month")) {
		console.log(processedData);
	}

	const dBar = bar(processedData, x, y, spacing, !action.noGaps);
	const dLine = line(processedData, x, y);

	const dataBisector = bisector(d => d.xValue);

	return next({
		type: "GRAPH_SET_BAR_GRAPH",
		id: action.id,
		dBar,
		dLine,
		dCount: keys.length,
		dataForXValue: xValue =>
			processedData[dataBisector.left(processedData, xValue)]
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
