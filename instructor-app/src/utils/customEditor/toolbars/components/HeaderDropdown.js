import React from 'react';
import { EditorState, RichUtils } from 'draft-js';

//constants
import {headerStyles} from '../constants';

//MUI
import { Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';

//styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    select: {
        position: "relative",
        display: 'flex',
        minWidth: 70,
        marginTop: 0,
        marginLeft: 1,
        marginRight: 5,
        top: "0%",
        height: 10,
    }
}))


const HeaderDropdown = (props) => {
    const classes = useStyles();

    const {editorState, updateEditorState} = props;
    
    const handleHeader = (event) => {
        const editorStateFocused = EditorState.forceSelection(editorState, editorState.getSelection());
        
        updateEditorState(RichUtils.toggleBlockType(editorStateFocused, event.target.value));
    }

    return (
        <span>
            <FormControl>
                <InputLabel id="header-label" className={classes.select}>Headers</InputLabel>
                <Select defaultValue={" "} onChange={handleHeader} className={classes.select}>
                    <MenuItem value={' '}>
                        None
                    </MenuItem>
                    {
                        headerStyles.map( (item, index) => {
                            return (
                                <MenuItem key={index} value={item.type}>
                                    <span className={item.style}>
                                        {item.label}
                                    </span>
                                </MenuItem>
                            )
                        })
                    }
            </Select>
            </FormControl>
        </span>
    )
}

export default HeaderDropdown;