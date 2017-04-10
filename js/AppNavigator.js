
import { DrawerNavigator } from 'react-navigation';

import Home from './components/home';
import Settings from './components/settings'

const AppNavigator = DrawerNavigator({
  Home: {
    screen: Home,
  },
  Settings: {
    screen: Settings,
  },
}, {
  contentOptions: {
    activeTintColor: '#5f99cf',
    inactiveTintColor: '#fff',
    style: {
      flex: 1,
      backgroundColor: '#111',
      marginTop: 0,
    }
  }
});

export default AppNavigator;
