
import type { Action } from './types';

export const ADD_USER = 'ADD_USER';
export const REMOVE_USER = 'REMOVE_USER';
export const SELECT_BRIDGE = 'SELECT_BRIDGE';

export function addUser(bridgeId, username):Action {
  return {
    type: ADD_USER,
    bridgeId,
    username,
  };
}

export function removeUser(bridgeId):Action {
  return {
    type: REMOVE_USER,
    bridgeId,
  };
}

export function selectBridge(bridgeId):Action {
  return {
    type: SELECT_BRIDGE,
    payload: bridgeId,
  };
}

