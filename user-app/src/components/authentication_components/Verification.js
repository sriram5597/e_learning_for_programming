import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';

//redux
import { connect } from 'react-redux';
import { verifySignUp, resendCode } from '../../redux/actions/authenticationAction';

//utils
import  formValidator from '../../utils/formValidator';
import  UpdateSnackbar from '../../utils/UpdateSnackbar';

//material-ui
import { TextField, Paper, Button, InputAdornment, Typography, CircularProgress } from '@material-ui/core';

//material-ui/styles
import { makeStyles } from '@material-ui/styles';

//material-ui/icons
import { Lock } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    form: {
        textAlign: 'center',
    },

    paper: {
        position: 'relative',
        minHeight: "200px",
        marginTop: "90px",
        width: '50%',
        left: '20%',
        padding: 20,
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

    head: {
        textAlign: 'center',
    }
}))

const Verification = (props) => {
    const classes = useStyles();
    const history = useHistory();
    const location = useLocation();
    
    const query = new URLSearchParams(location.search);

    const { status } = props.auth;

    const [data, setData] = useState({
        code: "",
    });
    const [errors, setErrors] = useState({});
    const [resend, setResend] = useState(false);

    const loading = status.name === 'verifyUser' && status.status === 'LOADING';
    
    useEffect( () => {
        if(!resend){
            const timeout = setTimeout(() => setResend(true), 10000);
            console.log(query.get('username'));

            return () => {
                clearTimeout(timeout);
            }
        }
    }, [resend]);

    const handleChange = (event) => {
        setData({
            ...data,
            [event.target.name]: event.target.value,
        });
    }

    const handleResend = () => {
        props.resendCode(query.get('username'));
        setResend(false);
    }

    const handleSubmit = () => {
        const err = formValidator(data);
        setErrors(err);

        if(data.code.length > 0){
            const body = {
                ...data,
                username: query.get('username'),
            };

            props.verifySignUp(body, history);
        }
    }

    return (
        <div>
            <Paper className={classes.paper}>
                <Typography variant="h5" color="primary" className={classes.head}>
                    Verification
                </Typography>
                <form noValidate className={classes.form}>
                    <Typography variant="subtitle1">
                        Enter Your Verification code sent to your mail
                    </Typography>
                    <TextField color='primary' name="code" label="Verification Code" InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock color="primary" />
                                </InputAdornment>
                            ),
                        }}
                        className={classes.textField}
                        onChange={handleChange}
                        helperText={errors.code ? `verifiction ${errors.code}` : null}
                        error={errors.code ? true : false}
                    />
                    <br/>
                    {

                        resend && (
                            <Button variant="outlined" color='primary' onClick={handleResend}>
                                Resend Code
                            </Button>
                        )
                    }
                    <br/>
                    <Button variant="contained" color="primary" className={classes.button} onClick={handleSubmit} disabled={loading}>
                        Verify
                        {
                            loading && (
                                <CircularProgress size={30} color='primary' />
                            )
                        }
                    </Button>
                </form>
            </Paper>
            {
                status.name === 'resendCode' && status.status === 'SUCCESS' && (
                    <UpdateSnackbar msg="Verification Code Sent to your mail" status="SUCCESS" />
                )
            }
        </div>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

const mapActionsToProps = {
    verifySignUp,
    resendCode,
}

export default connect(mapStateToProps, mapActionsToProps)(Verification);