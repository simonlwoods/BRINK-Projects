
import { combineReducers } from 'redux';

import drawer from './drawer';
import cardNavigation from './cardNavigation';
import bridgeChooser from './bridgeChooser';
import user from './user';
import list from './list';

export default combineReducers({

  bridges: bridgeChooser,
  drawer,
  user,
  list,
  cardNavigation,

});
