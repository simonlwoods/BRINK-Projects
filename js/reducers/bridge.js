
import type { Action } from '../actions/types';
import { ADD_USER, REMOVE_USER, SELECT_BRIDGE } from '../actions/bridge';

export type State = Object;

const initialState = {};

export default function (state:State = initialState, action:Action): State {
  switch (action.type) {
    case SELECT_BRIDGE:
      if (state == {} || action.payload.id !== state.id) {
        return { ...action.payload };
      }
      return state;
    case ADD_USER:
      if (state == {} || action.payload.id !== state.id) {
        return state;
      }
      return {
        ...state,
        user: action.payload.username,
      };
    case REMOVE_USER:
      if (state == {} || action.payload.id !== state.id) {
        return state;
      }
      return {
        ...state,
        user: undefined
      };
    default:
      return state;
  }
}
