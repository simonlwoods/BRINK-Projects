
import type { Action } from './types';

export const ADD_BRIDGE = 'ADD_BRIDGE';
export const REMOVE_BRIDGE = 'REMOVE_BRIDGE';

export function addBridge(bridge):Action {
  return {
    type: ADD_BRIDGE,
    payload: bridge,
  };
}

export function removeBridge(bridge):Action {
  return {
    type: REMOVE_BRIDGE,
    payload: bridge,
  };
}
