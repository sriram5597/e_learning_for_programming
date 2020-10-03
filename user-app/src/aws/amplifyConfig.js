import Amplify, { Auth } from 'aws-amplify';

export const configureAuth = () => {
    Amplify.configure({
        Auth: {
            region: "ap-south-1",
            userPoolWebClientId: "24jhkc4cthmjqpg9v9n9gfarin",
            userPoolId: "ap-south-1_bbGomRffx",

            cookieStorage: {
                domain: 'localhost',
                path: '/',
                secure: false
            },
            oauth: {
                domain: 'https://artiklearn.auth.ap-south-1.amazoncognito.com',
                scope: ['phone', 'email', 'openid'],
                redirectSignIn: 'http://localhost:3000/',
                redirectSignOut: 'http://localhost:3000/login',
                responseType: 'code'
            }
        }
    }); 

    return Auth.configure();
}
