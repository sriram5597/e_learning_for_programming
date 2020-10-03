import { createContext } from 'react';

export const AuthContext = createContext(null);

export const initUser = {
    authenticated: false,
    user: {},
};

export default initUser;