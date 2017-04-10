import React, { Component } from 'react';
import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

import { View, Text } from './../../components';

const { width, height } = Dimensions.get('window');

const Splash = styled.View`
  position:absolute;
  left: 0;
  right: 0;
  top:0;
  height:${() => Dimensions.get('window').height}
  background-color: ${props => props.theme.bgColor};
`;

const SplashScreen = props => (props.loading) ? (
      <Splash>
        <Text>{'Some Text'}</Text>
      </Splash>
    ) : props.children;

export default SplashScreen;
