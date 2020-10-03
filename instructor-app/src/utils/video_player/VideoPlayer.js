import React, { useEffect, useRef, useState } from 'react';

import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-hls-quality-selector';
import 'videojs-contrib-quality-levels';
import "./player.scss";

import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        position: 'relative',
        width: '60vh',
        height: '80vh',
        margin: 30
    }
}));

const VideoPlayer = (props) => {
    const classes = useStyles();

    const player = useRef(null);

    useEffect( () => {
        const videoPlayer = videojs(player.current);

        videoPlayer.hlsQualitySelector({
            displayCurrentQuality: true
        });

        return () => {
            console.log(videoPlayer);
            if(videoPlayer){
                videoPlayer.dispose();
            }
        }
    }, []);

    console.log(props.source);

    return (
        <div data-videojs-player className={classes.root}>
            <video ref={player} className="video-js " controls disablePictureInPicture
                dataSetup='{ "playbackRates":[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]}'
            >
                <source src={props.source} type="application/x-mpegURL" />
                hls not supported
            </video>
        </div>
    )
}

export default VideoPlayer;