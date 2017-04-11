
import { DrawerNavigator } from 'react-navigation';

import Home, { SetupOrHome } from './components/home';
import Settings from './components/settings'
import Setup from './components/Setup';

const AppNavigator = DrawerNavigator({
  Home: {
    screen: Setup,
  },
  Settings: {
    screen: Home,
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
