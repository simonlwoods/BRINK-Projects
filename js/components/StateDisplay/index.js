import React from "react";
import { connect } from "react-redux";
import styled from "styled-components/native";

import { View, Text } from "react-native";

import theme from "./../../themes/base-theme";

const Label = styled(Text)`
	text-align: left;
	color: ${theme.textColor};
`;
const Value = styled(Text)`
	text-align: right;
	color: ${theme.textColor};
`;

const StateDisplay = props => {
	const path = props.value.split(".");
	let value = props.state;
	for (let part of path) {
		if (typeof value !== "undefined") {
			value = value[part];
		}
	}
	value += "";
	return (
		<View style={{ flexDirection: "row", alignSelf: "stretch" }}>
			<Label>{props.text}</Label>
			<Value style={{ flexGrow: 1 }}>{value}</Value>
		</View>
	);
};

const mapDispatchToProps = {};

const mapStateToProps = state => ({
	state
});

export default connect(mapStateToProps, mapDispatchToProps)(StateDisplay);
