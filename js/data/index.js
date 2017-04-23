import moment from "moment";
import { csvParse } from "d3-dsv";

import csvLoad from "./loader.js";

function daysFrom(from, to) {
	if (from.isAfter(to)) return [];

	const days = [];
	do {
		days.push(from.format("YYYY-MM-DD"));
		from.add(1, "days");
	} while (!from.isAfter(to));
	return days;
}

/* Functional, but I don't think safari does tail call optimization
const daysFrom = (from, to, array = []) =>
	(array.push(from.format("YYYY-MM-DD")), from.isSame(to)
		? array
		: daysFrom(moment(from).add(1, "d"), to, array));
*/

const rowMap = d => ({
	timestamp: new Date(d.timestamp * 1000),
	Y: +d.Y,
	x: +d.x,
	y: +d.y
});

export default (from, to) =>
	daysFrom(moment(from), moment(to))
		.map(day => csvLoad(day))
		.map(csv => csvParse(csv, rowMap))
		.reduce((result, data) => (result.push(...data), result), []);
