import React from "react";
import { scaleLinear, scaleTime } from "d3-scale";
import { area } from "d3-shape";
import { extent, bisector } from "d3-array";
import { LinearGradient, Stop } from "react-native-svg";

const color = require("color-space");

// Round data to nearest pixel for tidy bar charts
const bar = (data, x, y, spacing) =>
	area()
		.x(d => Math.round(x(d.timestamp)))
		.y0(d => y(-d.Y))
		.y1(d => y(d.Y))
		.defined((d, i, data) => !(Math.round(x(d.timestamp)) % spacing))(data);

const line = (data, x, y) =>
	area().x(d => x(d.timestamp)).y0(d => y(-d.Y)).y1(d => y(d.Y))(
		data.filter((d, i, data) => !(i % 10))
	);

const pointsPerStop = 10;

const gradient = (data, width) => (
	<LinearGradient id="grad" x1="0" y1="0" x2={width} y2="0">
		{data.filter((d, i, data) => !(i % pointsPerStop)).map((d, i) => {
			let rgb = color.xyy.rgb([d.x, d.y, d.Y]);
			rgb = rgb.map(x => Math.floor(x));
			return (
				<Stop
					key={i / (data.length / pointsPerStop)}
					offset={i / (data.length / pointsPerStop) + ""}
					stopColor={`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`}
					stopOpacity={1}
				/>
			);
		})}
	</LinearGradient>
);

export default (data, width, height, spacing) => {
	const xExtent = extent(data, d => d.timestamp);
	const yExtent = extent(data, d => d.Y);

	const x = scaleTime().domain(xExtent).range([0, width]);
	const y = scaleLinear().domain([-yExtent[1], yExtent[1]]).range([0, height]);

	return {
		dataForXValue: xValue =>
			data[bisector(d => d.timestamp).left(data, x.invert(xValue))],
		bar: bar(data, x, y, spacing),
		line: line(data, x, y),
		gradient: gradient(data, width)
	};
};
