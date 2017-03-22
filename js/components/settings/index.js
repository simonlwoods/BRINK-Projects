
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/native';
import { actions } from 'react-native-navigation-redux-helpers';

import { Button, Container, Header, Content, Text, Icon } from './../../components';
import BridgeChooser from './../BridgeChooser';
import { openDrawer } from './../../actions/drawer';

const {
  popRoute,
} = actions;

const SettingsContainer = styled(Container)`
  background-color: ${props => props.theme.bgColor};
`;

const Settings = props => (
  <SettingsContainer>
    <Header>
      <Button transparent onPress={() => props.popRoute(props.navigation.key)} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Icon name="chevron-with-circle-left" />
      </Button>
      <Button transparent onPress={props.openDrawer}>
        <Icon name="menu" />
      </Button>

      <Text>{(props.name) ? props.name : 'Settings'}</Text>
    </Header>

    <Content>
      <BridgeChooser />
    </Content>
  </SettingsContainer>
);

Settings.propTypes = {
  name: React.PropTypes.string,
  openDrawer: React.PropTypes.func,
  popRoute: React.PropTypes.func,
};

const mapDispatchToProps = {
  openDrawer,
  popRoute,
}

const mapStateToProps = state => ({
  name: state.user.name,
  list: state.list.list,
  navigation: state.cardNavigation,
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
