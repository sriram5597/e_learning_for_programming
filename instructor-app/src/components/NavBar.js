import React, { Fragment, useState } from 'react';
import { useHistory } from 'react-router';

//styles
import { makeStyles } from '@material-ui/styles'

//css
import '../styles/App.css';

//redux
import { connect } from 'react-redux';
import { logoutUser } from '../redux/actions/authenticationAction';

//MUI
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { MenuItem, Menu, Button } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

//MUI Icons
import { AccountCircle } from '@material-ui/icons';
import { Home, ExploreOutlined, Feedback } from '@material-ui/icons';

//utils
import TipButton from '../utils/TipButton';

const useStyles = makeStyles(theme => ({
    menuButton: {
        marginLeft: 700
    },
    title: {
        letterSpacing: '10px',
        flexGrow: 1
    },
    home: {
     
    }
}))

const NavBar = (props) => {
    const history = useHistory();

    const { authenticated, user: { username } } = props.auth;

    const [anchor, setAnchor] = useState();
    const open = Boolean(anchor);
    const classes = useStyles();
    const menu = ['Profile', 'Logout'];

    const handleMenu = (event) => {
        setAnchor(event.currentTarget);
    }

    const handleClose = (event) => {
        setAnchor(null);
    }

    const handleMenuItem = (index) => () => {
        if(menu[index] === 'Logout'){
            props.logoutUser(username, history);
            //window.location.pathname = '/login';
        }
    }

    const homeRedirect = () => {
        if(window.location.pathname !== "/")
            window.location.pathname = "/";
    }

    const exploreCourse = () => {
        if(window.location.pathname !== "/courses")
            window.location.pathname = "/courses";
    }

    const getFeedbacks = () => {
        if(window.location.pathname !== "/feedbacks")
            window.location.pathname = "/feedbacks";
    }

    const showUser = authenticated ? (
        <span>
            <TipButton btnClassName={classes.menuButton} onClick={handleMenu} tip="Your Account" btnColor="inherit">
                <AccountCircle/>
            </TipButton>
            
                <Menu id="account-appbar" anchor-origin={{
                        vertical:'top',
                        horizontal: 'right'
                    }} keepMounted 
                    anchorEl={anchor}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                    }}
                    open={open}
                    onClose={handleClose}
                >
                    { menu.map( (item, index) => {
                        return <MenuItem key={index} onClick={handleMenuItem(index)}>{ item }</MenuItem>
                    })}
                </Menu>
        </span>
    ) : (
        <Button variant="outlined" color="inherit" href="/login">
            Login
        </Button>
    );
    
    return (
        <AppBar position="relative">
            <Toolbar className='nav-container'>
                    <Fragment>
                        <Typography variant="h3" className={classes.title}>
                            STACLE
                        </Typography>
                        <TipButton btnColor="inherit" btnClassName={classes.home} tip="home" onClick={homeRedirect}>
                            <Home fontSize="large"/>
                        </TipButton>
                        <TipButton btnColor="inherit" btnClassName={classes.home} tip="explore courses" onClick={exploreCourse}>
                            <ExploreOutlined fontSize="large"/>
                        </TipButton>
                        <TipButton btnColor="inherit" btnClassName={classes.home} tip="Feedbacks" onClick={getFeedbacks}>
                            <Feedback fontSize="large" />
                        </TipButton>
                        { showUser }
                    </Fragment>
            </Toolbar>
        </AppBar>
    );
}

const mapActionsToProps = {
    logoutUser
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps, mapActionsToProps)(NavBar);