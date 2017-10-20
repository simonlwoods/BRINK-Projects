"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require("babel-register");

var _d3Dsv = require("d3-dsv");

var _fs = require("fs");

var _data = require("./../js/data");

var _data2 = _interopRequireDefault(_data);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var moment = require("moment");

var data = (0, _data2.default)("2007-12-01", "2007-12-31");

data = Object.keys(data).sort().reduce(function (result, d) {
	return result.concat(data[d]);
}, []);

data = data.reduce(function (result, d, i) {
	var d1 = _extends({}, d);
	if (!result.length) {
		d1.n = 1;
		return [d1];
	}
	if (moment(d.timestamp).isAfter(moment(result[result.length - 1].timestamp).add(4, "minutes"))) {
		result[result.length - 1].Y = Math.max(0.5, result[result.length - 1].Y);
		result[result.length - 1].n = undefined;
		d1.n = 1;
		result.push(d1);
	} else {
		var average = result[result.length - 1];
		//average.Y = (average.Y * average.n + d1.Y) / (average.n + 1);
		average.Y = Math.max(average.Y, d1.Y);
		average.x = (average.x * average.n + d1.x) / (average.n + 1);
		average.y = (average.y * average.n + d1.y) / (average.n + 1);
		average.n = average.n + 1;
		result[result.length - 1] = average;
	}

	return result;
}, []);

(0, _fs.writeFileSync)("./js/data/files/monthtest.js", (0, _d3Dsv.csvFormat)(data));

