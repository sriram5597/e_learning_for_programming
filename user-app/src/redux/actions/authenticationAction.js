import Cookie from 'react-cookies';
import axios from 'axios';

import { SET_AUTH_STATUS, SET_AUTHENTICATED, SET_UNAUTHENTICATED, SET_USER } from '../types';
import { loginCognitoUser, logoutCognitoUser, cognitoForgotPassword, cognitoResetPassword, cognitoRefreshSession, cognitoCurrentSession, cognitoRegisterUser,
       cognitoChangePassword, cognitoUpdateAttributes, cognitoVerifyUserAttribute, cognitoVerifySignUp, cognitoResendCode, 
} from '../../aws/amplifyAuthenticate';
import { setErrors, setFinish, setLoading } from './statusActions';

const clearAuthTokens = () => {
    const cookies = Cookie.loadAll();

    Object.keys(cookies).forEach( (cookie) => {
        Cookie.remove(cookie);
    });

    return;
}

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
            throw res;
        }
    }
    catch(err){
        console.log(err);
        dispatch(setErrors(SET_AUTH_STATUS, 'login', err.message));
    }
}

export const registerUser = (data, history) => async (dispatch) => {
    dispatch(setLoading(SET_AUTH_STATUS, 'registerUser'));
    
    try{
        const res = await cognitoRegisterUser(data);
        console.log(res);
        if(res === 'SUCCESS'){
            dispatch({
                type: SET_AUTH_STATUS,
                payload: {
                    name: 'register',
                    status: 'SUCCESS',
                }
            });
            
            dispatch({
                type: SET_AUTHENTICATED,
            });
            history.push(`/verify/signup/?username=${data.username}`);
        }
        else{
            throw res;
        }
    }
    catch(err){
        dispatch(setErrors(SET_AUTH_STATUS, 'registerUser', err.message));
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

export const refreshToken = () => async (dispatch) => {
    dispatch(setLoading(SET_AUTH_STATUS, 'refreshToken'));

    try{
        const res = await cognitoRefreshSession();

        const tokens = Cookie.select(/(accessToken|idToken)$/);
        const keys = Object.keys(tokens);
        
        keys.forEach( (k) => {
            console.log(k);
            if(k.indexOf('accessToken') !== -1){
                console.log('access token');
                Cookie.remove(k);
                Cookie.save(k, res.getAccessToken().getJwtToken());
            }
            else if(k.indexOf('idToken') !== -1){
                Cookie.remove(k);
                Cookie.save(k, res.getIdToken().getJwtToken());
            }
        });
        dispatch({
            type: SET_UNAUTHENTICATED
        });

        window.location.reload();
        dispatch(setFinish(SET_AUTH_STATUS, 'refreshToken'));
    }
    catch(err){
        console.log(err);
        dispatch(setErrors(SET_AUTH_STATUS, 'refreshToken', err));
        dispatch({
            type: SET_UNAUTHENTICATED,
        });
        window.location.pathname = '/login';
    }
}

export const getCurrentSession = () => async (dispatch) => {
    dispatch(setLoading(SET_AUTH_STATUS, 'getCurrentSession'));

    try{
        const res = await cognitoCurrentSession();
        console.log(res);

        dispatch(setFinish(SET_AUTH_STATUS, 'getCurrentSession'));
    }
    catch(err){
        console.log(err);
    }
}

export const updateNewPassword = (data) => async (dispatch) => {
    dispatch(setLoading(SET_AUTH_STATUS, 'updateNewPassword'));

    try{
        const res = await cognitoChangePassword(data);
        
        dispatch(setFinish(SET_AUTH_STATUS, 'updateNewPassword'));
    }
    catch(err){
        dispatch(setErrors(SET_AUTH_STATUS, 'updateNewPassword'), err.message);
    }
}

export const updateUserAttributes = (data, user) => async (dispatch) => {
    dispatch(setLoading(SET_AUTH_STATUS, 'updateAttributes'));

    try{
        const res = await cognitoUpdateAttributes(data);

        const updated = {
            ...user,
        }
        updated[data.attr] = data.value;
        if(data.attr === 'email'){
            updated['email_verified'] = false;
        }

        dispatch({
            type: SET_USER,
            payload: updated
        });

        dispatch(setFinish(SET_AUTH_STATUS, 'updateAttributes'));
    }
    catch(err){
        console.log(err);
        dispatch(setErrors(SET_AUTH_STATUS, 'updateAttributes', err));
    }
}

export const verifyuserAttribute = (data) => async (dispatch) => {
    dispatch(setLoading(SET_AUTH_STATUS, 'verifyUserAttribute'));

    try{
        const res = await cognitoVerifyUserAttribute(data);

        dispatch(setFinish(SET_AUTH_STATUS, 'verifyUserAttribute'));
    }
    catch(err){
        console.log(err);
        dispatch(setErrors(SET_AUTH_STATUS, 'verifyUserAttribute'));
    }
}

export const resendCode = (username) => async (dispatch) => {
    dispatch(setLoading(SET_AUTH_STATUS, 'resendCode'));

    try{
        await resendCode(username);
        console.log('code sent');

        dispatch(setFinish(SET_AUTH_STATUS, 'resendCode'));
    }
    catch(err){
        dispatch(setErrors(SET_AUTH_STATUS, 'resendCode', err.message));
    }
}

export const verifySignUp = (data, history) => async (dispatch) => {
    dispatch(setLoading(SET_AUTH_STATUS, 'verifyUser'));

    try{
        await cognitoVerifySignUp(data.username, data.code);

        dispatch(setFinish(SET_AUTH_STATUS, 'verifyUser'));
        history.push('/login');
    }
    catch(err){
        console.log(err);
        dispatch(setErrors(SET_AUTH_STATUS, 'verifyUser', err.message));
    }
}