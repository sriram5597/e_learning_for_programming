import Cookie from 'react-cookies';
import axios from 'axios';

import { SET_AUTH_STATUS, SET_AUTHENTICATED, SET_UNAUTHENTICATED } from '../types';
import { loginCognitoUser, logoutCognitoUser, cognitoForgotPassword, cognitoResetPassword, cognitoRefreshSession } from '../../aws/amplifyAuthenticate';
import { setErrors, setFinish, setLoading } from './statusActions';

const clearAuthTokens = () => {
    console.log('removinng cookies');
    Cookie.remove('access_token');
    Cookie.remove('id_token', { path: '/' });
}
/*
export const verifyUser = (data, history) => async(dispatch) => {
    try{
        const res = await cognitoUserVerification(data);
        if(res === 'SUCCESS'){
            console.log('verified');
        }
    }
    catch(err){
        dispatch(setErrors('verification', err));
    }
}

export const resendCode = (username) => async (dispatch) => {
    try{
        const res = await cognitoResendCode(username);
        if(res.CodeDeliveryDetails){
            dispatch(setFinish(SET_AUTH_STATUS, 'resendCode'));
        }
    }
    catch(err){
        dispatch(setErrors(SET_AUTH_STATUS, 'resendCode', err));
    }
}
*/
export const loginUser = (data, history) => async (dispatch) => {
    dispatch(setLoading(SET_AUTH_STATUS, 'login'));
    
    try{
        const res = await loginCognitoUser(data);
        
        if(res.status === 'SUCCESS'){
            dispatch({
                type: SET_AUTH_STATUS,
                payload: {
                    name: 'login',
                    status: 'SUCCESS',
                }
            });
            
            dispatch({
                type: SET_AUTHENTICATED,
            });
            history.push('/');
        }
        else{
            throw Error(res.message);
        }
    }
    catch(err){
        console.log(err);
        dispatch(setErrors(SET_AUTH_STATUS, 'login', err));
    }
}

export const logoutUser = (username, history) => async (dispatch) => {
    dispatch(setLoading(SET_AUTH_STATUS, 'logout'));
    
    try{
        await logoutCognitoUser();
        
        //await axios.get('/instructor/black-list/');
        dispatch({
            type: SET_AUTH_STATUS,
            payload: {
                name: 'logout',
                status: 'SUCCESS',
            }
        });

        //console.log(res.data);
        clearAuthTokens();

        dispatch({
            type: SET_UNAUTHENTICATED,
        });
        
        history.push('/login');
    }
    catch(err){
        console.log(err);
        dispatch(setErrors(SET_AUTH_STATUS, 'logout', err.message));
    }
}

export const forgotPassword = (username) => async (dispatch) => {
    dispatch(setLoading(SET_AUTH_STATUS, 'forgotPassword'));

    try{
        await cognitoForgotPassword(username);
        dispatch(setFinish(SET_AUTH_STATUS, 'forgotPassword'));
    }
    catch(err){
        dispatch(setErrors(SET_AUTH_STATUS, 'forgorPassword', 'Error'));
    }
}

export const refreshToken = (history) => async (dispatch) => {
    dispatch(setLoading(SET_AUTH_STATUS, 'refreshToken'));

    
    try{
        const res = await cognitoRefreshSession();

        console.log('refreshing...');

        console.log(res);
        window.location.reload();
    }
    catch(err){
        console.log(err);
        
        dispatch({
            type: SET_UNAUTHENTICATED,
        });

        history.push('/login');
    }
}

export const resetPassword = (username, code, newPassword) => async (dispatch) => {
    dispatch(setLoading(SET_AUTH_STATUS, 'resetPassword'));
    try{
        const res = await cognitoResetPassword(username, code, newPassword);

        console.log(res);
        dispatch(setFinish(SET_AUTH_STATUS, 'resetPassword'));
    }
    catch(err){
        dispatch(setErrors(SET_AUTH_STATUS, 'resetPassword', 'Error'));
        console.log(err);
    }
}

export const removeAllCookies = () => {
    const cookies = Cookie.loadAll();

    Object.keys(cookies).forEach( (token) => {
        Cookie.remove(token);
    });
}

/*
export const updateDetails = (data, username, history) => async (dispatch) => {
    setLoading(SET_AUTH_STATUS, 'update_auth');
    console.log(username);
    try{
        const res = await updateAttributes(data, username);
        console.log(res);
        
        if(res){
            history.push('/login');
        }
    }
    catch(err){
        dispatch(setErrors(SET_AUTH_STATUS, 'update_auth', err));
    }
}

export const updateNewPassword = (newPassword, username, history) => async (dispatch) => {
    setLoading(SET_AUTH_STATUS, 'newPassword');

    try{
        const res = await cognitoNewPassword(newPassword, username);

        console.log(res);
        setFinish(SET_AUTH_STATUS, 'newPassword');

    }
    catch(err){
        setErrors(SET_AUTH_STATUS, 'newPassword', err);
    }
}
*/