import { InteractionManager } from "react-native";
import { scaleLinear, scaleTime } from "d3-scale";
import { area, curveStep } from "d3-shape";
import { merge, extent } from "d3-array";
import { Svg } from "expo";

const color = require("color-space");
const moment = require("moment");

const bar = (data, x, y, spacing) => {
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

const line = (data, x, y, spacing = 10) => {
	let usedPixel = -1;
	return area().x(d => d.xValue).y0(d => y(-d.Y)).y1(d => y(d.Y))(
		data.filter((d, i, data) => {
			!(i % 10);
			if (usedPixel < d.xValue) {
				usedPixel += spacing;
				return true;
			}
			return false;
		})
	);
};

const drawYearGraph = (data, xExtent, yExtent, width, height, spacing) => {
	const x = scaleTime().domain(xExtent).range([0, width]);
	const y = scaleLinear().domain(yExtent).range([0, height]);

	data = data.reduce((result, d, i) => {
		const d1 = { ...d };
		if (!result.length) {
			return [d1];
		}
		if (
			moment(d.timestamp).isAfter(
				moment(result[result.length - 1].timestamp).add(1, "day")
			)
		) {
			result[result.length - 1].Y = Math.max(0.5, result[result.length - 1].Y);
			result[result.length - 1].xValue =
				Math.round(2 * x(result[result.length - 1].timestamp)) / 2;
			d1.n = 1;
			result.push(d1);
		} else {
			const average = result[result.length - 1];
			//average.Y = (average.Y * average.n + d1.Y) / (average.n + 1);
			average.Y = Math.max(average.Y, d1.Y);
			average.x = (average.x * average.n + d1.x) / (average.n + 1);
			average.y = (average.y * average.n + d1.y) / (average.n + 1);
			average.n = average.n + 1;
			result[result.length - 1] = average;
		}
		return result;
	}, []);

	const dBar = bar(data, x, y, spacing);
	const dLine = line(data, x, y, 2);

	return { dBar, dLine, data };
};

const drawMonthGraph = (data, xExtent, yExtent, width, height, spacing) => {
	const x = scaleTime().domain(xExtent).range([0, width]);
	const y = scaleLinear().domain(yExtent).range([0, height]);

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
			result[result.length - 1].Y = Math.max(0.5, result[result.length - 1].Y);
			result[result.length - 1].xValue =
				Math.round(2 * x(result[result.length - 1].timestamp)) / 2;
			d1.n = 1;
			result.push(d1);
		} else {
			const average = result[result.length - 1];
			//average.Y = (average.Y * average.n + d1.Y) / (average.n + 1);
			average.Y = Math.max(average.Y, d1.Y);
			average.x = (average.x * average.n + d1.x) / (average.n + 1);
			average.y = (average.y * average.n + d1.y) / (average.n + 1);
			average.n = average.n + 1;
			result[result.length - 1] = average;
		}
		return result;
	}, []);

	const dBar = bar(data, x, y, spacing);
	const dLine = line(data, x, y, 2);

	return { dBar, dLine, data };
};

const drawDayGraph = (data, xExtent, yExtent, width, height, spacing) => {
	const days = moment(xExtent[1]).diff(xExtent[0], "days") + 1;

	const x = scaleTime().domain(xExtent).range([0, width * days]);
	const y = scaleLinear().domain(yExtent).range([0, height]);

	const processedData = data.map(d => ({
		...d,
		xValue: Math.round(2 * x(d.timestamp)) / 2
	}));

	const dBar = bar(processedData, x, y, spacing);
	const dLine = line(processedData, x, y);

	return { dBar, dLine, data: processedData };
};

const draw = (store, next, action) => {
	const state = store.getState();

	if (state.graph[action.id]) return next(action);

	const allData = state.data;
	const { width, height, spacing } = state.graph.params;

	if (action.id === "year") {
		let data = Object.keys(allData)
			.sort()
			.reduce((data, d) => data.concat(allData[d]), []);

		const xExtent = [data[0].timestamp, data[data.length - 1].timestamp];
		const yExtent = [-65, 65];

		const yearGraph = drawYearGraph(
			data,
			xExtent,
			yExtent,
			width,
			height,
			spacing
		);

		return next({
			type: "GRAPH_SET_YEAR_GRAPH",
			dCount: 365,
			yearGraph
		});
	} else {
		const keys = Object.keys(allData)
			.filter(x =>
				moment(x).isBetween(
					moment(action.start),
					moment(action.end),
					null,
					"[]"
				)
			)
			.sort();
		/*
			.sort((a, b) => {
				const momentA = moment(a);
				const momentB = moment(b);
				if (momentA.isBefore(momentB)) return -1;
				if (momentA.isAfter(momentB)) return 1;
				return 0;
			});
			*/

		let data = keys.reduce((data, d) => data.concat(allData[d]), []);

		const xExtent = extent(data, d => d.timestamp);
		const yExtent = [-65, 65];

		const dayGraph = drawDayGraph(
			data,
			xExtent,
			yExtent,
			width,
			height,
			spacing
		);
		const monthGraph = drawMonthGraph(
			data,
			xExtent,
			yExtent,
			width,
			height,
			spacing
		);

		return next({
			type: "GRAPH_SET_BAR_GRAPH",
			id: action.id,
			dCount: keys.length,
			monthGraph,
			dayGraph
		});
	}
};

