
import React from 'react';
import styled from 'styled-components/native';
import Icon from './../Icon';

const Circle = styled.View`
  width: ${props => props.theme.iconFontSize};
  height: ${props => props.theme.iconFontSize};
  border-color: ${props => props.theme.iconColor};;
  border-width: 2;
  border-radius: ${props => props.theme.iconFontSize / 2};
  align-items: center;
  justify-content: center;
`;

const SmallIcon = styled(Icon)`
  font-size: ${props => props.theme.iconFontSize - 8};
  margin-top: 1;
`;

export default props => (
  <Circle>
    <SmallIcon {...props} />
  </Circle>
);

