
import React, { Component } from 'react';
import { Animated } from 'react-native';
import { Text } from './../../components';
import styled from 'styled-components/native';

const StyledButton = styled.TouchableOpacity`
  align-self: center;
  width: 220;
  margin-top: 25;
  margin-bottom: 25;
`;

const Label = styled(Text)`
  font-size: 20;
  font-weight: bold;
  padding: 0;
  margin:0;
`;

const AnimatedButton = styled(Animated.View)`
  border-width: 2; 
  border-style: solid;
  border-color: white;
  border-radius: 5;
  padding-left:0;
  padding-right:0;
  padding-top: 5;
  padding-bottom: 5;
`;

class Button extends Component {
  constructor(props) {
    super(props);

    this.state = {
      successAnim: new Animated.Value(250),
    };

    if (props.success) {
      this.animation = Animated.timing(this.state.successAnim, {toValue: 500}).start();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.success && !this.props.success) {
      this.animation ? this.animation.stop() : 0;
      this.animation = Animated.timing(this.state.successAnim, {toValue: 500}).start();
    }
    if (this.props.success && !nextProps.success) {
      this.animation ? this.animation.stop() : 0;
      this.animation = Animated.timing(this.state.successAnim, {toValue: 250}).start();
    }
    if (!this.props.failure && nextProps.failure) {
      this.animation ? this.animation.stop() : 0;
      this.animation = Animated.timing(this.state.successAnim, {toValue: 0}).start();
    }
    if (this.props.failure && !nextProps.failure) {
      this.animation ? this.animation.stop() : 0;
      this.animation = Animated.timing(this.state.successAnim, {toValue: 250}).start();
    }
  }

  render() {
    const bgColor = this.state.successAnim.interpolate({
      inputRange: [0, 250, 500],
      outputRange: ['rgba(217, 83, 79, 1)', 'rgba(0, 0, 0, 1)', 'rgba(92, 184, 92, 1)']
    });
    const borderColor = this.state.successAnim.interpolate({
      inputRange: [0, 250, 500],
      outputRange: ['rgba(217, 83, 79, 1)', 'rgba(255, 255, 255, 1)', 'rgba(92, 184, 92, 1)']
    });
    return (
      <StyledButton {...this.props}>
        <AnimatedButton style={{ backgroundColor: bgColor, borderColor: borderColor }}>
          <Label>
            {this.props.children}
          </Label>
        </AnimatedButton>
      </StyledButton>
    );
  }
}

export default Button;
