import React, { useState } from 'react'

//graphql
import { useMutation } from '@apollo/react-hooks';
import { UPDATE_QUESTION } from '../../../../graphql/mutation/mcqMutations';

//components
import MCQOption from './MCQOption';
import AddMCQ from './AddMCQ';
import DeleteMCQ from './DeleteMCQ';
import Test from './Test';
import ScoreDialog from './ScoreDialog';

//utils
import TipButton from '../../../../utils/TipButton';

//MUI
import { Typography, Button, Paper } from '@material-ui/core';
import { Switch, TextField } from '@material-ui/core';
import { Dialog, DialogContent, DialogActions, DialogTitle } from '@material-ui/core';

//MUI/icons
import { Edit, CheckCircle, Cancel } from '@material-ui/icons';

//MUI/styles
import { makeStyles } from '@material-ui/styles';
import { GET_FLOW } from '../../../../graphql/queries/courseFlowQueries';

const useStyles = makeStyles( (theme) => ({
    root: {
        margin: 30,
    },
    panel: {
        position: "relative",
        width: "90%",
        padding: 20,
        margin: 20,
    },
    container: {
        wordWrap: 'word-break',
    },
    menu: {
        position: "relative",
        width: "95%"
    },
    card: {
        position: "relative",
        height: 500,
        marginRight: 20
    },
    question: {
        margin: 20,
        wordWrap: 'word-break',
    },
    saveButton: {
        margin: 20
    },
    addButton: {
        position: "relative",
        margin: 20,
        width: "80%",
    },
    explain: {
        position: "relative",
        marginTop: 15,
        wordWrap: 'word-break',
    },
    questionsHead: {
        display: 'flex',
    },
    buttonGroup: {
        display: 'flex',
        spacing: 2,
    }
}));

