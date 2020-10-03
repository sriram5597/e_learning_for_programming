import React, { useState, useEffect } from 'react';

//components
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Register from './Register';
import Verification from './Verification';

//mui
import { Grid } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        position: 'absolute',
        width: '60%',
        left: '15%',
        padding: 20,
    },

    form: {
        textAlign: 'center'
    }
}));

const Authenticate = (props) => {
    const classes = useStyles();

    const [component, setComponent] = useState();

    const getComponents = (op) => {
        switch(op){
            case 'password-recovery':
                setComponent(<ForgotPassword switchComponent={getComponents}/>);
                break;
            
            case 'reset-password':
                setComponent(<ResetPassword />);
                break;

            case 'login':
                setComponent(<Login />);
                break;

            case 'register':
                setComponent(<Register />);
                break;

            case 'verify-user':
                setComponent(<Verification />);
                break;

            default:
                return component;
        }
    }

    useEffect( () => {
        getComponents(props.match.params.op);
    }, []);

    return (
        <div className={classes.root}>
            <Grid container className={classes.form}>
                <Grid item sm/>

                <Grid item sm></Grid>
                    {component}
                <Grid item sm/>

            </Grid>
        </div>
    )
}



export default Authenticate;