import React, { Component } from "react";
import { View } from "react-native";
import { connect } from "react-redux";

import Graph from "./Graph";

import theme from "./../../themes/base-theme";

class Timeline extends Component {
	render() {
		return <Graph {...this.props} />;
	}
}

const mapDispatchToProps = {};

const mapStateToProps = state => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Timeline);
