import React, { useState } from 'react';

//redux
import { connect } from 'react-redux';
import { updateNewPassword, updateUserAttributes } from '../../redux/actions/authenticationAction';

//components
import NavBar from '../NavBar';

//utils
import formValidator from '../../utils/formValidator';
import UpdateSnackbar from '../../utils/UpdateSnackbar';

//mui
import { Paper, Button, Typography, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Backdrop, CircularProgress } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    text: {
        position: 'relative',
        display: 'block',
        margin: 10,
    },
    content: {
        position: 'relative',
        margin: 10,
    },
    root: {
        position: 'relative',
        margin: 50,
        padding: 30,
        minHeight: '50vh'
    },
    deleteButton: {
        position: 'relative',
        margin: 10,
        float: 'right',
        backgroundColor: theme.palette.alert.main,
        color: '#fff',
        '&:hover': {
            backgroundColor: theme.palette.alert.dark,
            color: '#fff'
        }
    },
    attribute: {
        display: 'flex',
    },
    backdrop: {
        color: "#fff",
        zIndex: 4
    }
}));

const Account = (props) => {
    const classes = useStyles();

    const { user, status } = props.auth;

    const [state, setState] = useState({});
    const [open, setOpen] = useState(false);
    const [error, setError] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [password, setPassword] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    }

    const handlePassword = (e) => {
        setPassword({
            ...password,
            [e.target.name]: e.target.value
        });
    }

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleUpdateUserAttribute = (attr) => () => {
        let data = {};
        data[attr] = state[attr];

        console.log(data);
        props.updateUserAttributes(data);
    }

    const handleSubmitPassword = () => {
        const errors = formValidator(password);

        if(errors.oldPassword === "" || errors.newPassword === "" || errors.confirmPassword){
            setError(errors);
            return;
        }
        else if(errors.newPassword !== errors.confirmPassword){
            setError({
                ...error,
                confirmPassword: "Password does not match"
            });
            return;
        }

        props.updateNewPassword(password);
        setOpen(false);
    }

    return (
        <div>
            <NavBar />
            <Paper className={classes.root}>
                <div className={classes.content}>
                    <Typography variant='h6'>
                        Name
                    </Typography>
                    <TextField variant='outlined' color='primary' defaultValue={user.name} onChange={handleChange} name='name' className={classes.text} 
                        fullWidth
                    />
                    <Button variant='contained' color='primary' onClick={handleUpdateUserAttribute('name')}>
                        Update
                    </Button>
                </div>
                <div className={classes.content}>
                    <Typography variant='h6'>
                        Email
                    </Typography>
                    <TextField variant='outlined' color='primary' defaultValue={user.email} onChange={handleChange} name='email' className={classes.text} 
                        fullWidth
                    />
                    <Button variant='contained' color='primary' onClick={handleUpdateUserAttribute('email')}>
                        Update
                    </Button>
                </div>
                
                <div className={classes.content}>
                    <Typography variant='h6'>
                        Password
                    </Typography>
                    <Button color='primary' onClick={handleOpen}>
                        Change Password
                    </Button>
                </div>
                <div>
                    <Button className={classes.deleteButton} variant='contained'>
                        Delete Account
                    </Button>
                </div>
            </Paper>
            
            <Dialog maxWidth="md" fullWidth open={open} onClose={handleClose}>
                <DialogTitle>
                    <Typography color='primary'>
                        Update Password
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <TextField variant='outlined' className={classes.text} name='oldPassword' color='primary' label='Old Password' 
                        placeholder="Enter Old Password" onChange={handlePassword} error={error.oldPassword ? true : false} fullWidth
                        helperText={error.oldPassword ? "Old Password cannt be empty" : null} type="password" className={classes.text}
                    />
                    <TextField variant='outlined' className={classes.text} name='newPassword' color='primary' label='New Password' 
                        placeholder="Enter New Password" onChange={handlePassword} error={error.newPassword ? true : false} fullWidth
                        helperText={error.newPassword ? "New Password cannt be empty" : null} type='password' className={classes.text}
                    />
                    <TextField variant='outlined' className={classes.text} name='confirmPassword' color='primary' label='Confirm Password' 
                        placeholder="Re-Enter New Password" onChange={handlePassword} error={error.confirmPassword  ? true : false} fullWidth
                        helperText={error.confirmPassword ? " Password does not match" : null} type='password' className={classes.text}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' color='primary' onClick={handleSubmitPassword}>
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            <UpdateSnackbar msg="Password Updated" status="SUCCESS" open={status.name === 'updateNewPassword' && status.status === 'FINISHED'} />
            <UpdateSnackbar msg={status.message} status="ALERT" open={status.name === 'updateNewPassword' && status.status === 'ERROR'} />
            <UpdateSnackbar msg="Details Updated" status="SUCCESS" open={status.name === 'updateAttributes' && status.status === 'FINISHED'} />
            <UpdateSnackbar msg={status.message} status="ALERT" open={status.name === 'updateAttributes' && status.status === 'ERROR'} />

            <Backdrop open={status.name === 'updateAttributes' && status.status === 'LOADING'} className={classes.backdrop}>
                <CircularProgress size={50} color='primary' />
            </Backdrop>
        </div>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth
});

const mapActionsToProps = {
    updateNewPassword,
    updateUserAttributes,
}

export default connect(mapStateToProps, mapActionsToProps)(Account);