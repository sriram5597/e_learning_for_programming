import React, { useState } from 'react';
import PropTypes from 'prop-types';

//styles
import styled from 'styled-components';
import { getBlockStyles, getBlockRenderer } from '../CustomRenders';

import './editor.css';

//draft-js
import { Editor, RichUtils, EditorState } from 'draft-js';
import { colorPickerPlugin } from 'draft-js-color-picker';

//components
import ToolBar from '../toolbars/ToolBar';

const Wrapper = styled.div`
    display: block;
    margin: 20px;
    height: 400px;
`

const EditArea = styled.div`
    background-color: #fffef7;
    width:83%;
    margin:auto;
    box-shadow: 0px 2px 2px 2px rgba(0,0,0,0.5);
    height: 300px;
    overflow-x: hidden;
    overflow-y: scroll;
`;

const TextEditor = (props) => {
    const edState = (props.editorState) ? props.editorState : EditorState.createEmpty();
    
    const [editorState, setEditorState] = useState(edState);

    const getEditorState = () => {
        return editorState;
    }

    const picker = colorPickerPlugin(setEditorState, getEditorState);

    const handleChange = (editorState) => {
        setEditorState(editorState);
        props.propsUpdate(editorState);
    }

    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        
        if(newState){
            handleChange(newState);
        }
    }

    return (
        <Wrapper>
            <div className="toolbar">
                <ToolBar
                    editorState={editorState}
                    updateEditorState={setEditorState}
                    picker={picker}
                />
            </div>
            <EditArea>
                <Editor
                    placeholder={props.placeholder}
                    editorState={editorState}
                    onChange={handleChange}
                    handleKeyCommand={handleKeyCommand}
                    blockStyleFn={getBlockStyles}
                    blockRendererFn={getBlockRenderer}
                    customStyleFn={picker.customStyleFn}
                />
            </EditArea>
        </Wrapper>
    );
}

TextEditor.propTypes = {
    propsUpdate: PropTypes.func.isRequired,
}

export default TextEditor;