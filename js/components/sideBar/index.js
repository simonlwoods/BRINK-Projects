
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List, ListItem } from 'native-base';
import styled from 'styled-components/native';

import { View, Text } from './../../components';
import navigateTo from './../../actions/sideBarNav';


const SidebarView = styled(View)`
	background-color: ${props => props.theme.bgColor};
    flex: 1;
    padding: 10;
    paddingRight: 0;
    paddingTop: 30;
`;

class SideBar extends Component {

  static propTypes = {
    navigateTo: React.PropTypes.func,
  }

  navigateTo(route) {
    this.props.navigateTo(route, 'home');
  }

  render() {
    return (
      <SidebarView>
        <List>
          <ListItem button onPress={() => this.navigateTo('home')} >
            <Text>Home</Text>
          </ListItem>
          <ListItem button onPress={() => this.navigateTo('settings')} >
            <Text>Settings</Text>
          </ListItem>
        </List>
      </SidebarView>
    );
  }
}

function bindAction(dispatch) {
  return {
    navigateTo: (route, homeRoute) => dispatch(navigateTo(route, homeRoute)),
  };
}

const mapStateToProps = state => ({
  navigation: state.cardNavigation,
});

export default connect(mapStateToProps, bindAction)(SideBar);
