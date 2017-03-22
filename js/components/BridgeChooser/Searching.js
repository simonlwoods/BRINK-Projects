
import React from 'react';
import { Spinner } from 'native-base';
import styled from 'styled-components/native';

import { Text, View } from './../../components';

const SearchText = styled(Text)`
  line-height: 30;
`;

const SearchView = styled(View)`
  margin-top: 10;
  flex-direction: row;
  justify-content: center;
`;

const SearchSpinner = styled(Spinner)`
    padding: 0;
    margin: 0;
    margin-right: 10;
    height: 40;
    width: 40;
`;


const Searching = props => (props.searching ? (
  <SearchView>
    <SearchSpinner />
    <SearchText>Searching for Philips Hue bridges...</SearchText>
  </SearchView>
) : null);

Searching.propTypes = {
  searching: React.PropTypes.bool,
};

export default Searching;
