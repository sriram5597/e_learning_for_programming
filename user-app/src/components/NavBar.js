import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

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
import { MenuItem, Menu, Button, Tab, Tabs } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

//MUI Icons
import { AccountCircle } from '@material-ui/icons';
import { Home, ExploreOutlined } from '@material-ui/icons';

//utils
import TipButton from '../utils/TipButton';

const useStyles = makeStyles(theme => ({
    menuButton: {
        float: 'right'
    },
    title: {
        letterSpacing: '10px',
    },
    primary: {
        color: theme.palette.primary.main,
    },
    secondary: {
        color: theme.palette.secondary.main
    },
    root: {
        display: 'flex',
        flexGrow: 1,
    },
    link: {
        textDecoration: "none",
        fontSize: '20px',
        color: '#000',
        margin: 20,
        top: 20
    },

    activeLink: {
        textDecoration: "none",
        fontSize: '20px',
        color: theme.palette.primary.main,
        borderStyle: 'solid',
        borderWidth: '0px 0px 5px 0px',
        margin: 20,
        marginTop: '10%',
    },
}));

const NavBar = (props) => {
    const history = useHistory();

    const { authenticated, user } = props.auth;

    const username = user['cognito:username'];

    const [anchor, setAnchor] = useState();

    const open = Boolean(anchor);
    const classes = useStyles();
    const menu = ['Account', 'Logout'];

    const handleMenu = (event) => {
        setAnchor(event.currentTarget);
    }

    const handleClose = (event) => {
        setAnchor(null);
    }

    const handleMenuItem = (index) => () => {
        switch(menu[index]){
            case 'Logout':
                props.logoutUser(username, history);
                break;

            case 'Account':
                window.location.pathname = '/account-settings/';
                break;
        }
        if(menu[index] === 'Logout'){
            props.logoutUser(username, history);
            //window.location.pathname = '/login';
        }
    }

    const showUser = authenticated ? (
        <span>
            <TipButton btnClassName={classes.menuButton} onClick={handleMenu} tip="Your Account" btnColor="primary">
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
        <Button variant="outlined" color="primary" href="/login">
            Login
        </Button>
    );
    
    return (
        <AppBar position="relative" color='inherit'>
            <Toolbar className='nav-container'>
                    <div className={classes.root}>
                        <div style={{flexGrow: 1    }}>
                            <Typography variant="h3" className={classes.title}>
                                <span className={classes.primary}>
                                    ARTIK
                                </span>
                                <span className={classes.secondary}>
                                    LEARN
                                </span> 
                            </Typography>
                        </div>
                        <div style={{flexGrow: 3}}>
                            <br/>
                            <Link to="/" className={window.location.pathname === '/' ? classes.activeLink : classes.link}>
                                Home
                            </Link>
                                
                            <Link to="/courses" className={window.location.pathname === '/courses' ? classes.activeLink : classes.link}>
                                Courses
                            </Link>
                        </div>
                        { showUser }
                    </div>
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