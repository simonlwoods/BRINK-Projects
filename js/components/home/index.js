
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/native';

import { Button, Container, Header, Footer, Content, Text, CircledIcon } from './../../components';

const HomeContainer = styled(Container)`
  background-color: ${props => props.theme.bgColor};
`;

const Home = props => (
  <HomeContainer>
    <Header>
      <Button transparent onPress={() => props.navigation.navigate('DrawerOpen')}>
        <CircledIcon name="menu" />
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
  navigation: React.PropTypes.shape({
    navigate: React.PropTypes.func
  })
};

const mapDispatchToProps = {
};

const mapStateToProps = state => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
