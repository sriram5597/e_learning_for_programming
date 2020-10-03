import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { UPDATE_SAMPLE_TESTCASE } from '../../../../../graphql/mutation/problemMutation';

//draft-js
import { convertFromRaw, EditorState, convertToRaw } from 'draft-js';

//util
import TextEditor from '../../../../../utils/customEditor/text_editor/TextEditor';

//MUI
import { Typography, TextField, Button, CircularProgress, Backdrop } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    field: {
        position: 'relative',
        margin: 15,
        left: '10%',
        width: '75%',
        right: '15%',
        backgroundColor: '#ffffff',
        padding: 15,
    },

    text: {
        position: 'relative',
        margin: 15,
        width: '95%'
    },

    explain: {
        position: 'relative',
        left: '10%',
    },

    actions: {
        position: 'relative',
        float: 'right',
        marginRight: 20,
    },

    button: {
        position: 'relative',
        left: '80%',
        marginBottom: 10,
    },

    backdrop: {
        zIndex: 4,
        color: '#fff',
    }
}));

const SampleTestcase = (props) => {
    const classes = useStyles();

    const { open, index, problem } = props;

    const update = props.update ? true : false;

    const edState = update ? EditorState.createWithContent(convertFromRaw(JSON.parse(problem.sample_testcases[index].explanation))) : EditorState.createEmpty();
    const [editorState, setEditorState] = useState(edState);
    const [sampleTest, setSampleTest] = useState({
        input: update ? problem.sample_testcases[index].input : "",
        output: update ? problem.sample_testcases[index].output : "",
    });

    const [updateSampleTestcase, { loading }] = useMutation(UPDATE_SAMPLE_TESTCASE, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            props.updateAfterMutation(cache, data, 'updateSampleTestcase');
        }
    });

    const handleSampleTest = (e) => {
        setSampleTest({
            ...sampleTest,
            [e.target.name]: e.target.value
        });
    }

    const addSample = (e) => {
        let data = {
            ...sampleTest,
            explain: JSON.stringify(convertToRaw(editorState.getCurrentContent()))
        }
        
        updateSampleTestcase({
            variables: {
                problem_id: problem.problem_id,
                op: 'add',
                sample_testcase: {
                    ...data
                }
            }
        });
        
        props.handleClose();
    }

    const handleEditor = (editorState) => {
        setEditorState(editorState);
    }

    const updateSample = () => {
        let data = {
            ...sampleTest,
            explain: JSON.stringify(convertToRaw(editorState.getCurrentContent()))
        }

        updateSampleTestcase({
            variables: {
                problem_id: problem.problem_id,
                op: 'update',
                index,
                sample_testcase: {
                    ...data
                }
            }
        });

        props.handleClose();
    }
    
    return (
        <div>
            <Dialog open={open} fullWidth maxWidth="lg">
                <DialogTitle>
                    <Typography color='primary'>
                        Add Sample Test Case
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <fieldset className={classes.field}>
                        <legend>
                            <Typography variant="h6">
                                Sample Testcases
                            </Typography>
                        </legend>
                        <span>
                            <TextField variant='outlined' color='primary' onChange={handleSampleTest} name='input' className={classes.text}
                                    placeholder="Enter Sample Input" multiline rows="5" label="Sample Input"
                                    value={sampleTest.input}
                            />
                            <TextField variant="outlined" color='primary' onChange={handleSampleTest} name='output' className={classes.text}
                                placeholder="Enter Sample Output" multiline rows="5" label="Sample Output"
                                value={sampleTest.output}
                            />
                            <span>
                                <Typography variant="h6" className={classes.explain}>
                                    Explanation
                                </Typography>
                                <TextEditor propsUpdate={handleEditor} placeholder="Write your Explanation"
                                    editorState={editorState}
                                />
                            </span>
                        </span>
                    </fieldset>
                </DialogContent>
                <DialogActions>
                    <span className={classes.actions}>
                        <Button variant="contained" color="primary" onClick={update ? updateSample : addSample}>
                            {
                                update ? "Update" : "Add Sample"
                            }
                        </Button>
                    </span>
                    <span className={classes.actions}>
                        <Button variant="outlined" color="secondary" onClick={props.handleClose}>
                            Cancel
                        </Button>
                    </span>
                </DialogActions>
            </Dialog>
            <Backdrop open={loading} className={classes.backdrop}>
                <CircularProgress color='primary' size={50} />
            </Backdrop>
        </div>
    )
}

export default SampleTestcase;