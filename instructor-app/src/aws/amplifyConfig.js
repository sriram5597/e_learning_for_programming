import Amplify, { Auth } from 'aws-amplify';

export const configureAuth = () => {
    Amplify.configure({
        Auth: {
            identyPoolId: "ap-south-1:953fd27a-5422-4766-a7e1-52b0aae47e05q",
            region: "ap-south-1",
            userPoolWebClientId: "4feolaff5kv74p0d4vrmipdm0",
            userPoolId: "ap-south-1_k8PZf6Xlq",

            cookieStorage: {
                domain: 'localhost',
                path: '/',
                secure: false
            },
            oauth: {
                domain: 'https://stacle-instructors.auth.ap-south-1.amazoncogntio.com',
                scope: ['phone', 'email', 'openid'],
                redirectSignIn: 'http://localhost:2000/',
                redirectSignOut: 'http://localhost:2000/login',
                responseType: 'code'
            }
        }
    }); 

    return Auth.configure();
}
