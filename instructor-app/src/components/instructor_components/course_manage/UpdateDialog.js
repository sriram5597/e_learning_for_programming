import React from 'react';
import PropTypes from 'prop-types';

//MUI
import { Dialog, DialogTitle, DialogContent, DialogActions  } from '@material-ui/core';
import { Typography, Button, TextField } from '@material-ui/core';

const UpdateDialog = (props) => {
    const { field, value, label, open } = props;

    if(!props.editorState){
        return "Loading...";
    }

    return (
        <Dialog maxWidth="lg" fullWidth open={open}>
            <DialogTitle>
                <Typography color='primary'>
                    {`Update ${label}`}
                </Typography>
            </DialogTitle>
            <DialogContent>
                {
                    
                    <TextField name={field} variant='filled' defaultValue={value} multiline rows="6" 
                        placeholder={`Enter ${label}`} fullWidth onChange={props.handleChange}
                    />
                }
            </DialogContent>
            <DialogActions>
                <Button variant='contained' color='primary' onClick={props.handleClose}>
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    )
}

UpdateDialog.propTypes = {
    field: PropTypes.string,
    label: PropTypes.string,
    open: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleUpdate: PropTypes.func.isRequired,
    handleDescription: PropTypes.func.isRequired
}

export default UpdateDialog;