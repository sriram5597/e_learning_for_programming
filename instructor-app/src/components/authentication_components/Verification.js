import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';

//redux
import { connect } from 'react-redux';
import { verifyUser, resendCode } from '../../redux/actions/authenticationAction';

//utils
import  formValidator from '../../utils/formValidator';
import  UpdateSnackbar from '../../utils/UpdateSnackbar';

//material-ui
import { TextField, Paper, Button, InputAdornment, Typography } from '@material-ui/core';

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

    const { status } = props.auth;

    const [data, setData] = useState({
        code: "",
    });
    const [errors, setErrors] = useState({});
    const [resend, setResend] = useState(false);
    
    useEffect( () => {
        const timeout = setTimeout(() => setResend(true), 10000);

        return () => {
            clearTimeout(timeout);
        }
    }, []);

    const handleChange = (event) => {
        setData({
            ...data,
            [event.target.name]: event.target.value,
        });
    }

    const handleResend = () => {
        props.resendCode(props.match.params.username);
    }

    const handleSubmit = () => {
        const err = formValidator(data);
        setErrors(err);

        if(Object.keys(err).length === 0){
            const body = {
                ...data,
                username: props.match.params.username,
            };
            props.verifyUser(body, history);   
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
                    <Button variant="contained" color="primary" className={classes.button} onClick={handleSubmit}>
                        Verify
                    </Button>
                </form>
            </Paper>
            {
                status.name === 'resend_code' && status.status === 'SUCCESS' && (
                    <UpdateSnackbar txt="Verification Code Sent to your mail" />
                )
            }
        </div>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

const mapActionsToProps = {
    verifyUser,
    resendCode,
}

export default connect(mapStateToProps, mapActionsToProps)(Verification);