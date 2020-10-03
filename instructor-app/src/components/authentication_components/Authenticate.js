import React, { useState, useEffect } from 'react';

//components
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

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
        console.log(op);
        switch(op){
            case 'FORGOT_PASSWORD':
                setComponent(<ForgotPassword switchComponent={getComponents}/>);
                break;
            
            case 'RESET_PASSWORD':
                setComponent(<ResetPassword />);
                break;

            default:
                return component;
        }
    }

    useEffect( () => {
        const temp = <Login switchComponent={getComponents} />
        setComponent(temp);
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