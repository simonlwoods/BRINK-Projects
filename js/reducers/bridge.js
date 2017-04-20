
export type State = Object;

const initialState = { };

export default function (state:State = initialState, action:Action): State {
  switch (action.type) {
    case 'HUE_FIND_BRIDGE_SUCCESS':
    case 'SELECT_BRIDGE':
      console.log(action.result);
      return action.result;
    case 'HUE_AUTHENTICATE_REQUEST': 
      if (state == {} || action.bridge.id !== state.id) {
        return state;
      }
      return { ...state, authentication: 'pending' };
    case 'HUE_AUTHENTICATE_SUCCESS': 
      if (state == {} || action.bridge.id !== state.id) {
        return state;
      }
      return { ...state, authentication: 'success' };
    case 'HUE_AUTHENTICATE_FAILURE':
      if (state == {} || action.bridge.id !== state.id) {
        return state;
      }
      return { ...state, username: undefined, authentication: 'failure' };
    default:
      return state;
  }
}
