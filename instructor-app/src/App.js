import React from 'react';
import jwtDecode from 'jwt-decode';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Cookie from 'react-cookies';

//grapql
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/react-hooks';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from '@apollo/link-context';

//MUI
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';

//redux
import { Provider } from 'react-redux';
import store from './redux/store';
import { SET_USER, SET_AUTHENTICATED, SET_UNAUTHENTICATED } from './redux/types';
import { refreshToken, removeAllCookies } from './redux/actions/authenticationAction';

//theme
import themeFile from './styles/theme';

//Components
import NavBar from './components/NavBar';
import Authenticate from './components/authentication_components/Authenticate';
import Home from './components/Home';
import Course from './components/course_components/Course';
import CreateCourse from './components/instructor_components/CreateCourse';
import CourseManage from './components/instructor_components/CourseManage';
import Feedbacks from './components/Feedbacks';

import AddFlowchart from './components/instructor_components/course_manage/text_content/AddFlowchart';

export const appTheme = createMuiTheme(themeFile);

const App = (props) => {
  const tokens = Cookie.select(/(accessToken|idToken)$/);
  const keys = Object.keys(tokens);
  let access_token, id_token, decodedId;
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
      store.dispatch({ type: SET_UNAUTHENTICATED });
    }
    else{
      store.dispatch({ type: SET_AUTHENTICATED});
      store.dispatch({ type: SET_USER, payload: decodedId});
      isExpired = false;
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
          authorization: ''
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
     <ApolloProvider client={client}>
       <Provider store={store}>
          <Router>
            <div>
              <NavBar/>
            </div>
            <div>
              <Switch>
                <Route exact path='/' component={Home}/>
                <Route path='/login' component={Authenticate}/>
                <Route exact path='/course/:courseId' component={Course}/>
                <Route path='/create/course' component={CreateCourse}/>
                <Route exact path='/course/:courseId/manage' component={CourseManage} />
                <Route exact path='/temp' component={AddFlowchart} />
                <Route exact path="/feedbacks" component={Feedbacks} />
                {/*<Route exact path='/mcq/:id' component={MCQ} />
                <Route path='/problem/:id/solve' component={CompileCode} />
                <Route path='/problem/:id' component={PreviewProblem} />

                <Route path='/flow-chart' component={Flowchart} />} */}
                <Route path="*">
                  <h5>
                    404 NOT FOUND
                  </h5>
                </Route>
              </Switch>
            </div>
          </Router>
        </Provider>
      </ApolloProvider>
    </MuiThemeProvider>
  
  );
}

export default App;
