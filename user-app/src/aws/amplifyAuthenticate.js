import { Auth } from 'aws-amplify';
import { configureAuth} from './amplifyConfig';

configureAuth();

export const loginCognitoUser = async (data) => {
    try{
        await Auth.signIn(data.username, data.password);
        
        const res = await Auth.currentSession();
        
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

export const cognitoRegisterUser = async (data) => {
    try{
        console.log(data);
        
        await Auth.signUp({
            username: data.username,
            password: data.password,
            attributes: {
                email: data.email,
                name: data.name,
                gender: data.gender
            }
        });
        return 'SUCCESS';
    }
    catch(err){
        return err;
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
        console.log("Unable to refresh token");
        throw err;
    }
}

export const cognitoCurrentSession = async () => {
    try{
        const curSession = await Auth.currentSession();

        return curSession;
    }
    catch(err){
        return err;
    }
}

export const cognitoChangePassword = async ({oldPassword, newPassword}) => {
    try{
        const currentUser = await Auth.currentAuthenticatedUser();

        console.log(currentUser);
        const data = await Auth.changePassword(currentUser, oldPassword, newPassword);
        
        return "SUCESS";
    }
    catch(err){
        console.log(err);
        return err;
    }
}

export const cognitoUpdateAttributes = async (data) => {
    try{
        const currentUser = await Auth.currentAuthenticatedUser();

        const res = await Auth.updateUserAttributes(currentUser, data);

        return res;
    }
    catch(err){
        console.log(err.response);
        return err.response.data;
    }
}

export const cognitoVerifySignUp = async (username, code) => {
    try{
        await Auth.confirmSignUp(username, code);
    }
    catch(err){
        console.log(err);
        throw err;
    }
}

export const cognitoResendCode = async (username) => {
    try{
        await Auth.resendSignUp(username);
    }
    catch(err){
        return err;
    }
}

export const cognitoVerifyUserAttribute = async (data) => {
    try{
        const res = await Auth.verifyCurrentUserAttributeSubmit(data.attr, data.value);

        console.log(res);
        return "SUCESS";
    }
    catch(err){
        console.log(err.response);
        return err.response.data;
    }
}