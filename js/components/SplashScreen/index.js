import React, { Component } from 'react';
import { Animated } from 'react-native';
import styled from 'styled-components/native';

import { Container, Content, Text, View } from './../../components';

const Brink = styled(Text)`
  text-align:center;
  font-size:20;
  letter-spacing:2;
`;

class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
      fadeOut: new Animated.Value(1),
      fadeIn: new Animated.Value(0),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.loading && !nextProps.loading) {
      Animated.timing(this.state.fadeOut, {toValue: 0}).start(() => {
        Animated.timing(this.state.fadeIn, {toValue: 1}).start(() => this.setState({ show: false }))
      });
    }
  }

  render() {
    return <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Animated.View style={{ opacity: this.state.fadeIn }}>
        { this.props.children }
      </Animated.View>
      {!this.state.show ? null : 
        <Animated.View style={{ opacity: this.state.fadeOut }}>
          <Container>
            <Content>
              <Brink>{'BRINK'}</Brink>
            </Content>
          </Container>
        </Animated.View>
      }
    </View>
  }
}

export default SplashScreen;
