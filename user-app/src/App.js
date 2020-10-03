import React, { useState } from 'react';
import jwtDecode from 'jwt-decode';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Cookie from 'react-cookies';

//graphql
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/react-hooks';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from '@apollo/link-context';

//MUI
import { createMuiTheme, MuiThemeProvider, Typography } from '@material-ui/core';

//redux
import { Provider } from 'react-redux';
import store from './redux/store';

//theme
import themeFile from './styles/theme';

//Components
import Authenticate from './components/authentication_components/Authenticate';
import Home from './components/Home';
import Course from './components/course_components/Course';
import CompileCode from './components/problem/CompileCode';
import ExploreCourse from './components/ExploreCourse';
import CurrentCourse from './components/user/CurrentCourse';
import Account from './components/user_manage/Account';
import VerifyAttribute from './components/user_manage/VerifyAttribute';
import Verification from './components/authentication_components/Verification';
import Footer from './components/Footer';

//redux
import { SET_AUTHENTICATED, SET_USER } from './redux/types';

//mui
import { Alert } from '@material-ui/lab';

import { makeStyles } from '@material-ui/styles';

export const appTheme = createMuiTheme(themeFile);

const useStyles = makeStyles( (theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  mainContent: {
    flexGrow: 1,
    minHeight: '97vh',
  }
}));

const App = (props) => {
  const classes = useStyles();
  
  const tokens = Cookie.select(/(accessToken|idToken)$/);
  const keys = Object.keys(tokens);
  let access_token, id_token;
  let decodedId;
  let isExpired = true;

  keys.forEach( (k) => {
      if(k.indexOf('accessToken') !== -1){
          access_token = Cookie.load(k);
      }
      else{
          id_token = Cookie.load(k);
      }
  });

  if(access_token && access_token !== 'undefined'){
    decodedId = jwtDecode(id_token);
    const decoded = jwtDecode(access_token);
  
    if(decoded.exp * 1000 < Date.now()){
      console.log('expired');
    }
    else{
      isExpired = false;
      store.dispatch({
        type: SET_AUTHENTICATED
      });
      store.dispatch({
        type: SET_USER,
        payload: decodedId
      });
    }
  }

  const link = createUploadLink({ uri: 'http://localhost:4000/query' });
  const authLink = setContext( (_, { headers }) => {
    if(!isExpired){
      return ({
        headers: {
          ...headers,
          authorization: access_token ? `Bearer ${access_token}` : ''
        }
      });
    }
    else{
      return {
        headers: {
          ...headers,
        }
      }
    }
  });

  const client = new ApolloClient({
    link: authLink.concat(link),
    cache: new InMemoryCache(),
  });
  
  return (
    <MuiThemeProvider theme={appTheme}>
      <Provider store={store}>
        <ApolloProvider client={client}>
          <div className={classes.root}>
            <div className={classes.mainContent}>
                <Router>
                  <div>
                    {
                      // decodedId && !decodedId.email_verified && (
                      //   <Alert variant='filled' severity='warning' elevation={6}>
                      //     <Typography variant='body1'>
                      //       <strong>
                      //         Your Email is not verified. 
                      //         <Link to={{pathname: `/account/verify/`, state: {open: true}}}>
                      //             Click Here
                      //         </Link> 
                      //         to verify
                      //       </strong>
                      //     </Typography>
                      //   </Alert>
                      // )
                    }
                  </div>
                  <div>
                    <Switch>
                      <Route exact path='/' component={Home} />
                      <Route exact path='/course/:courseId' component={Course} />
                      <Route path='/problem/:id/solve' component={CompileCode} />
                      <Route path='/courses' component={ExploreCourse} />
                      <Route path='/course/:id/resume/' component={CurrentCourse} />
                      <Route path='/account-settings/' component={Account} /> 
                      <Route path='/account/verify/' component={VerifyAttribute} />
                      <Route path="/verify/signup/" component={Verification} />
                      <Route exact path='/:op' component={Authenticate} />
                      <Route path="*">
                        <h5>
                          404 NOT FOUND
                        </h5>
                      </Route>
                    </Switch>
                  </div>
                </Router>
            </div>
            <div>
                <Footer />
            </div>
          </div>
        </ApolloProvider>
      </Provider>
    </MuiThemeProvider>
  
  );
}

export default App;
