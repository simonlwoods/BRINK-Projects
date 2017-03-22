
import React from 'react';
import styled from 'styled-components/native';

import { View } from './../../components';

const HeaderView = styled(View)`
  align-items: center;
`;

const Header = props => (
  <HeaderView {...props}>
    {props.children}
  </HeaderView>
);

Header.propTypes = {
  children: React.PropTypes.node,
};

export default Header;
