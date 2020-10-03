import React, {useEffect} from 'react';

//redux
import { connect } from 'react-redux';
import { uploadImage } from '../../../redux/actions/contentAction';

//mui
import { Button } from '@material-ui/core';

//draft-js
import { RichUtils, EditorState, AtomicBlockUtils } from 'draft-js';

//components
import { inlineStyles, textAlignStyles, uploadFiles } from './constants';
import { ToolbarItem, Container } from './common';
import HeaderDropdown from './components/HeaderDropdown';

//colors
import { colors } from '../colors';
import ColorPicker from 'draft-js-color-picker';

const ToolBar = (props) => {
    const {editorState, updateEditorState, picker} = props;
    let imageUrl = props.url;

    const applyInlineStyle = (style)  => {
        const editorStateFocused = EditorState.forceSelection(editorState, editorState.getSelection());
        
        updateEditorState(RichUtils.toggleInlineStyle(editorStateFocused, style));
    }

    const isActive = (style) => {
        const currentStyle = editorState.getCurrentInlineStyle();
        return currentStyle.has(style);
    }

    const insertImage = (url) => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'PHOTO',
            'IMMUTABLE',
            { src: url}
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
        updateEditorState(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
    }

    useEffect( () => {
        imageUrl = props.url;
        if(imageUrl !== "")
            insertImage(imageUrl);
    }, [props.url]);

    const applyAlignment = (type) => {
        const editorStateFocused = EditorState.forceSelection(editorState, editorState.getSelection());
        updateEditorState(RichUtils.toggleBlockType(editorStateFocused, type));
    }

    const handleImage = (e) => {
        const file = e.target.files[0];

        const formData = new FormData();
        
        formData.append('image', file, file.name);
        props.uploadImage(formData, "module1", "sub1");
    }

    const handleFileUpload = (e) => {
        document.getElementById('image-upload').click();
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
                            <ToolbarItem key={index} isActive={false} onClick={() => applyAlignment(item.type)}>
                                {item.icon || item.label}
                            </ToolbarItem>
                        </span>
                    )
                })
            }
            <ToolbarItem onClick={handleFileUpload}>
                <input type="file" id="image-upload" hidden={true} onChange={handleImage}/>
                {uploadFiles.icon}
            </ToolbarItem>
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

const mapStateToProps = (state) => ({
    url: state.content.imgSrc
});

const mapActionsToProps = {
    uploadImage
}

export default connect(mapStateToProps, mapActionsToProps)(ToolBar);