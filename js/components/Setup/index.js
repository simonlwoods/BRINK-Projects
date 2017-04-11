
import React, { Component } from 'react';
import { Animated, View } from 'react-native';
import { connect } from 'react-redux';

import Welcome from './../Welcome';
import FindBridge from './../FindBridge';
import Home from './../home';

import theme from './../../themes/base-theme.js';

const mapDispatchToProps = { };

const mapStateToProps = state => ({
  bridge: state.bridges.current,
});

const FadeNavigator = config => connect(mapStateToProps, mapDispatchToProps)(
  class Setup extends Component {
    constructor(props) {
      super(props);
      this.state = {
        from: 0,
        to: 0,
        opacity: Array(config.length).fill(0).map((x, i) => (i ? new Animated.Value(0) : new Animated.Value(1))),
      };
    }

    navigate(index) {
      if (index < config.length && index >= 0 && index != this.state.from) {
        this.setState({ to: index });
        Animated.timing(this.state.opacity[this.state.from], {toValue: 0}).start(() => {
          Animated.timing(this.state.opacity[this.state.to], {toValue: 1}).start(() => {
            this.setState({ from: index })
          })
        })
      }
    }

    render() {
      if (this.props.bridge.user && this.state.from === this.state.to) return React.createElement(config[config.length-1], { navigateNext: () => this.navigate(idx + 1) });
      return <View style={{ flex:1, backgroundColor: theme.bgColor }}>
        { config.map((child, idx) => ((idx === this.state.from || idx === this.state.to) ?
          <Animated.View key={ idx } style={{ 
            opacity: this.state.opacity[idx],
          }}>
            { React.createElement(child, { navigateNext: () => this.navigate(idx + 1) }) }
          </Animated.View> 
          : null))
        }
      </View>
    }
  }
)

const Setup = FadeNavigator([
  Welcome,
  FindBridge,
  Home
]);

export default Setup;
