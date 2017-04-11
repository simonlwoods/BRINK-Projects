
import _ from 'lodash';
import Expo from 'expo';
import React, { Component } from 'react';
import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

import { Header, Content, Footer, View } from './../../components';

const { width, height } = Dimensions.get('window');

const ContainerView = styled(View)`
  flex: 1;
  z-index:0;
  position: absolute;
  top: 0;
  left: 0;
  width: ${() => Dimensions.get('window').width};
  height: ${() => Dimensions.get('window').height};
  padding-top: ${Expo.Constants.statusBarHeight};
  padding-bottom: ${Expo.Constants.statusBarHeight};
  background-color: ${props => props.theme.bgColor};
`;

export default class Container extends Component {

  static propTypes = {
    children: React.PropTypes.node,
  };

  renderHeader() {
    if (Array.isArray(this.props.children)) {
      return _.find(this.props.children, item => (item && _.get(item, 'type', null) === Header));
    }

    if (this.props.children && _.get(this.props.children, 'type', null) === Header) {
      return this.props.children;
    }

    return null;
  }

  renderContent() {
    if (Array.isArray(this.props.children)) {
      return _.filter(this.props.children, item => (item && (_.get(item, 'type', null) === Content)));
    }

    if (this.props.children && this.props.children.type === Content) {
      return this.props.children;
    }

    return null;
  }

  renderFooter() {
    if (Array.isArray(this.props.children)) {
      return _.find(this.props.children, item => (item && _.get(item, 'type', null) === Footer));
    }

    if (this.props.children && this.props.children.type === Footer) {
      return this.props.children;
    }

    return null;
  }

  render() {

    return (
      <ContainerView {...this.props}>

        {this.renderHeader()}

        {this.renderContent()}

        {this.renderFooter()}

      </ContainerView>
    );
  }

}
