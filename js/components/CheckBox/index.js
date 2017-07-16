import React from "react";
import styled from "styled-components/native";

import { Dimensions, View, Text } from "react-native";

import theme from "./../../themes/base-theme";

const Label = styled(Text)`
	text-align: left;
	color: ${theme.textColor};
`;
const Value = styled(Text)`
	text-align: right;
	color: ${theme.textColor};
`;

export default props => (
	<View style={{ flexDirection: "row", alignSelf: "stretch" }}>
		<Label>{props.text}</Label>
		<Value style={{ flexGrow: 1 }}>{props.value ? "On" : "Off"}</Value>
	</View>
);
