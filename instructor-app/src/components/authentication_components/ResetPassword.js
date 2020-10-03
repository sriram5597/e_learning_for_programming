import React, { useState } from 'react';

//utils
import formValidator from '../../utils/formValidator';

//redux
import { connect } from 'react-redux';
import { resetPassword } from '../../redux/actions/authenticationAction';

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

const ResetPassword = (props) => {
    const classes = useStyles();

    const { status } = props.auth;

    const [state, setState] = useState({
        code: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.names]: e.target.value,
        });
    }

    const handleReset = () => {
        setErrors(formValidator(state));
        
        if(errors.code || errors.password || errors.confirmPassword)
            return;
        
        if(state.password !== state.confirmPassword){
            setErrors({
                ...errors,
                confirmPassword: 'Password does not match'
            });
            
            return;
        }
        console.log(state);
        
        //props.forgotPassword(username);
    }

    return (
        <Paper className={classes.paper}>
            <Typography variant="h5" color="primary">
                Password Reset
            </Typography>
            <TextField variant="outlined" color='primary' name='code' onChange={handleChange} className={classes.textField} label="Verification Code"
                    error={errors.code ? true : false} helperText={errors.code ? errors.code : null}
                    placeholder="Enter Verification code"
            />
            <TextField variant="outlined" color='primary' name='password' onChange={handleChange} className={classes.textField} label="Password"
                    error={errors.password ? true : false} helperText={errors.password ? errors.password : null} placeholder="Enter Password"
            />
            <TextField variant="outlined" color='primary' name='confirmPassword' onChange={handleChange} className={classes.textField} label="Confirm Password"
                    error={errors.confirmPassword ? true : false} helperText={errors.password ? errors.confirmPassword : null} 
                    placeholder="Enter Confrim Password"
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
    )
}

const mapActionsToProps = {
    resetPassword
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps, mapActionsToProps)(ResetPassword);