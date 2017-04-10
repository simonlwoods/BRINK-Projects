
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/native';

import { Button, Container, Header, Content, Text, Icon, CircledIcon } from './../../components';
import BridgeChooser from './../BridgeChooser';

const SettingsContainer = styled(Container)`
  background-color: ${props => props.theme.bgColor};
`;

const Settings = props => (
  <SettingsContainer>
    <Header>
      <Button transparent onPress={() => props.navigation.goBack()} style={{ position: 'absolute', top: 0, left: 0 }}>
        <CircledIcon name="chevron-left" />
      </Button>
      <Button transparent onPress={() => props.navigation.navigate('DrawerOpen')}>
        <CircledIcon name="menu" />
      </Button>

      <Text>{'Settings'}</Text>
    </Header>

    <Content>
      <BridgeChooser />
    </Content>
  </SettingsContainer>
);

Settings.propTypes = {
  navigation: React.PropTypes.shape({
    navigate: React.PropTypes.func
  })
};

const mapDispatchToProps = {
}

const mapStateToProps = state => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
