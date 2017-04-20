
import React, { Component } from 'react';
import { Animated } from 'react-native';
import { connect } from 'react-redux';
import styled from 'styled-components/native';

import { findBridge } from '../../actions/bridge';
import { Button, Header, Container, Content, Text } from './../../components';
import DefaultHeader from './../DefaultHeader';

const AnimatedContainer = Animated.createAnimatedComponent(Container);

const co = require('co');
const huejay = require('huejay');

class FindBridge extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opacity: new Animated.Value(1),
      failed: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.connected && nextProps.connected) {
      setTimeout(() => {
        Animated.timing(this.state.opacity, {toValue: 0}).start(() => {
          this.props.navigateNext();
        });
      }, 1000);
    } 
    if (this.props.searching && !nextProps.searching && !nextProps.connected) {
      this.setState({ failed: true });
    }
  }

  render() {
    return (
      <AnimatedContainer style={{ opacity: this.state.opacity }}>
        <Header>
          <DefaultHeader />
        </Header>
        <Content>
          <Text>{"Great.\nLet's get everything set up.\n\nPress the push-link button of the Hue bridge you want to connect to, and tap the button below."}</Text>
          <Button
            success={this.props.connected}
            failure={this.state.failed}
            onPress={() => (this.setState({ failed: false }), this.props.findBridge())}
          >
            { this.props.connected ? "BRIDGE FOUND" : this.state.failed ? "BRIDGE NOT FOUND" : this.props.searching ? "FINDING BRIDGE..." : "FIND BRIDGE" }
          </Button>
        </Content>
      </AnimatedContainer>
    );
  }
};

FindBridge.propTypes = {
  navigateNext: React.PropTypes.func,
  findBridge: React.PropTypes.func,
};

const mapDispatchToProps = {
  findBridge,
};

const mapStateToProps = state => ({
  connected: state.bridges.state.connected,
  searching: state.bridges.state.searching,
  bridge: state.bridges.current,
});

export default connect(mapStateToProps, mapDispatchToProps)(FindBridge);
