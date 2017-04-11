
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TouchableWithoutFeedback, ListView } from 'react-native';
import styled from 'styled-components/native';

import { Icon, StatusMessage, Text, View } from './../../components';
import { addUser, removeUser, selectBridge } from '../../actions/bridge';

import Searching from './Searching';
import Pairing from './Pairing';

const co = require('co');
const huejay = require('huejay');


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
    bridges: React.PropTypes.shape({
      selectedId: React.PropTypes.string,
      users: React.PropTypes.object,
    }),
  };

  constructor(props) {
    super(props);
    const dataSource = 
    this.state = {
      searching: false,
      pairing: false,
      error: undefined,
      success: undefined,
      bridges: [],
      dataSource: (new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id})),
    };
  }

  componentWillMount() {
    this.setState({ searching: true });

    const component = this;
    huejay.discover().
      then(bridges => {
        const bridgeList = component.state.bridges.slice();

        return co(function* () { // eslint-disable-line
          for (const bridge of bridges) {
            const client = new huejay.Client({
              host: bridge.ip,
            });
            const details = yield client.bridge.get();
            bridgeList.push({
              name: details.name,
              ip: bridge.ip,
              id: bridge.id,
            });
            component.setState({
              bridges: bridgeList,
              dataSource: component.state.dataSource.cloneWithRows(bridgeList),
            });
          }
        })
      }).
      then(() => {
        component.setState({
          searching: undefined,
          error: undefined,
          success: 'Bridge search complete',
        });
      })
      .catch((error) => {
        component.setState({
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
        <ListView
          dataSource={this.state.dataSource}
          renderRow={bridge => (
            <TouchableWithoutFeedback onPress={() => this.selectBridge(bridge)}>
              <View>
                <View>
                  { this.props.bridges.selectedId === bridge.id ?
                    <BridgeIcon name="check" />
                    : null }
                  <Text>{ bridge.name }</Text>
                  <Text note>{ bridge.ip }</Text>
                </View>
                { this.state.pairing === bridge.id ?
                  <Pairing onPress={() => this.pair(bridge)} />
                  : null }
              </View>
            </TouchableWithoutFeedback>
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
};

const mapStateToProps = state => ({
  bridges: state.bridges,
});

export default connect(mapStateToProps, mapDispatchToProps)(BridgeChooser);
