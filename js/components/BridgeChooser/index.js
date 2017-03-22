
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List, ListItem } from 'native-base';
import styled from 'styled-components/native';

import { Icon, StatusMessage, Text, View } from './../../components';
import { addUser, removeUser, selectBridge, addBridge, clearBridges } from '../../actions/bridgeChooser';

import Searching from './Searching';
import Pairing from './Pairing';

const co = require('co');
const huejay = require('huejay');

const discover = callback => co(function* () { // eslint-disable-line
  const bridges = yield huejay.discover();
  for (const bridge of bridges) {
    const client = new huejay.Client({
      host: bridge.ip,
    });
    const details = yield client.bridge.get();
    callback({
      name: details.name,
      ip: bridge.ip,
      id: bridge.id,
    });
  }
});

const pair = bridge => co(function* () { // eslint-disable-line
  const client = new huejay.Client({ host: bridge.ip });
  let user = new client.users.User; // eslint-disable-line
  user.deviceType = 'polarapp';
  user = yield client.users.create(user);
  return user.username;
});

const BridgeIcon = styled(Icon)`
    color: ${props => props.theme.brandSuccess};
    marginRight: 10;
`;

class BridgeChooser extends Component {

  static propTypes = {
    addUser: React.PropTypes.func,
    removeUser: React.PropTypes.func,
    selectBridge: React.PropTypes.func,
    addBridge: React.PropTypes.func,
    // clearBridges: React.PropTypes.func,
    bridges: React.PropTypes.shape({
      list: React.PropTypes.array,
      selectedId: React.PropTypes.string,
      users: React.PropTypes.object,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      searching: false,
      pairing: false,
      error: undefined,
      success: undefined,
    };
  }

  componentWillMount() {
    this.setState({ searching: true });

    discover(bridge => this.props.addBridge(bridge))
      .then(() => {
        this.setState({
          searching: undefined,
          error: undefined,
          success: 'Bridge search complete',
        });
      })
      .catch((error) => {
        this.setState({
          searching: undefined,
          error: error.message,
        });
      });
  }

  selectBridge(bridge) {
    if (this.state.pairing === bridge.id) {
      this.setState({ pairing: false });
    } else if (bridge.id in this.props.bridges.users) {
      const username = this.props.bridges.users[bridge.id];

      const client = new huejay.Client({ host: bridge.ip, username });
      client.bridge.isAuthenticated()
        .then(() => this.props.selectBridge(bridge.id))
        .catch(() => {
          this.props.removeUser(bridge.id);
          this.selectBridge(bridge.id);
        });
    } else {
      this.setState({ pairing: bridge.id });
    }
  }

  pair(bridge) {
    pair(bridge)
      .then((username) => {
        this.setState({
          pairing: false,
          success: 'Bridge pairing complete',
          error: undefined,
        });
        this.props.addUser(bridge.id, username);
        this.props.selectBridge(bridge.id);
      })
      .catch((error) => {
        this.setState({
          success: undefined,
          error: error.message,
        });
      });
  }

  render() {
    return (
      <View>
        <Searching searching={this.state.searching} />
        <List
          dataArray={this.props.bridges.list}
          renderRow={bridge => (
            <View key={bridge.id} button>
              <ListItem onPress={() => this.selectBridge(bridge)}>
                { this.props.bridges.selectedId === bridge.id ?
                  <BridgeIcon name="check" />
                  : null }
                <Text>{ bridge.name }</Text>
                <Text note>{ bridge.ip }</Text>
              </ListItem>
              { this.state.pairing === bridge.id ?
                <Pairing onPress={() => this.pair(bridge)} />
                : null }
            </View>
          )}
        />
        <StatusMessage type="success" status={this.state.success} />
        <StatusMessage type="error" status={this.state.error} />
      </View>
    );
  }
}

const mapDispatchToProps = {
  addUser,
  removeUser,
  selectBridge,
  addBridge,
  clearBridges,
};

const mapStateToProps = state => ({
  bridges: state.bridges,
});

export default connect(mapStateToProps, mapDispatchToProps)(BridgeChooser);
