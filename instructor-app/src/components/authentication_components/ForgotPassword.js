import React, { useState } from 'react';

//redux
import { connect } from 'react-redux';
import { forgotPassword } from '../../redux/actions/authenticationAction';

//mui
import { Paper, TextField, Button, Typography, CircularProgress } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
    form: {
        textAlign: 'center',
    },

    paper: {
        minHeight: "200px",
        marginTop: "90px",
        minWidth: "800px",
        padding: 20
    },

    textField: {
        position: 'relative',
        margin: 10,
        width: "500px"
    },

    button: {
        marginTop: 10,
        position: 'relative',
        marginBottom:10
    },

    progress: {
        position: 'absolute',
    },

    status: {
        color: theme.palette.alert.main,
    },

    line: {
        width: '50%',
    }
}));

const ForgotPassword = (props) => {
    const classes = useStyles();

    const { status } = props.auth;

    const [username, setUsername] = useState();
    const [error, setError] = useState();

    const handleChange = (e) => {
        setUsername(e.target.value);
    }

    const handleReset = () => {
        if(!username){
            setError('Username cannot be empty');
            return;
        }

        props.forgotPassword(username);
    }

    return (
        <div>
            {
                (status.name === 'forgotPassword' && status.status === 'FINISHED') && (
                    props.switchComponent('RESET_PASSWORD')
                )
            }
            <Paper className={classes.paper}>
                <Typography variant="h5" color="primary">
                    Password Reset
                </Typography>
                <Typography variant='subtitle1'>
                    Enter your username to reset your password
                </Typography>
                <TextField variant="outlined" color='primary' onChange={handleChange} className={classes.textField} error={error ? true : false}
                        helperText={error ? error : null}
                />
                <br/>
                <Button variant='contained' color='primary' onClick={handleReset} className={classes.button} 
                        disabled={status.name === 'forgotPassword' && status.staus === 'LOADING'}
                >
                    Send Code
                    {
                        (status.name === 'forgotPassword' && status.staus === 'LOADING') && (
                            <CircularProgress className={classes.progress} color="primary" />
                        )
                    }
                </Button>
            </Paper>
        </div>
    )
}

const mapActionsToProps = {
    forgotPassword
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps, mapActionsToProps)(ForgotPassword);