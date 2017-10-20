import React from "react";
import styled from "styled-components/native";

import { Text, View } from "./../../components";

const SearchText = styled(Text)`
  line-height: 30;
`;

const SearchView = styled(View)`
  margin-top: 10;
  flex-direction: row;
  justify-content: center;
`;

const Searching = props =>
	(props.searching
		? <SearchView>
				<SearchText>Searching for Philips Hue bridges...</SearchText>
			</SearchView>
		: null);

Searching.propTypes = {
	searching: React.PropTypes.bool
};

export default Searching;
