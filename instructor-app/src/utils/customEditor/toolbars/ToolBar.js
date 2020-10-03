import React from 'react';

//mui
import { Button } from '@material-ui/core';

//draft-js
import { RichUtils, EditorState } from 'draft-js';

//components
import { inlineStyles, textAlignStyles, BlockStyles  } from './constants';
import { ToolbarItem, Container } from './common';
import HeaderDropdown from './components/HeaderDropdown';

//colors
import { colors } from '../colors';
import ColorPicker from 'draft-js-color-picker';

const ToolBar = (props) => {
    const { editorState, updateEditorState, picker } = props;
    
    const applyInlineStyle = (style)  => {
        const editorStateFocused = EditorState.forceSelection(editorState, editorState.getSelection());
        
        updateEditorState(RichUtils.toggleInlineStyle(editorStateFocused, style));
    }

    const isActive = (style) => {
        const currentStyle = editorState.getCurrentInlineStyle();
        return currentStyle.has(style);
    }

    const applyBlockStyle = (type) => {
        const editorStateFocused = EditorState.forceSelection(editorState, editorState.getSelection());
        updateEditorState(RichUtils.toggleBlockType(editorStateFocused, type));
    }

    const applyColor = (color) => {
        const newEditorState = EditorState.forceSelection(editorState, editorState.getSelection());
        updateEditorState(newEditorState);
        picker.addColor(color);
    }

    return (
        <Container>
            {
                inlineStyles.map( (item, index) => {
                    return (
                        <ToolbarItem isActive={isActive(item.style)} key={index} 
                                onClick={() => applyInlineStyle(item.style)}
                        >
                            {item.icon || item.label}
                        </ToolbarItem>
                    )
                })
            }
            <HeaderDropdown editorState={editorState} updateEditorState={updateEditorState}/>

            {
                textAlignStyles.map( (item, index) => {
                    return (
                        <span key={index}>
                            <ToolbarItem key={index} isActive={false} onClick={() => applyBlockStyle(item.type)}>
                                {item.icon || item.label}
                            </ToolbarItem>
                        </span>
                    )
                })
            }

            {
                BlockStyles.map( (item, index) => {
                    return (
                        <span key={index}>
                            <ToolbarItem key={index} isActive={false} onClick={() => applyBlockStyle(item.type)}>
                                {item.icon}
                            </ToolbarItem>
                        </span>
                    )
                })
            }
            
            <span>
                <ColorPicker toggleColor={(color) => applyColor(color)} presetColors={colors} 
                        color={picker.currentColor(editorState)}        
                />
            </span>
            <span>
                <Button onClick={picker.removeColor}>
                    Remove Color
                </Button>
            </span>
        </Container>
    );
}

export default ToolBar;