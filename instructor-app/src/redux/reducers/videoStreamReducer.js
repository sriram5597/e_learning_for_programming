import { SET_STREAM_URL, SET_STREAM_STATUS } from '../types';

const initialState = {
    url: "",
    status: {},
}

export default function(state = initialState, action){
    switch(action.type){
        case SET_STREAM_URL:
            return {
                ...state,
                url: action.payload,
            }
        
        case SET_STREAM_STATUS:
            return {
                ...state,
                status: action.payload,
            }
        
        default: 
            return state;
    }
}