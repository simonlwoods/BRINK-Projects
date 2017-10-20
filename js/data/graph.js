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

const opacity = scaleLinear().domain([0, 65]).range([0, 5]);

export const Gradient = props =>
	(console.log("Render gradient"), (
		<Svg.LinearGradient id={props.id} x1="0" y1="0" x2={props.width} y2="0">
			{Array.from(new Array(Math.ceil(props.width / 10)), (x, i) => i * 10)
				.map((x, i) => {
					const d = props.dataForXValue(x);
					if (!d) return null;
					let rgb = color.xyy.rgb([d.x, d.y, d.Y]);
					rgb = rgb.map(x => Math.floor(x));
					rgb[0] = rgb[0] || 0;
					rgb[1] = rgb[1] || 0;
					rgb[2] = rgb[2] || 0;
					return (
						<Svg.Stop
							key={d.timestamp}
							offset={x / props.width + ""}
							stopColor={`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`}
							stopOpacity={Math.min(0.5, opacity(d.Y))}
						/>
					);
				})
				.filter(x => !!x)}
		</Svg.LinearGradient>
	));

export const BarGraph = props =>
	(console.log("Render bar graph"), (
		<Svg.Path
			x={props.x}
			d={props.data}
			stroke="white"
			fill="white"
			strokeWidth={1}
			strokeOpacity={props.fill ? 0 : 0.25}
			fillOpacity={props.fill ? 0.25 : 0}
		/>
	));

export const LineGraph = props =>
	(console.log("Render line graph"), (
		<Svg.G>
			<Svg.Defs>
				<Gradient
					{...props}
					id={"gradient" + props.dataForXValue(0).timestamp}
				/>
			</Svg.Defs>
			<Svg.Path
				x={props.x}
				d={props.data}
				stroke={"url(#gradient" + props.dataForXValue(0).timestamp + ")"}
				strokeWidth={1}
				fillOpacity={0}
			/>
		</Svg.G>
	));

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
