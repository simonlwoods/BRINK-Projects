export default function(date) {
	switch (date) {
		case "2007-02-19":
			return require("./files/2007-02-19").default;
		case "2007-02-20":
			return require("./files/2007-02-20").default;
		case "2007-02-21":
			return require("./files/2007-02-21").default;
		default:
			return "";
	}
}
