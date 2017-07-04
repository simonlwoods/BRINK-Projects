import styled from "styled-components/native";
import React from "react";

const View = styled.View`
  margin: 40 0 0 0;
`;

const Text = styled.Text`
  color: ${props => props.theme.textColor};
  text-align: center;
	font-size: 20;
`;

export default props => (
	<View>
		<Text>
			{props.time.format("HH:mm")}
		</Text>
		<Text>
			{props.date.format("MMMM Do")}
		</Text>
	</View>
);
