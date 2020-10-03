import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

//redux
import { connect } from 'react-redux';
import { updateUserAttributes, verifyuserAttribute } from '../../redux/actions/authenticationAction';

//mui
import { Dialog, DialogActions, DialogTitle, DialogContent, Button, TextField } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    text: {
        position: 'relative',
        margin: 10
    }
}));

const VerifyAttribute = (props) => {
    const classes = useStyles();

    const history = useHistory();
    const location = useLocation();

    const { user, status } = props.auth;

    const [open, setOpen] = useState(false);
    const [code, setCode] = useState();
    const [error, setError] = useState();
    
    useEffect( () => {
        console.log(location.state);
        if(location.state){
            setOpen(true);
            props.updateUserAttributes({email: user.email});
        }
    }, [location.state]);

    useEffect( () => {
        if(status.name === 'verifyUserAttribute' && status.status === 'FINISHED'){
            setOpen(false);
            history.goBack();
        }
    });

    const handleChange = (e) => {
        setCode(e.target.value);
    }

    const handleVerify = () => {
        if(!code){
            setError("Invalid Verification Code");
            return;
        }

        const data = {
            attr: 'email',
            value: code,
        }
        
        props.verifyuserAttribute(data);
    }

    const handleClose = (e) => {
        e.stopPropagation();
        setOpen(false);
        history.goBack();
    }

    return (
        <Dialog open={open} fullWidth maxWidth="md">
            <DialogTitle>
                Verification
            </DialogTitle>
            <DialogContent>
                <TextField variant='outlined' color='primary' name='code' onChange={handleChange} placeholder="Enter Code sent to your mail" 
                    label="Verification Code" fullWidth className={classes.text} error={error ? true : false} placeholder={error ? error : null}
                />
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' color='secondary' onClick={handleClose}>
                    Close
                </Button>
                <Button variant='contained' color='primary' onClick={handleVerify}>
                    Verify
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth
});

const mapActionsToProps = {
    updateUserAttributes,
    verifyuserAttribute,
}

export default connect(mapStateToProps, mapActionsToProps)(VerifyAttribute);