import React, { useState } from 'react';

//styles
import styled from 'styled-components';
import { getBlockStyles, getBlockRenderer } from '../CustomRenders';

//import './rich_editor.css';
import '../custom_styles.css';

//draft-js
import { EditorState, Editor, RichUtils } from 'draft-js';
import { colorPickerPlugin } from 'draft-js-color-picker';

//components
import ToolBar from '../toolbars/ToolBar';

const Wrapper = styled.div`
    display: block;
    margin: 20px;
    height: 500px;
`

const MdEditor = (props) => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const getEditorState = () => {
        return editorState;
    }

    const picker = colorPickerPlugin(setEditorState, getEditorState);

    const handleChange = (editorState) => {
        setEditorState(editorState);
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
            <div>
                <Editor
                    placeholder="Enter contents"
                    editorState={editorState}
                    onChange={handleChange}
                    handleKeyCommand={handleKeyCommand}
                    blockStyleFn={getBlockStyles}
                    blockRendererFn={getBlockRenderer}
                    customStyleFn={picker.customStyleFn}
                />
            </div>
        </Wrapper>
    );
}

export default MdEditor;