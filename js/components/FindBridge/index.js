
import React, { Component } from 'react';
import { Animated } from 'react-native';
import { connect } from 'react-redux';
import styled from 'styled-components/native';

import { selectBridge } from '../../actions/bridge';
import { Button, Container, Content, Text } from './../../components';

const AnimatedContainer = Animated.createAnimatedComponent(Container);

const co = require('co');
const huejay = require('huejay');

class FindBridge extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opacity: new Animated.Value(1),
      found: false,
      searching: false,
      searchComplete: false,
    };
  }

  discover() {
    co(function* () {
      const bridges = yield huejay.discover();
      for (const bridge of bridges) {
        const client = new huejay.Client({ host: bridge.ip });
        let user = new client.users.User; // eslint-disable-line
        user.deviceType = 'polarapp';
        try {
          user = yield client.users.create(user);
        } catch (error) { console.log("Not found"); }
        if (user.username) {
          return {
            ...bridge,
            user: user.username,
          };
        }
      }
      return yield Promise.reject("No bridges found");
    }).
      then(bridge => {
        this.setState({
          found: true,
          searching: false,
          searchComplete: true,
        });
        setTimeout(() => {
          Animated.timing(this.state.opacity, {toValue: 0}).start(() => {
            this.props.navigateNext();
            this.props.selectBridge(bridge)
          });
        }, 1000);
      }, error => {
        this.setState({
          found: false,
          searching: false,
          searchComplete: true,
        });
      });
  }

  render() {
    return (
      <AnimatedContainer style={{ opacity: this.state.opacity }}>
        <Content>
          <Text>{"Great.\nLet's get everything set up.\n\nPress the push-link button of the Hue bridge you want to connect to, and tap the button below."}</Text>
          <Button success={this.state.found} onPress={() => this.discover()}>{ this.state.found ? "BRIDGE FOUND" : "FIND BRIDGE" }</Button>
        </Content>
      </AnimatedContainer>
    );
  }
};

FindBridge.propTypes = {
  navigateNext: React.PropTypes.func,
  selectBridge: React.PropTypes.func,
};

const mapDispatchToProps = {
  selectBridge,
};

const mapStateToProps = state => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(FindBridge);

