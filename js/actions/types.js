
export type Action =
    { type: 'SELECT_BRIDGE', payload: number }
    | { type: 'FOUND_BRIDGE', payload: Object }
    | { type: 'CLEAR_BRIDGES' }

export type Dispatch = (action:Action | Array<Action>) => any;
export type GetState = () => Object;
export type PromiseAction = Promise<Action>;
