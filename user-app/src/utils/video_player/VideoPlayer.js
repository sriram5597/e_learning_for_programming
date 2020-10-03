import React, { useEffect, useRef, useState } from 'react';

import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-quality-levels';
import 'videojs-playbackrate-adjuster';
import 'videojs-hls-quality-selector';
import "./player.scss";

import awsVideoConfig from '../../aws-video-exports';

import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        position: 'relative',
        left: '10%',
        maxWidth: '60%'
    }
}));

const VideoPlayer = (props) => {
    const classes = useStyles();

    const player = useRef(null);
    const [playerState, setPlayerState] = useState();

    useEffect( () => {
        const videoPlayer = videojs(player.current);
        
        console.log(videoPlayer);
        setPlayerState(videoPlayer);
    }, []);

    useEffect( () => {
        if(playerState){
            playerState.src({
                src: props.source,
                type: "application/x-mpegURL"
            });
            
            if(typeof playerState.hlsQualitySelector === 'function'){
                playerState.hlsQualitySelector({
                    displayCurrentQuality: true
                }); 
            }   
        }
    }, [props.source, playerState]);

    return (
        <div data-videojs-player className={classes.root}>
            <video ref={player} className="video-js vjs-default-skin vjs-big-play-button" controls disablePictureInPicture
                datasetup='{ "playbackRates":  [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2] }'
            >
                hls not supported
            </video>
        </div>
    )
}

export default VideoPlayer;