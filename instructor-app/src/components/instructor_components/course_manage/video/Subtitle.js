import React, { useState, useRef } from 'react';

//utils
import UpdateSnackbar from '../../../../utils/UpdateSnackbar';

//mui
import { Button, CircularProgress, IconButton, Typography } from '@material-ui/core';

//mui/icons
import { CloudUpload } from '@material-ui/icons';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: 10,
        height: '15vh'
    },
    controls: {
        margin: 50,
        left: '30%',
    },
    uploadButton: {
        margin: 20,
    },
    icon: {
        margin: 10,
        fontSize: 50,
    }
}));

const Subtitle = (props) => {
    const classes = useStyles();

    const fileUpload = useRef(null);

    const [subtitle, setSubtitle] = useState();

    const handleChange = (e) => {
        setSubtitle(e.target.files[0]);
    }

    const handleClick = () => {
        fileUpload.current.click();
    }

    const handleSubmit = () => {
        let data = new FormData();

        data.append('sub-title', subtitle, subtitle.name);
        data.append('filename', videoTitle);

        console.log('todo: Write upload query');
    }

    return (
        <div className={classes.root}>
            <div className={classes.controls}>
                <div className={classes.uploadButton}>
                    <Typography variant='h6'>
                        Upload Subtitle
                    </Typography>
                    <IconButton color='primary' onClick={handleClick}>
                        <CloudUpload className={classes.icon} />
                    </IconButton>
                    <input type='file' onChange={handleChange} label="Upload Subtitle" hidden={true} ref={fileUpload} />
                </div>
                {
                    subtitle && (
                        <Typography variant='subtitle1'>
                            <strong>
                                File Added: 
                            </strong>
                            {subtitle.name}
                        </Typography>
                    )
                }
                <Button variant='contained' color='primary' onClick={handleSubmit} disabled={loading}>
                    Update
                    {
                        loading && (
                            <CircularProgress size={20} color='primary' />
                        )
                    }
                </Button>
            </div>    
            {
                completed && (
                    <UpdateSnackbar open={true} msg="Subtitle Added" />
                )
            }
        </div>
    )
}

export default Subtitle;