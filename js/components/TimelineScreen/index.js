
import React, { Component } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';
import { connect } from 'react-redux';
import styled from 'styled-components/native';

import { Svg } from 'expo';
import Morph from 'art/morph/path';

import exampleData from './../../data/example';
import { csvParse } from 'd3-dsv';
import { scaleLinear, scaleTime } from 'd3-scale';
import { area } from 'd3-shape';
import { extent, bisector } from 'd3-array';

import { Button, Container, Content, Text } from './../../components';

const huejay = require('huejay');

var {height, width} = Dimensions.get('window');

const data = csvParse(exampleData, function(d) {
  return {
    timestamp: new Date(d.timestamp * 1000),
    Y: +d.Y,
    x: +d.x,
    y: +d.y
  };
});

const yExtent = extent(data, d => d.Y);

const y = scaleLinear()
    .domain([-yExtent[1], yExtent[1]])
    .range([0, 150]);

const x = scaleTime()
    .domain(extent(data, d => d.timestamp))
    .range([0, width]);

const areaGraph = area()
    .x(function(d) { return x(d.timestamp); })
    .y0(function(d) { return y(-d.Y); })
    .y1(function(d) { return y(d.Y); })
    .defined(function(d,i,data) { return !(i % 6); })
//    .defined(d => d % 2); 

const d = areaGraph(data);

const Group = Animated.createAnimatedComponent(Svg.G);

class TimelineScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anim: new Animated.Value(0)
    };
    this.client = new huejay.Client({
      host: props.bridge.ip,     
      username: props.bridge.username,
    });
    this.lights = this.client.lights.getAll();
  }

  setCIE(Y, x, y) {
    console.log(Y * 10, x, y);
    this.lights.
      then(lights => {
        for (let l of lights) {
          l.brightness = Math.floor(Y * 10);
          l.xy = [x,y];
          l.transitionTime = 0.1;
          this.client.lights.save(l);
        }
      }, ()=>{});
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The guesture has started. Show visual feedback so the user knows
        // what is happening!

        // gestureState.d{x,y} will be set to zero now
        const timestamp = x.invert(gestureState.x0);
        const idx = bisector(d => d.timestamp).left(data, timestamp);
        const color = { x: data[idx].x, y: data[idx].y };
        this.setCIE(data[idx].Y, color.x, color.y);
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}

        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
      },
      onPanResponderTerminate: (evt, gestureState) => {
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        return true;
      },
    });
  }
  componentDidMount() {
    Animated.sequence([
      Animated.timing(this.state.anim, { toValue: 0, duration:1000 }),
      Animated.spring(this.state.anim, { toValue: 1, duration:1000 }),
    ]).start();
  }
  render() {
    return (
      <Container>
        <Content>
          <Animated.View 
            style={{transform: [{scaleY: this.state.anim}]}}
            {...this._panResponder.panHandlers} 
          >
            <Svg
              height="150"
              width={width}
            >
              <Svg.Path
                d={d}
                stroke="white"
                strokeWidth={2}
                fill="white"
                opacity="0.25"
              />
            </Svg>
          </Animated.View>
        </Content>
      </Container>
    );
  }
}
TimelineScreen.propTypes = {
};


const mapDispatchToProps = {
};

const mapStateToProps = state => ({
  bridge: state.bridges.current,
});

export default connect(mapStateToProps, mapDispatchToProps)(TimelineScreen);
