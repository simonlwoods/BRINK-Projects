import moment from "moment";
import { csvParse } from "d3-dsv";

import csvLoad from "./loader.js";
import fileLoad from "./file-loader.js";

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
	timestamp: moment.unix(d.timestamp),
	Y: +d.Y,
	x: +d.x,
	y: +d.y
});

export default (from, to) =>
	daysFrom(moment(from), moment(to))
		.map(day => csvLoad(day))
		.map(csv => csvParse(csv, rowMap))
		.reduce(
			(result, data) =>
				((result[
					moment.unix(data[0].timestamp).format("YYYY-MM-DD")
				] = data), result),
			[]
		);

export const loadDay = month => csvParse(fileLoad(month + "-day"), rowMap);
export const loadMonth = month => csvParse(fileLoad(month + "-month"), rowMap);
export const loadYear = year => csvParse(fileLoad(year + "-year"), rowMap);
