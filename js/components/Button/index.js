
import React from 'react';
import { Text } from './../../components';
import styled from 'styled-components/native';

const Button = styled.TouchableOpacity`
  background-color: ${props => (props.transparent ? 'transparent' :  props.theme.btnPrimaryBg)};
  padding-left: 10;
  padding-right: 10;
  padding-top: 5;
  padding-bottom: 5;
`;

export default props => (
  <Button {...props}>
    <Text>
      {props.children}
    </Text>
  </Button>
);
