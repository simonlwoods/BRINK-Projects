import React, { Component } from "react";
import { InteractionManager } from "react-native";
import { scaleLinear, scaleTime } from "d3-scale";
import { area } from "d3-shape";
import { merge, extent, bisector } from "d3-array";
import { Svg } from "expo";

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

export const Gradient = props => (
	<Svg.LinearGradient id={props.id} x1="0" y1="0" x2={props.width} y2="0">
		{props.data.filter((d, i, data) => !(i % pointsPerStop)).map((d, i) => {
			let rgb = color.xyy.rgb([d.x, d.y, d.Y]);
			rgb = rgb.map(x => Math.floor(x));
			return (
				<Svg.Stop
					key={d.timestamp}
					offset={i / (props.data.length / pointsPerStop) + ""}
					stopColor={`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`}
					stopOpacity={1}
				/>
			);
		})}
	</Svg.LinearGradient>
);

export const BarGraph = props => (
	<Svg.Path
		x={props.x}
		d={props.data}
		stroke={props.color}
		strokeWidth={props.spacing - 1}
		strokeOpacity={0.25}
	/>
);

export const LineGraph = props => {
	const xExtent = extent(props.data, d => d.timestamp);
	const yExtent = [-65, 65];

	const x = scaleTime().domain(xExtent).range([0, props.width]);
	const y = scaleLinear().domain(yExtent).range([0, props.height]);

	return (
		<Svg.G>
			<Svg.Defs>
				<Gradient {...props} id="gradient{props.data[0].timestamp}" />
			</Svg.Defs>
			<Svg.Path
				d={line(props.data, x, y)}
				x={props.x}
				stroke="url(#gradient{props.data[0].timestamp})"
				strokeWidth={1}
				fillOpacity={0}
			/>
		</Svg.G>
	);
};

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
