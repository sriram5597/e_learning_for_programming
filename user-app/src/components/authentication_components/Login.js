import React, { useState } from 'react';
import { useHistory } from 'react-router';
import PropTypes from 'prop-types';

//redux
import { connect } from 'react-redux';
import { loginUser } from '../../redux/actions/authenticationAction';

//util
import formValidator from '../../utils/formValidator';

//MUI
import { Typography, TextField, Button } from '@material-ui/core';
import { Paper } from '@material-ui/core';
import { CircularProgress } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

//MUI/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
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

const Login = (props) => {
    const classes = useStyles();
    const history = useHistory();

    const { status, authenticated } = props.auth;
    const loading = status.name === 'login' && status.status === 'LOADING' ? true : false;
    const error = status.name === 'login' && status.status === 'ERROR' ? status.message : null;
    
    const [state, setState] = useState({
        username: "",
        password: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (event) => {
        setState({
            ...state,
            [event.target.name]: event.target.value
        });
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        
        const err = formValidator(state);

        setErrors(err);

        if(Object.keys(err).length === 0){
            if(state.newPassword !== state.confirmPassword){
                setErrors({
                    ...errors,
                    confirmPassword: "Password does not match"
                });
                return;
            }

            const userData = {
                ...state
            }
            props.loginUser(userData, history);
        }
    }

    const handleComponent = () => {
        window.location.pathname = 'password-recovery';
    }

    const handleRegister = () => {
        window.location.pathname = 'register';
    }
    
    if(authenticated){
        window.location.pathname = '/';
    }
    
    return (
        <div>
            {
                status.name === 'login' && status.status == 'ERROR' && (
                    <Alert severity="error" variant="filled">
                        <Typography variant="body1">
                            {status.message.message}
                        </Typography>
                    </Alert>
                )
            }
            <Paper className={classes.paper}>
                <Typography variant='h4' color='primary'>Login</Typography>

                <form noValidate className={classes.form} onSubmit={handleSubmit}>
                    <TextField name='username' label='Username' value={state.username} 
                        className={classes.textField} onChange={handleChange} error={(errors.username) ? true : false}
                        helperText={errors.username}
                    /><br/>

                    <TextField name='password' type='password' label='Password' value={state.password} 
                        className={classes.textField} onChange={handleChange} error={(errors.password) ? true : false}
                        helperText={errors.password}
                    
                    /><br/>

                    <Button color="primary" onClick={handleComponent}> Forgot Password?</Button>
                    <br/><br/>
                    
                    {
                        error && (
                            <Typography variant='subtitle1' color='secondary'>
                                { typeof error !== 'object' ? `Error: ${error}`  : '' }
                            </Typography>
                        )
                    }

                    <Button type='submit' variant='contained' color='primary' disabled={loading} className={classes.button}>
                        Login
                        {loading && <CircularProgress size={30}/>}
                    </Button><br/>
                    <Typography variant='subtitle1' style={{textAlign: 'center'}}>
                        or
                    </Typography>
                    <Button onClick={handleRegister} variant='outlined' color='primary'>Register</Button>
                </form>
            </Paper>
        </div>
    );
}

Login.propTypes = {
    loginUser: PropTypes.func.isRequired,
}

const mapActionsToProps = {
    loginUser,
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps, mapActionsToProps)(Login);