const drawYearGraph2 = (data, xExtent, yExtent, width, height, spacing) => {
	const x = scaleTime().domain(xExtent).range([0, width]);
	const y = scaleLinear().domain(yExtent).range([0, height]);

	const processedData = data.map(d => ({
		...d,
		xValue: Math.round(2 * x(d.timestamp)) / 2
	}));

	const dBar = bar(processedData, x, y, spacing);
	const dLine = line(processedData, x, y, 2);

	return { dBar, dLine, data: processedData };
};

const drawMonthGraph2 = (data, xExtent, yExtent, width, height, spacing) => {
	const x = scaleTime().domain(xExtent).range([0, width]);
	const y = scaleLinear().domain(yExtent).range([0, height]);

	const processedData = data.map(d => ({
		...d,
		xValue: Math.round(2 * x(d.timestamp)) / 2
	}));

	const dBar = bar(processedData, x, y, spacing);
	const dLine = line(processedData, x, y, 2);

	return { dBar, dLine, data: processedData };
};

const drawDayGraph2 = (data, xExtent, yExtent, width, height, spacing) => {
	const days = moment(xExtent[1]).diff(xExtent[0], "days") + 1;

	const x = scaleTime().domain(xExtent).range([0, width * days]);
	const y = scaleLinear().domain(yExtent).range([0, height]);

	const processedData = data.map(d => ({
		...d,
		xValue: Math.round(2 * x(d.timestamp)) / 2
	}));

	const dBar = bar(processedData, x, y, spacing);
	const dLine = line(processedData, x, y);

	return { dBar, dLine, data: processedData };
};

const drawDay = (store, next, action) => {
	const state = store.getState();

	if (state.graph[action.id]) return next(action);

	const data = action.result;
	const { width, height, spacing } = state.graph.params;

	const xExtent = extent(data, d => d.timestamp);
	const yExtent = [-65, 65];

	const graph = drawDayGraph2(data, xExtent, yExtent, width, height, spacing);

	return next({
		type: "GRAPH_SET_DAY",
		id: action.id,
		graph
	});
};

const drawMonth = (store, next, action) => {
	const state = store.getState();

	if (state.graph[action.id]) return next(action);

	const data = action.result;
	const { width, height, spacing } = state.graph.params;

	const xExtent = extent(data, d => d.timestamp);
	const yExtent = [-65, 65];

	const graph = drawMonthGraph2(data, xExtent, yExtent, width, height, spacing);

	return next({
		type: "GRAPH_SET_MONTH",
		id: action.id,
		graph
	});
};

const drawYear = (store, next, action) => {
	const state = store.getState();

	if (state.graph[action.id]) return next(action);

	const data = action.result;
	const { width, height, spacing } = state.graph.params;

	const xExtent = extent(data, d => d.timestamp);
	const yExtent = [-65, 65];

	const graph = drawYearGraph2(data, xExtent, yExtent, width, height, spacing);

	return next({
		type: "GRAPH_SET_YEAR",
		id: action.id,
		graph
	});
};

export default store => next => action => {
	const state = store.getState();
	switch (action.type) {
		case "DATA_LOAD_DAY_SUCCESS":
			if (!state.graph[action.id]) {
				return drawDay(store, next, action);
			}
			break;
		case "DATA_LOAD_MONTH_SUCCESS":
			if (!state.graph[action.id]) {
				return drawMonth(store, next, action);
			}
			break;
		case "DATA_LOAD_YEAR_SUCCESS":
			if (!state.graph[action.id]) {
				return drawYear(store, next, action);
			}
			break;
		case "DATA_RANGE_LOAD_SUCCESS":
			if (!state.graph[action.id]) {
				return draw(store, next, action);
			}
			break;
		default:
			break;
	}
	return next(action);
};
