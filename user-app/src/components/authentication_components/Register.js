import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';

//react-redux
import { connect } from 'react-redux';
import { registerUser } from '../../redux/actions/authenticationAction';

//utils
import  formValidator from '../../utils/formValidator';

//material-ui
import { TextField, Paper, Button, InputAdornment, Typography, CircularProgress, FormControl, FormLabel, RadioGroup, FormControlLabel , Radio

} from '@material-ui/core';

//material-ui/styles
import { makeStyles } from '@material-ui/styles';

//material-ui/icons
import { Email, Person, VpnKey } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    form: {
        textAlign: 'center',
    },

    paper: {
        position: 'relative',
        minHeight: "200px",
        marginTop: "90px",
        width: '55%',
        
        padding: 20,
    },

    textField: {
        position: 'relative',
        margin: 10,
        width: "95%"
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
    },

    error: {
        color: theme.palette.alert.main,
    },

    radioGroup: {
        display: 'flex',
    }
}));

const Register = (props) => {
    const classes = useStyles();
    const history = useHistory();

    const { status } = props.auth;

    const [data, setData] = useState({
        email: "",
        username: "",
        password:"",
    });

    const [errors, setErrors] = useState({});

    const loading = status.name === 'registerUser' && status.status === 'LOADING';
    const registerErr = status.name === 'registerUser' && status.status === 'ERROR' ? status.message : null;

    const handleChange = (event) => {
        setData({
            ...data,
            [event.target.name]: event.target.value,
        });
    }

    const handleSubmit = () => {
        const err = formValidator(data);
        setErrors(err);

        if(Object.keys(errors).length === 0){
            let user = {
                email: data.email,
                gender: data.gender,
                password: data.password,
                username: data.username,
                name: `${data.first_name} ${data.last_name}`
            }
            
            props.registerUser(user, history);
        }
    }

    return (
        <Paper className={classes.paper}>
            <Typography variant="h5" color="primary" className={classes.head}>
                Register
            </Typography>
            <form noValidate className={classes.form}>
                <TextField color='primary' name="first_name" label="First Name" 
                    className={classes.textField}
                    onChange={handleChange}
                    helperText={errors.first_name ? errors.first_name : null}
                    error={errors.first_name ? true : false}
                />
                <br/>
                <TextField color='primary' name="last_name" label="Last Name" 
                    className={classes.textField}
                    onChange={handleChange}
                    helperText={errors.last_name ? errors.last_name : null}
                    error={errors.last_name ? true : false}
                />
                <br/>

                <FormControl>
                    <FormLabel>Gender</FormLabel>
                    <RadioGroup name="gender" value={data.gender} onChange={handleChange} row={true}>
                        <FormControlLabel value="Female" control={<Radio color='primary' />} label="Female" labelPlacement="end" />
                        <FormControlLabel value="Male" control={<Radio color='primary' />} label="Male" labelPlacement="end" />
                        <FormControlLabel value="Other" control={<Radio color='primary' />} label="Other" labelPlacement="end" />
                    </RadioGroup>
                </FormControl>
                <br/>

                <TextField color='primary' name="email" label="Email" InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Email color="primary" />
                            </InputAdornment>
                        ),
                    }}
                    className={classes.textField}
                    onChange={handleChange}
                    helperText={errors.email ? errors.email : null}
                    error={errors.email ? true : false}
                />
                <br/>
                <TextField color='primary' name="username" label="Username" InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Person color="primary" />
                            </InputAdornment>
                        ),
                    }}
                    className={classes.textField}
                    onChange={handleChange}
                    helperText={errors.username ? errors.username : null}
                    error={errors.username ? true : false}
                />    
                <br/>
                <TextField color='primary' name="password" label="Password" InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <VpnKey color="primary" />
                            </InputAdornment>
                        ),
                    }}
                    className={classes.textField}
                    onChange={handleChange}
                    type="password"
                    helperText={errors.password ? errors.password : null}
                    error={errors.password ? true : false}
                />
                <br/>
                <br/>
                {
                    registerErr && (
                        <Typography variant='subtitle1' className={classes.error}>
                            {registerErr}
                        </Typography>
                    )
                }
                <Button variant="contained" color="primary" className={classes.button} onClick={handleSubmit} disabled={loading}>
                    Register
                    {
                        loading && (
                            <CircularProgress size={30} color='primary' />
                        )
                    }
                </Button>
            </form>
        </Paper>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

const mapActionsToProps = {
    registerUser,
}

export default connect(mapStateToProps, mapActionsToProps)(Register);