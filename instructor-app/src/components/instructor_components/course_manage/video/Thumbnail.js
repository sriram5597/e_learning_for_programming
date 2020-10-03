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

const Thumbnail = (props) => {
    const classes = useStyles();

    const fileUpload = useRef(null);

    const [thumbnail, setThumbnail] = useState();

    const handleChange = (e) => {
        setThumbnail(e.target.files[0]);
    }

    const handleClick = () => {
        fileUpload.current.click();
    }

    const handleSubmit = () => {
        let data = new FormData();

        data.append('thumbnail', thumbnail, thumbnail.name);
        data.append('filename', videoTitle);

        console.log("todo: mutation for uploading thumnail");
    }

    return (
        <div className={classes.root}>
            <div className={classes.controls}>
                <div className={classes.uploadButton}>
                    <Typography variant='h6'>
                        Upload Thumbnail
                    </Typography>
                    <IconButton color='primary' onClick={handleClick}>
                        <CloudUpload className={classes.icon} />
                    </IconButton>
                    <input type='file' onChange={handleChange} hidden={true} ref={fileUpload} />
                </div>
                {
                    thumbnail && (
                        <Typography variant='subtitle1'>
                            <strong>
                                File Added: 
                            </strong>
                            {thumbnail.name}
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
                    <UpdateSnackbar open={true} msg="Thumbnail Added" />
                )
            }
        </div>
    )
}

export default Thumbnail;