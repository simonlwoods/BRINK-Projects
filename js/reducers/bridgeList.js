
import type { Action } from '../actions/types';
import { ADD_BRIDGE, REMOVE_BRIDGE } from '../actions/bridgeList';
import { SELECT_BRIDGE, ADD_USER, REMOVE_USER } from '../actions/bridge';

export type State = Array;

const initialState = [];

export default function (state:State = initialState, action:Action): State {
  let bridge;
  switch (action.type) {
    case SELECT_BRIDGE:
    case ADD_BRIDGE:
      return [...state.filter(bridge => bridge.id !== action.payload.id), action.payload];
    case REMOVE_BRIDGE:
      return [...state.filter(bridge => bridge.id !== action.payload.id)];
    case ADD_USER:
      bridge = state.find(bridge => bridge.id === action.payload.id);
      return [...state.filter(bridge => bridge.id !== action.payload.id), {
          ...bridge,
          user: action.payload.username
        }];
    case REMOVE_USER:
      bridge = state.find(bridge => bridge.id === action.payload.id);
      return [...state.filter(bridge => bridge.id !== action.payload.id), {
          ...bridge,
          user: undefined
        }];
    default:
      return state;
  }
}
