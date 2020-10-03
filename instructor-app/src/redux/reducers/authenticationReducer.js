import { SET_AUTHENTICATED, SET_USER, SET_AUTH_STATUS, SET_UNAUTHENTICATED, } from '../types';


const initialState = {
    user: {},
    status: '',
    error: '',
    authenticated: false,
}

export default function(state = initialState, action){
    switch(action.type){
        case SET_AUTHENTICATED: 
                return {
                    ...state,
                    authenticated: true,
                }

        case SET_USER:
                return {
                    ...state,
                    user: action.payload,
                }

        case SET_AUTH_STATUS:
            return {
                ...state,
                status: action.payload,
            }

        case SET_UNAUTHENTICATED:
            return {
                ...state,
                authenticated: false,
            }
        
        default:
                return state;
    }
}