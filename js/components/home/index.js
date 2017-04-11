
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/native';

import { selectBridge } from './../../actions/bridge.js';

import { Button, Container, Header, Footer, Content, Text, CircledIcon } from './../../components';

const huejay = require('huejay');

const HomeContainer = styled(Container)`
  background-color: ${props => props.theme.bgColor};
`;


class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      on: false
    };
    this.client = new huejay.Client({
      host: props.bridge.ip,     
      username: props.bridge.user,
    });
    this.client.lights.getAll().
      then(lights => {
        for (let l of lights) {
          l.on = false;
          this.client.lights.save(l);
        }
      }, ()=>{});
  }

  huejayToggle() {
    this.state.on ? this.huejayOff() : this.huejayOn();
  }

  huejayOn() {
    this.client.lights.getAll().
      then(lights => {
        for (let l of lights) {
          l.on = true;
          this.client.lights.save(l);
        }
      }, ()=>{});
    this.setState({ on: true });
  }

  huejayOff() {
    this.client.lights.getAll().
      then(lights => {
        for (let l of lights) {
          l.on = false;
          this.client.lights.save(l);
        }
      }, ()=>{});
    this.setState({ on: false });
  }

  render() {
    return (
      <HomeContainer>
        <Content>
          <Text>Ready to be transported to a far away land?</Text>
          <Button onPress={() => this.huejayToggle()}>{ this.state.on ? "OFF" : "ON" }</Button>
        </Content>
      </HomeContainer>
    );
  } 
}

Home.propTypes = {
  navigation: React.PropTypes.shape({
    navigate: React.PropTypes.func
  })
};

const mapDispatchToProps = {
  selectBridge,
};

const mapStateToProps = state => ({
  bridge: state.bridges.current,
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
