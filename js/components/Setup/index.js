
import React, { Component } from 'react';
import { Animated, View } from 'react-native';
import { connect } from 'react-redux';

import Welcome from './../Welcome';
import FindBridge from './../FindBridge';
import Home from './../home';
import TimelineScreen from './../TimelineScreen';

import theme from './../../themes/base-theme.js';

const mapDispatchToProps = { };

const mapStateToProps = state => ({
  connected: state.bridges.state.connected,
  searching: state.bridges.state.searching,
});

const FadeNavigator = config => connect(mapStateToProps, mapDispatchToProps)(
  class Setup extends Component {
    constructor(props) {
      super(props);
      this.state = {
        setup: false,
        from: 0,
        to: 0,
        opacity: Array(config.length).fill(0).map((x, i) => (i ? new Animated.Value(0) : new Animated.Value(1))),
      };
    }

    componentWillReceiveProps(nextProps) {
      if (!this.props.searching && nextProps.connected) {
        this.setState({ setup: true });
      }
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
      if (this.state.setup) return React.createElement(config[config.length-1], {});
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
  FadeNavigator([Home, TimelineScreen])
]);

export default Setup;
