import React, { useState, useEffect } from 'react';

//utils
import VideoPlayer from '../../../../utils/video_player/VideoPlayer';

//mui
import { CircularProgress } from '@material-ui/core';

const StreamVideo = (props) => {
    console.log(props.source);
    return (
        <div>
            {
                props.source ? (
                    <VideoPlayer source={props.source} />
                ) : (
                    <CircularProgress size={40} color='primary' />
                )
            }
        </div>
    )
}

export default StreamVideo;