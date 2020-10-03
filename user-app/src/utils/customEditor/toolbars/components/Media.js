import React from 'react';

const Media = (props) => {
    const {contentState} = props;

    const entity = contentState.getEntity(props.block.getEntityAt(0));
    const { src } = entity.getData();

    return (
        <img src={src} height="500px" width="520px" alt="loading..." align='center'/>
    )
}

export default Media;