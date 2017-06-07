import styled from "styled-components/native";
import React from "react";

const Text = styled.Text`
  color: ${props => props.theme.textColor};
  text-align: center;
  margin: 40 0 0 0;
	font-size: 20;
`;

export default props => <Text>{props.time.format("HH:mm")}</Text>;
