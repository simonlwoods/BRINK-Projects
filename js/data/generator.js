const moment = require("moment");

export default function(date) {
	const start = parseInt(moment(date).format("X"));
	const end = parseInt(moment(date).add(1, "days").format("X"));

	let data = "timestamp,Y,x,y\n";
	for (let timestamp = start; timestamp < end; timestamp += 3600) {
		//data += `${timestamp},${Math.random() * 10},${0.3051},${0.3192}\n`;
		data += `${timestamp},0,${0.3051},${0.3192}\n`;
	}
	return data;
}
