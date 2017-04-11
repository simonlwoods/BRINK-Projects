import React, { Component } from 'react';
import styled from 'styled-components/native';

import { Button, Container, Content, Text } from './../../components';

const Welcome = props => (
  <Container>
    <Content>
      <Text>{"Welcome.\n\nBefore continuing let's make sure your Brink Light is plugged in and powered on."}</Text>
      <Button onPress={props.navigateNext}>LIGHT IS ON</Button>
    </Content>
  </Container>
);

Welcome.propTypes = {
  navigateNext: React.PropTypes.func
};


export default Welcome;
