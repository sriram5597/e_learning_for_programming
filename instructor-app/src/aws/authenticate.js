import * as AWS from 'aws-sdk/global';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails, cognito } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: "ap-south-1_k8PZf6Xlq",
    ClientId: "4feolaff5kv74p0d4vrmipdm0",
}

const REGION = "ap-south-1";
const IDENTITY_POOL_ID = "ap-south-1:953fd27a-5422-4766-a7e1-52b0aae47e05";

const userPool = new CognitoUserPool(poolData);

const createCognitoUser = (username) => {
    const userData = {
        Username: username,
        Pool: userPool,
    }

    return new CognitoUser(userData);
}

export const cognitoUserVerification = (data) => {
    const userData = {
        Username: data.username,
        Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    return new Promise( (resolve, reject) => {
        cognitoUser.confirmRegistration(data.code, true, (err, result) => {
            if(err){
                reject(err.message);
            }
    
            resolve(result);
        });
    });
}

export const cognitoResendCode = (username) => {
    const userData = {
        Username: username,
        Pool: userPool,
    }

    const cognitoUser = new CognitoUser(userData);

    return new Promise( (resolve, reject) => {
        cognitoUser.resendConfirmationCode( (err, result) => {
            if(err){console.log(err);
                reject(err.message);
            }
    
            resolve(result);
        });
    })
}

export const cognitoLogin = (data) => {
    const authenticationData = {
        Username: data.username,
        Password: data.password,
    };
    const authDetails = new AuthenticationDetails(authenticationData);

    const userData = {
        Username: data.username,
        Pool: userPool,
    }
    const cognitoUser = new CognitoUser(userData);
    
    return new Promise( (resolve, reject) => {
        cognitoUser.authenticateUser(authDetails, {
            onSuccess: 
                (result) => {
                    let tokens = {}
                    tokens['access_token'] = result.getAccessToken().getJwtToken();
                    tokens['id_token'] = result.getIdToken().getJwtToken();
                    tokens['refresh_token'] = result.getRefreshToken().getToken();


                    AWS.config.region = REGION;
                    
                    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                        IdentityPoolId: IDENTITY_POOL_ID,
                        Logins: {
                            'cognito-idp.ap-south-1.amazonaws.com/ap-south-1_k8PZf6Xlq': result.getIdToken().getJwtToken(),
                        }
                    });
                    
                    for(let i = 0; i < localStorage.length; i++){
                        if(localStorage.key(i).startsWith('Cognito')){
                            localStorage.removeItem(localStorage.key(i));
                        }
                    }

                    resolve(tokens);
                },
            
            onFailure: 
                (err) => {
                    reject(err.message);
                },
            
            newPasswordRequired: (user, required) => {
                delete user.email_verified;
                
                cognitoUser.completeNewPasswordChallenge(data.newPassword, required, {
                    onSuccess: (result) => {
                        console.log(result);
                        const res = {
                            message: 'new password',
                            result
                        }
                        resolve(res);
                    },
        
                    onFailure: (err) => {
                        console.log(err);
                        reject(err);
                    }
                });
            }
        });
    });         
}

export const cognitoLogoutUser = (username) => {
    const cognitoUser = createCognitoUser(username);
    
    return new Promise( (resolve, reject) => {
        try{
            cognitoUser.signOut();
            resolve('SUCCESS');
        }
        catch(err){
            reject(err);
        }
    });
}

export const updateAttributes = (data, username) => {
    const name = {
        Name: 'name',
        Value: data.name,
    };

    const nick = {
        Name: 'nick',
        Value: data.nickName,
    };

    const att_name = new CognitoUserAttribute(name);
    const att_nick = new CognitoUserAttribute(nick);

    const attributeList = [att_name, att_nick];

    const cognitoUser = createCognitoUser(username)

    return new Promise( (resolve, reject) => {
        cognitoUser.updateAttributes(attributeList, (err, result) => {
            if(err){
                reject(err.message);
            }
            else{
                resolve(true);
            }
        });
    });
}

export const refreshSession = (refresh_token) => {
    
}