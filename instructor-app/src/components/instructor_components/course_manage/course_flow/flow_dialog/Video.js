import React, { useState } from 'react';

//components
import Subtitle from '../../video/Subtitle';
import Thumbnail from '../../video/Thumbnail';

//utils
import VideoPlayer from '../../../../../utils/video_player/VideoPlayer';
import TipButton from '../../../../../utils/TipButton';

//mui
import { DialogTitle, Dialog, DialogContent, IconButton, CircularProgress, DialogActions, Tabs, Tab } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { PlayCircleFilled, Cancel } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    icon: {
        fontSize: 80
    },

    iconButton: {
        position: 'relative',
        left: '30%',
    },

    head: {
        flexGrow: 1,
    }
}));

const Video = (props) => {
    const classes = useStyles();

    const { url } = props.source.source;

    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState(0);

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleChangeTab = (e, newValue) => {
        setTab(newValue);
    }

    const getComponent = () => {
        switch(tab){
            case 0: 
                return <VideoPlayer source={props.source.source.url} />

            case 1:
                return <Subtitle videoTitle={props.source.source_title} />

            case 2:
                return <Thumbnail videoTitle={props.source.source_title} />

            default:
                return null;
        }
    }

    return (
        <div>
            <IconButton onClick={handleOpen} className={classes.iconButton}>
                <PlayCircleFilled color='primary' className={classes.icon} />
            </IconButton>

            <Dialog open={open} maxWidth="lg" fullWidth>
                <DialogTitle>
                    <div>
                        <div className={classes.head}>
                            {props.source.source_title}
                            <TipButton onClick={handleClose} tip="close">
                                <Cancel color='secondary' />
                            </TipButton>
                        </div>
                        <Tabs value={tab} indicatorColor='primary' onChange={handleChangeTab} textColor="primary">
                            <Tab label="Video" />
                            <Tab label="subtitle" />
                            <Tab label="Thumbnail" />
                        </Tabs>
                    </div>
                </DialogTitle>
                <DialogContent>
                    {
                        url ? (
                            getComponent()
                        ) : (
                            <CircularProgress size={30} color='primary' />
                        )
                    }
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Video;