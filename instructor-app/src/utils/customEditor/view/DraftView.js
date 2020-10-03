import React from 'react';

import styled from 'styled-components';

import './view.css';

import { getBlockStyles, getBlockRenderer } from '../CustomRenders';

//draft-js
import { Editor, EditorState, convertFromRaw } from 'draft-js';

const ViewArea = styled.div`
    width:99%;
`;

const DraftView = (props) => {
    const editorState = (props.editorState) ? EditorState.createWithContent(convertFromRaw(props.editorState)) : EditorState.createEmpty()

    return (
        <ViewArea>
            <Editor
                editorState={editorState}
                blockStyleFn={getBlockStyles}
                blockRendererFn={getBlockRenderer}
                readOnly
            />
        </ViewArea>
    );
}

export default DraftView;