const MCQ = (props) => {
    const classes = useStyles();
    
    const { title, sourceIndex, course_id } = props;

    const [updateQuestion] = useMutation(UPDATE_QUESTION, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            props.updateAfterMutation(cache, data, 'updateQuestion');
        }
    });

    const mcq = props.source.source;

    const [isEdit, setIsEdit] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState();
    const [selectedExplain, setSelectedExplain] = useState();
    const [index, setIndex] = useState();
    const [test, setTest] = useState(true);

    const [updatedQuest, setUpdatedQuest] = useState();
    const [updatedAnswer, setUpdatedAnswer] = useState();
    const [updateAnswer, setUpdateAnswer] = useState(false);
    const [updatedExplanation, setUpdatedExplanation] = useState();

    const update = (data, index) => {
        updateQuestion({
            variables: {
                mcq_id: mcq.mcq_id,
                op: 'update',
                index,
                question: {
                    ...data
                }
            }
        });
    }

    const handleEdit = () => {
        setIsEdit(!isEdit);
    }

    const handleUpdateQuestion = (m, ind) => () => {
        setOpen(true);
        setSelectedQuest(m.question);
        setIndex(ind);
    }

    const handleUpdateExplanation = (m, ind) => () => {
        setOpen(true);
        setSelectedExplain(m.explanation);
        setIndex(ind);
    }
    
    const handleClose = () => {
        setSelectedQuest(undefined);
        setOpen(false);
    }

    const handleQuestText = (event) => {
        setUpdatedQuest(event.target.value);
    }

    const handleExplainText = (event) => {
        setUpdatedExplanation(event.target.value);
    }

    const handleUpdateAnswer = () => {
        setUpdateAnswer(true);
    }

    const handleAnswer = (e) => {
        setUpdatedAnswer(e.target.value);
    }

    const handleTest = () => {
        setTest(true);
    }

    const handleCancelTest = () => {
        setTest(false);
    }

    const handleSubmitAnswer = (index) => () => {
        const data = {
            answer: updatedAnswer,
        }

        update(data, index);

        setUpdateAnswer(false);
    }

    const handleCancelOption = () => {
        setUpdateAnswer(false);
    }

    const handleSubmit = () => {
        let data = {};

        if(updatedQuest){
            data['question'] = updatedQuest;
        }

        if(updatedExplanation){
            data['explanation'] = updatedExplanation;
        }

        update(data, index);

        setUpdatedQuest(undefined);
        setUpdatedExplanation(undefined);
        setOpen(false);
    }
    
    return (
        <div className={classes.root}>
            <div>
                <div>
                    <Typography variant='h4' color='primary'>
                        {props.source.source_title}
                    </Typography>
                    <Typography variant='subtitle1'>
                        Xp Points: <strong>{mcq.points}</strong>
                    </Typography>
                    {
                        test ? (
                            <Button variant='contained' color='secondary' onClick={handleCancelTest}>
                                Cancel Test
                            </Button>        
                        ) : (
                            <div className={classes.buttonGroup}>
                                <ScoreDialog source={props.source} updateAfterMutation={props.updateAfterMutation} />
                                <Button variant='contained' color='primary' onClick={handleTest}>
                                    Take Test
                                </Button>
                            </div>
                        )
                    }
                </div>
                <div>
                <div className={classes.questionsHead}>
                    <Typography variant='h4'>
                        Questions
                    </Typography>
                    {
                        !test && (
                            <AddMCQ source={props.source} updateAfterMutation={props.updateAfterMutation} />
                        )
                    }
                </div>
                    {
                        !test ? (
                            <div>
                                {
                                    mcq.questions && mcq.questions.length > 0 && (
                                        <Typography variant="body2">
                                            <Switch color="primary" onClick={handleEdit}/>
                                            Edit
                                        </Typography>
                                    )
                                }
                            
                                {
                                    mcq.questions && mcq.questions.length > 0 ? (
                                        mcq.questions.map( (m, index) =>{
                                            return (
                                                <Paper className={classes.panel} key={index}>
                                                    <div>
                                                        <Typography variant="h5" color="primary">
                                                            {`Question ${index + 1}`}
                                                        </Typography>
                                                        {
                                                            isEdit && <DeleteMCQ index={index} source={props.source} 
                                                                updateAfterMutation={props.updateAfterMutation} 
                                                            />
                                                        }
                                                    </div>
                                                    <div className={classes.content}>
                                                        <Typography variant="h6" noWrap={false} display="block" className={classes.question}>
                                                            {m.question}
                                                            <span>
                                                                {
                                                                    isEdit && (
                                                                        <TipButton tip="edit question" btnColor="primary" 
                                                                            onClick={handleUpdateQuestion(m, index)}
                                                                        >
                                                                            <Edit/>
                                                                        </TipButton>
                                                                    )
                                                                }
                                                            </span>
                                                        </Typography>                                        
                                                
                                                        {
                                                            m.type === 'MCQ' ? (
                                                                <div>
                                                                    <MCQOption mcq={m} isEdit={isEdit} index={index} source={props.source}
                                                                        update={update}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <Typography variant='h6' color='primary'>
                                                                        Answer
                                                                    </Typography>
                                                                    {
                                                                        updateAnswer ? (
                                                                            <span>
                                                                                <TextField fullWidth variant='outlined' defaultValue={m.answer} 
                                                                                    onChange={handleAnswer}
                                                                                />
                                                                                <TipButton tip="Ok" btnColor="primary" 
                                                                                    onClick={handleSubmitAnswer(index)} 
                                                                                    disabled={m.answer !== updatedAnswer ? false : true}
                                                                                >
                                                                                    <CheckCircle/>
                                                                                </TipButton>
                                                                                <TipButton tip="cancel" btnColor="secondary" 
                                                                                    onClick={handleCancelOption}
                                                                                >
                                                                                    <Cancel/>
                                                                                </TipButton>
                                                                            </span>
                                                                        ) : (
                                                                            <Typography variant='subtitle1'>
                                                                                <strong>
                                                                                    {m.answer}
                                                                                </strong>
                                                                                {
                                                                                    isEdit && (
                                                                                        <TipButton tip="edit explanation" btnColor="primary" 
                                                                                            onClick={handleUpdateAnswer}
                                                                                        >
                                                                                            <Edit/>
                                                                                        </TipButton>
                                                                                    )
                                                                                }
                                                                            </Typography>
                                                                        )
                                                                    }
                                                                </div>
                                                            )
                                                        }
                                                        <div className={classes.explain}>
                                                            <Typography variant="h6" color="primary">
                                                                Explanation
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {m.explanation}
                                                                    {
                                                                        isEdit && (
                                                                            <TipButton tip="edit explanation" btnColor="primary" 
                                                                                onClick={handleUpdateExplanation(m, index)}
                                                                            >
                                                                                <Edit/>
                                                                            </TipButton>
                                                                        )
                                                                    }
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </Paper>
                                            )
                                        })
                                    ) : (
                                        <Typography variant='h6' color='secondary'>
                                            No Questions added
                                        </Typography>
                                    ) 
                                }
                            </div>
                        ) : (
                            <Test source={props.source} />
                        )
                    }
                </div>
            </div>
        
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>
                    <Typography varaint="h6" color="primary">
                        {
                            selectedQuest ? "Question" : "Explanation"
                        }
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <TextField name={selectedQuest ? "question" : "explanation"} variant="outlined" rows="6"
                            fullWidth defaultValue={selectedQuest ? selectedQuest : selectedExplain}
                             onChange={selectedQuest ? handleQuestText : handleExplainText} multiline  />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Update
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default MCQ;