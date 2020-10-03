import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { UPDATE_PROBLEM } from '../../../../../graphql/mutation/problemMutation';

//utils
import DraftView from '../../../../../utils/customEditor/view/DraftView';

//draft-js
import { convertToRaw } from 'draft-js';

//components
import UpdateDialog from './UpdateDialog';
import TestcaseTab from './TestcaseTab';
import ScoreDialog from './update_dialogs/ScoreDialog';

//MUI
import { Typography, Paper, IconButton, CircularProgress, Button, Backdrop, } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//MUI/icons
import { Edit } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    paper: {
        margin: 20,
        padding: 20,
        minHeight: 500,
    },

    content: {
        position: 'relative',
        marginTop: '20px',  
        marginBottom: '20px',
    },

    title: {
        display: 'flex',
        width: '30%',
        height: 60,
    },

    editButton: {
        height: 40
    },

    labels: {
        paddingTop: 5,
    },

    loading: {
        position: 'relative',
        left: '40%', 
        top: '30%',
    },

    head: {
        display: 'flex',
        justifyContent: 'space-between',
    },

    sampleTest: {
        position: 'relative',
        margin: 25,
    },

    button: {
        marginRight: 15,
    },

    backdrop: {
        zIndex: 4,
        color: '#fff',
    }
}));

const PreviewProblem = (props) => {
    const classes = useStyles();

    const problem = props.source.source;

    const[mouseOverIndex, setMouseOverIndex] = useState(null);
    const [editField, setEditField] = useState(null);
    const [open, setOpen] = useState(false);
    const [data, setData] = useState({
        ...problem
    });
    const [isModified, setIsModified] = useState(false);
    const[isTextEditor, setIsTextEditor] = useState(false);

    const[updateProblem, { loading }] = useMutation(UPDATE_PROBLEM, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            props.updateAfterMutation(cache, data, 'updateProblem');
        },
    });

    const labels = {
        problem_description: 'Description',
        input_format: 'Input Formant',
        output_format: 'Output Format',
        constraints: 'Constraints',
        need_flowchart: 'Need Flowchart'
    }

    useEffect( () => {
        setData({
            problem_description: JSON.parse(problem.problem_description),
            input_format: JSON.parse(problem.input_format),
            output_format: JSON.parse(problem.output_format),
            constraints: JSON.parse(problem.constraints),
            need_flowchart: problem.need_flowchart  
        });
    }, []);

    useEffect( () => {
        if(editField !== 'need_flowchart'){
            setIsTextEditor(true);
        }
        else{
            setIsTextEditor(false);
        }
    }, [editField]);

    const handleEdit = (lab) => () => {
        setEditField(lab);
        setOpen(true);
    }

    const handleMouseIn = (ind) => () =>  {
        setMouseOverIndex(ind);
    }

    const handleMouseOut = () => {
        setMouseOverIndex(null);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleUpdate = () => {
        setOpen(false);
        let updateData = {};

        Object.keys(data).forEach( (d) => {
            switch(d){
                case 'need_flowchart':
                    if(data[d] !== problem[d])
                        updateData[d] = data[d];
                    break;
                
                case 'problem_id':
                    break;

                default:
                    if(JSON.stringify(data[d]) !== problem[d])
                        updateData[d] = JSON.stringify(data[d]); 
                    break;
            }
        });

        updateProblem({
            variables: {
                problem_id: problem.problem_id,
                problem: {
                    ...updateData
                }
            }
        });

        setIsModified(false);
    }

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
        setIsModified(true);
    }

    const handleEditorState = (editorState) => {
        data[editField] = convertToRaw(editorState.getCurrentContent());
        setIsModified(true);
    }

    const handleSolve = () => {
        props.setManage();
    }

    return ( 
        <div>
            <Backdrop open={loading} className={classes.backdrop} >
                <CircularProgress color='primary' size={50} />
            </Backdrop>
            <Paper className={classes.paper}>
                <div className={classes.head}>
                    <Typography variant='h4' color='primary'>
                        <strong>{props.source.source_title}</strong>
                    </Typography>
                    <div>
                        <ScoreDialog updateProblem={updateProblem} problem={problem} />
                        <Button color='primary' variant='contained' disabled={!isModified} onClick={handleUpdate} className={classes.button}>
                            Make Changes
                        </Button>
                        <Button color='primary' variant='contained' onClick={handleSolve} className={classes.button}>
                            Solve
                        </Button>
                    </div>
                </div>
                <div>
                    <Typography variant='subtitle1'>
                        Coins: <strong>{problem.coins}</strong>
                    </Typography>
                    <Typography variant='subtitle1'>
                        Xp Points: <strong>{problem.max_score}</strong>
                    </Typography>
                </div>
        
                {
                    Object.keys(labels).map( (lab, index) => {

                        return (
                            <div key={index} className={classes.content} >
                                <div className={classes.title} onMouseEnter={handleMouseIn(index)} onMouseLeave={handleMouseOut}>
                                    
                                    <Typography variant='h5' color='primary' className={classes.labels}>
                                        {labels[lab]}
                                    </Typography>
                                    {
                                        index === mouseOverIndex && (
                                            <IconButton onClick={handleEdit(lab)} color='primary' className={classes.editButton}>
                                                <Edit fontSize='small'/>
                                            </IconButton>
                                        )
                                    }
                                </div>
                                {
                                    lab === 'need_flowchart' ? (
                                        <Typography variant='body1'>
                                            {data[lab]}
                                        </Typography>
                                    ) : (
                                        <DraftView editorState={typeof data[lab] === 'object' ? data[lab] : JSON.parse(data[lab])} />
                                    )
                                }
                            </div>
                        )
                    })
                }
            </Paper>

            <TestcaseTab problem={problem} updateAfterMutation={props.updateAfterMutation} />
            
            <UpdateDialog field={editField} label={labels[editField]} value={data[editField]} open={open} handleClose={handleClose} 
                    handleChange={handleChange} editorState={isTextEditor ? data[editField] : null} handleEditorState={handleEditorState}
            />
        </div>
    )
}

export default PreviewProblem;