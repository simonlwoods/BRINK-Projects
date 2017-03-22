
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/native';

import { openDrawer } from './../../actions/drawer';
import { Button, Container, Header, Footer, Content, Text, Icon } from './../../components';

const HomeContainer = styled(Container)`
  background-color: ${props => props.theme.bgColor};
`;

const Home = props => (
  <HomeContainer>
    <Header>
      <Button transparent onPress={props.openDrawer}>
        <Icon name="menu" />
      </Button>

      <Text>Home</Text>
    </Header>

    <Content>
      <Text style={{ textAlign: 'center' }}>The home page</Text>
    </Content>

    <Footer>
      <Text>Some footer text</Text>
    </Footer>
  </HomeContainer>
);

Home.propTypes = {
  name: React.PropTypes.string,
  openDrawer: React.PropTypes.func,
};

const mapDispatchToProps = {
  openDrawer,
};

const mapStateToProps = state => ({
  navigation: state.cardNavigation,
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
