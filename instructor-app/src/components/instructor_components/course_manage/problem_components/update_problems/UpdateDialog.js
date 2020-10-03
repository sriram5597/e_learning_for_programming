import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

//draft-js
import { EditorState, convertFromRaw } from 'draft-js';

//utils
import TextEditor from '../../../../../utils/customEditor/text_editor/TextEditor';

//MUI
import { Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem  } from '@material-ui/core';
import { Typography, Button, TextField } from '@material-ui/core';

const UpdateDialog = (props) => {
    const { field, value, label, open } = props;

    const [editorState, setEditorState] = useState();

    useEffect( () => {
        if(field && field !== 'need_flowchart'){
            setEditorState(EditorState.createWithContent(convertFromRaw(props.editorState)));
        }
    }, [props.editorState]);

    const handleEditorState = (editorState) => {
        setEditorState(editorState);
        props.handleEditorState(editorState);
    }

    const handleClose = () => {
        props.handleClose();
    }

    return (
        <Dialog maxWidth="lg" fullWidth open={open} onClose={props.handleClose}>
            <DialogTitle>
                <Typography color='primary'>
                    {`Update ${label}`}
                </Typography>
            </DialogTitle>
            <DialogContent>
                {
                    field !== 'need_flowchart' ? (
                        editorState ? (
                            <TextEditor editorState={editorState} propsUpdate={handleEditorState} />
                        ) : (
                            "Loading..."
                        )
                    ) : (field === 'need_flowchart' ) ? (
                        <Select defaultValue={value} name={field} fullWidth variant='outlined' onChange={props.handleChange} color='primary'>
                            <MenuItem value="NO">No</MenuItem>
                            <MenuItem value="YES">Yes</MenuItem>
                        </Select>
                    ) : (
                        <TextField name={field} variant='filled' defaultValue={value} multiline rows="6" 
                            placeholder={`Enter ${label}`} fullWidth onChange={props.handleChange}
                        />
                    )
                }
            </DialogContent>
            <DialogActions>
                <Button variant='contained' color='primary' onClick={handleClose}>
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    )
}

UpdateDialog.propTypes = {
    field: PropTypes.string,
    label: PropTypes.string,
    open: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleEditorState: PropTypes.func.isRequired
}

export default UpdateDialog;