import "babel-register";
import { csvFormat } from "d3-dsv";
import { writeFileSync } from "fs";
import dataLoader from "./../js/data";

const moment = require("moment");

let data = dataLoader("2007-12-01", "2007-12-31");

data = Object.keys(data)
	.sort()
	.reduce((result, d) => result.concat(data[d]), []);

data = data.reduce((result, d, i) => {
	const d1 = { ...d };
	if (!result.length) {
		d1.n = 1;
		return [d1];
	}
	if (
		moment(d.timestamp).isAfter(
			moment(result[result.length - 1].timestamp).add(4, "minutes")
		)
	) {
		result[result.length - 1].Y = Math.max(0.5, result[result.length - 1].Y);
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

writeFileSync("./js/data/files/monthtest.js", csvFormat(data));
