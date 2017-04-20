
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/native';

import { Header, View, Text } from './../../components';

const TimeText = styled(Text)`
  font-size: 20;
  font-weight: bold;
`;

class Clock extends Component {
  componentDidMount() {
    this.interval = setInterval(() => {
      this.forceUpdate();
    }, 1000);
  } 
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    const time = new Date();
    const timeText = `${("0" + time.getHours()).slice(-2)}:${("0" + time.getMinutes()).slice(-2)}`;
    return (
      <TimeText>{ timeText }</TimeText>
    )
  }
}

const DefaultHeader = props => (
  <View>
    <Clock />
    <Text>{ props.connected ? 'Connected' : 'Disconnected' }</Text>
  </View>
)

const mapStateToProps = state => ({
  connected: state.bridges.state.connected,
});

export default connect(mapStateToProps)(DefaultHeader);
