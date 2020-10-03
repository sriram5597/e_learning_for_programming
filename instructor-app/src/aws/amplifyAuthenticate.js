import { Auth } from 'aws-amplify';

import { configureAuth} from './amplifyConfig';

configureAuth();

export const loginCognitoUser = async (data) => {
    try{
        await Auth.signIn(data.username, data.password);
        
        await Auth.currentSession();
        
        return {
            status: 'SUCCESS',
        };
    }
    catch(err){
        if(err.code === 'NotAuthorizedException'){
            return {
                status: 'ERROR',
                message: "Invalid Password"
            }
        }
        else if(err.code === 'UserNotFoundException'){
            return {
                status: 'ERROR',
                message: 'User does not exist'
            }
        }
        else{
            return {
                status: 'ERROR',
                message: err
            }
        }
    }
}

export const logoutCognitoUser = async () => {
    try{
        await Auth.signOut();
    }
    catch(err){
        console.log(err);
    }
}

export const cognitoForgotPassword = async (username) => {
    try{
        const res = await Auth.forgotPassword(username);
        return res;
    }
    catch(err){
        throw err;
    }
}

export const cognitoResetPassword = async (username, code, newPassword) => {
    try{
        const res = await Auth.forgotPasswordSubmit(username, code, newPassword);

        console.log(res);
    }
    catch(err){
        console.log(err);
    }
}


export const cognitoRefreshSession = async () => {
    try{
        const cognitoUser = await Auth.currentAuthenticatedUser();
        const curSession = await Auth.currentSession();

        return new Promise( (resolve, reject) => {
            cognitoUser.refreshSession(curSession.getRefreshToken(), (err, session) => {
                if(err){
                     reject(err);
                }
                resolve(session);
            });
        });
    }
    catch(err){
        throw err;
    }
}