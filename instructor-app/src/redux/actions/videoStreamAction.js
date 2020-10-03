import axios from 'axios';
import { setLoading, setFinish, setErrors } from './statusActions';
import { SET_STREAM_STATUS, SET_STREAM_URL } from '../types';

export const getStreamUrl = (video) => async (dispatch) => {
    dispatch(setLoading(SET_STREAM_STATUS, 'getStreamUrl'));

    try{
        const res = await axios.get(`/api/stream/${video}/`);

        dispatch({
            type: SET_STREAM_URL,
            payload: res.data.url,
        });
        dispatch(setFinish(SET_STREAM_STATUS, 'getStreamUrl'));
    }
    catch(err){
        dispatch(setErrors(SET_STREAM_STATUS, 'getStreamUrl', err.response.data));
    }
}

export const addSubtitle = (data, course) => async (dispatch) => {
    dispatch(setLoading(SET_STREAM_STATUS, 'addSubtitle'));

    try{
        await axios.post(`/api/stream/${course}/add-subtitle/`, data);
        dispatch(setFinish(SET_STREAM_STATUS, 'addSubtitle'));
    }
    catch(err){
        dispatch(setErrors(SET_STREAM_STATUS, 'addSubtitle', err.response.data));
    }
}

export const addThumbnail = (data, course) => async (dispatch) => {
    dispatch(setLoading(SET_STREAM_STATUS, 'addThumbnail'));

    try{
        await axios.post(`/api/stream/${course}/add-thumbnail/`, data);
        dispatch(setFinish(SET_STREAM_STATUS, 'addThumbnail'));
    }
    catch(err){
        dispatch(setErrors(SET_STREAM_STATUS, 'addThumbnail', err.response.data));
    }
}