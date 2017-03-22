
import _ from 'lodash';
import React, { Component } from 'react';
import styled from 'styled-components/native';

import { Header, Content, Footer, View } from './../../components';

const ContainerView = styled(View)`
  flex: 1;
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
