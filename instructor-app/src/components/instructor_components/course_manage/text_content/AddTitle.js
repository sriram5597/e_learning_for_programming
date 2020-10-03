import React, { useState, useEffect } from 'react';

//mui
import {  TextField, Select, MenuItem, Typography, Button } from '@material-ui/core';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        position: 'relative',
        margin: 50,
        left: '40%',
        top: '40%',
    },
    text: {
        position: 'relative',
        margin: 20,
        width: '80%',
    },
    select: {
        position: 'relative',
        margin: 20,
        width: '50%'
    },
}));

const AddTitle = (props) => {
    const classes = useStyles();

    const [state, setState] = useState({
        content_title: "",
        type: ""
    });
    const [open, setOpen] = useState(false);

    const types = [ 'PARAGRAPH', 'CODE', 'FLOWCHART'];

    useEffect(() => {
        setOpen(true)
        
    }, []);

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleContent = () => {
        let data = {
            type: state.type,
            title: state.content_title,
        };

        switch(data.type){
            case 'CODE':
                data.code = "";
                data.language = "java";
                break;

            case 'FLOWCHART':
                data.url = "";
                break;
            
            default:
                data.content = "";
        }
        
        setOpen(false);
        console.log(data);
        props.addContent(data);
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
            <DialogTitle>
                <Typography color='primary'>
                    Add Title
                </Typography>
            </DialogTitle>

            <DialogContent>
                <div>
                    <TextField name='content_title' label='Content Title' placeholder='Enter Content Title' onChange={handleChange} 
                        variant='outlined' color='primary' fullWidth className={classes.text}
                    />
                    <span>
                        <Select name='type' value={state.type} onChange={handleChange} className={classes.select} variant='outlined'>
                            {
                                types.map( (t, index) => {
                                    return (
                                        <MenuItem key={index} value={t}>
                                            {t}
                                        </MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </span>
                </div>
            </DialogContent>
            <DialogActions>
                <Button variant='contained' color='primary' onClick={handleContent}>
                    Add Title
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddTitle;