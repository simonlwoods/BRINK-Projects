
import type { Action } from '../actions/types';
import { ADD_USER, REMOVE_USER, SELECT_BRIDGE, ADD_BRIDGE, CLEAR_BRIDGES } from '../actions/bridgeChooser';

export type State = {
    list: Object
}

const initialState = {
  list: [],
  selectedId: undefined,
  users: {},
};

export default function (state:State = initialState, action:Action): State {
  switch (action.type) {
    case ADD_USER:
      return {
        ...state,
        error: undefined,
        users: {
          ...state.users,
          [action.bridgeId]: action.username,
        },
      };
    case REMOVE_USER:
      return {
        ...state,
        error: undefined,
        users: Object.keys(state.users)
          .filter(key => key !== action.bridgeId)
          .reduce((res, key) => { res[key] = state.users[key]; return res; }, {}),
      };
    case SELECT_BRIDGE:
      return {
        ...state,
        error: undefined,
        selectedId: action.payload,
        pairing: undefined,
      };
    case ADD_BRIDGE:
      return {
        ...state,
        list: [...state.list.filter(bridge => bridge.id !== action.payload.id), action.payload],
        error: undefined,
      };
    case CLEAR_BRIDGES:
      if (typeof (state.selectedId) !== 'undefined') {
        return {
          ...state,
          success: undefined,
          pairing: undefined,
          error: undefined,
          list: state.list.filter(bridge => bridge.id === state.selectedId),
        };
      }
      return initialState;
    default:
      return state;
  }
}
