
import React from 'react';
import styled from 'styled-components/native';

const View = styled.View`
  backgroundColor: ${props => (props.type === 'success' ? props.theme.brandSuccess : props.theme.brandDanger)};
`;

const Text = styled.Text`
  padding: 10;
  padding-top: 8;
  text-align: center;
  color: ${props => props.theme.inverseTextColor};
`;

const StatusMessage = props => ((!props.status) ? null : (
  <View {...props}>
    <Text>{props.status}</Text>
  </View>
));

StatusMessage.propTypes = {
  type: React.PropTypes.string,
  status: React.PropTypes.string,
};

export default StatusMessage;
